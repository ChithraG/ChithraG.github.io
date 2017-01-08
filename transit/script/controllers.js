function createControllers(App){
	App.controller('mainController', function($scope, $routeParams) {
		$scope.menuOptions = [
			{value: 'activeRoutes', display: 'Active routes for today'},
			{value: 'transitTracker', display: 'Real-time tracker'},
		];

		$scope.action = $routeParams.action ? $routeParams.action : 'activeRoutes';
		$scope.linkClick = function($event, value){
			if(value === 'transitTracker'){
				$event.preventDefault();
			}
		}
	})

	App.controller('trackerController', function($scope, $routeParams, SharedData) {
		$scope.menuOptions = [
			{value: 'activeRoutes', display: 'Active routes for today'},
			{value: 'transitTracker', display: 'Real-time tracker'},
		];
		$scope.action = 'transitTracker';

		SharedData.provider = $routeParams.providerId;
		SharedData.route = $routeParams.routeId;
		SharedData.direction = $routeParams.directionId;
		SharedData.stopId = $routeParams.stopId;

		$scope.linkClick = function($event, value){
			if(value === 'transitTracker'){
				$event.preventDefault();
			}
		}
	});

	App.controller('trackerDirectiveController', function($scope, $q, $timeout, SharedData, transitAPI, transitMap) {
		transitMap.init();
		var timer;
		var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
		$scope.route = SharedData.route;
		$scope.direction = SharedData.direction;
		$scope.stopId = SharedData.stopId;
		
		transitMap.init();

		$scope.showAllBuses = transitMap.showBus;

		var reloadAgain = function(){
			timer = $timeout(function(){
				$scope.loadData(true);
			}, 15000);
		}

		$scope.loadData = function(isReload){
			$q.when(transitAPI.getDepartures($scope.route, $scope.direction, $scope.stopId))
			.then(function(data){
				var usedBlockNumbers = [];
				var newDepartures = _.map(data, function(newDeparture) {
					var label;
					if(_.indexOf(usedBlockNumbers, newDeparture.BlockNumber) != -1)
						label = '_';
					else {
						var oldDeparture = _.find($scope.departures, {id: newDeparture.BlockNumber});
						var label = oldDeparture && oldDeparture.label != '-' ? oldDeparture.label : labels.shift();
						usedBlockNumbers.push(newDeparture.BlockNumber);
					}
					return {
						id: newDeparture.BlockNumber,
						label: label,
						lat: newDeparture.VehicleLatitude,
						lng: newDeparture.VehicleLongitude,
						text: newDeparture.DepartureText,
					};
				});
				var unusedLabels = _.difference(_.map($scope.departures, 'label'), _.map(newDepartures, 'label'));
				_.remove(unusedLabels, (val) => val == '-')
				labels.push(...unusedLabels);
				$scope.departures = newDepartures;
				transitMap.updateMarkers($scope.departures);
				if (!isReload)
					transitMap.showBus(true);
				reloadAgain();
			}, function(reason) {
				console.log('Failed: ' + reason);
				reloadAgain();
			});
		}

		$scope.$on('$destroy', function () {
		   $timeout.cancel(timer);;
		});
	});

	App.controller('activeRoutesController', function($scope, $q, SharedData, transitAPI){
		$scope.providers = [];
		$scope.allRoutes = [];
		$scope.routesForProvider = [];
		$scope.directions = [];
		$scope.stops = [];

		$scope.currentProvider = undefined;
		$scope.currentRoute = undefined;
		$scope.currentDirection = undefined;

		$scope.loadProviders = function(){

			$q.when(transitAPI.getProviders())
			.then(function(data){
				$scope.providers = data;
				return transitAPI.getAllRoutes();
			})
			.then(function(data){
				$scope.allRoutes = data;
				if(SharedData.provider) {
					return $q.resolve(SharedData.provider);
				} else{
					return $q.reject();
				}
			}).then(function(provider){
				$scope.currentProvider = _.find($scope.providers, {Value: provider});
				$scope.routesForProvider = _.filter($scope.allRoutes, {ProviderID: provider});
				if(SharedData.route){
					return $q.resolve(SharedData.route);
				} else{
					return $q.reject();
				}
			}).then(function(route){
				$scope.currentRoute = _.find($scope.routesForProvider, {Route: route});
				return transitAPI.getDirections(route);
			}).then(function(data){
				$scope.directions = data;
				if(SharedData.direction){
					return $q.resolve(SharedData.direction);
				} else{
					return $q.reject();
				}
			}).then(function(direction){
				$scope.currentDirection = _.find($scope.directions, {Value: direction});
				$scope.stops = [];
				return transitAPI.getStopsForRoute($scope.currentRoute.Route, direction);
			}).then(function(data){
				$scope.stops = data;
			});
		}

		$scope.onChangeProvider = function($event, value){
			$event.preventDefault();
			SharedData.provider = value;
			$scope.currentProvider = _.find($scope.providers, {Value: value});
			$scope.routesForProvider = _.filter($scope.allRoutes, {ProviderID: value});
			
			$scope.currentRoute = undefined;
			$scope.currentDirection = undefined;
		}

		$scope.onChangeRoute = function($event, value) {
			$event.preventDefault();
			SharedData.route = value;
			$scope.currentRoute = _.find($scope.routesForProvider, {Route: value});
			$scope.directions = [];
			$scope.stops = [];

			$q.when(transitAPI.getDirections(value))
			.then(function(data){
				$scope.directions = data;
			});
			$scope.currentDirection = undefined;
		}

		$scope.onChangeDirection = function($event, value) {
			$event.preventDefault();
			SharedData.direction = value;
			$scope.currentDirection = _.find($scope.directions, {Value: value});
			$scope.stops = [];
			
			$q.when(transitAPI.getStopsForRoute($scope.currentRoute.Route, value))
			.then(function(data){
				$scope.stops = data;
			});
		}
	})
}