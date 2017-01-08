function createDirectives(App){
	App.directive('activeRoutes', function() {
		return {
			templateUrl: 'components/activeRoutes.html',
			controller: 'activeRoutesController'
		};
	})

	App.directive('tracker', function() {
		return {
			templateUrl: 'components/tracker.html',
			controller: 'trackerDirectiveController'
		}
	})
}