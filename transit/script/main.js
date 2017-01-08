function createApp(){
	var App = angular.module('app', ['ngRoute']);
	App.constant('_', window._);
	App.config(function($routeProvider) {
	    $routeProvider
		.when("/:action",{
			templateUrl: "components/main.html",
			controller: 'mainController'
		}).when("/",{
			templateUrl: "components/main.html",
			controller: 'mainController'
		}).when("/transitTracker/:providerId/:routeId/:directionId/:stopId",{
			templateUrl: "components/main.html",
			controller: 'trackerController'
		});
	});

	App.factory('SharedData', function(){
		return { };
	});

	return App;
}