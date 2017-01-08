function createApiFactory(App){
	var makeCall = function($q, $http, url){
		var deferred = $q.defer();
	    $http.get(url + '?format=json')
	    .success(function(data){
	    	deferred.resolve(data);
	    	deferred.resolve(data);
	    })
	    .error(function(){
	    	deferred.reject();
	    })
	    return deferred.promise;
	}

	App.factory('transitAPI', function($q, $timeout, $http) {
	  return {
	    getProviders: function() {
		    return makeCall($q, $http, 'http://svc.metrotransit.org/nextrip/providers');
		},

		getAllRoutes: function() {
		    return makeCall($q, $http, 'http://svc.metrotransit.org/NexTrip/Routes');
		},

		getDirections: function(routeId) {
		    return makeCall($q, $http, 'http://svc.metrotransit.org/NexTrip/Directions/' + routeId);
		},

		getStopsForRoute: function(routeId, directionId) {
		    return makeCall($q, $http, 'http://svc.metrotransit.org/NexTrip/Stops/' + routeId + '/' + directionId);
		},

		getDepartures: function(routeId, directionId, stopId) {
		    return makeCall($q, $http, 'http://svc.metrotransit.org/NexTrip/' + routeId + '/' + directionId + '/' + stopId);
		}

	  };

	});

}

