function createMapFactory(App){
  var map;
  var markers = {};
  var firstBus;

  App.factory('transitMap', function($q, $timeout, $http) {
    return {
      init: function() {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
        });
        firstBus = undefined;
        markers = {};
      },

      updateMarkers: function(busesInfo, isReload){
        busesInfo = _.filter(busesInfo, function(busInfo){
          return busInfo.label != '-';
        });
        _.each(busesInfo, function(busInfo, index){
          if (!markers[busInfo.id]){
            if (busInfo.lat == 0 && busInfo.lng ==0)
              return;
            var gMarker = new google.maps.Marker({
              icon: 'images/bus.png',
              position: {
                lat: busInfo.lat,
                lng: busInfo.lng,
              },
              map: map,
            });
            var infoWindow = new google.maps.InfoWindow({
              content: '<b>' + busInfo.label + '</b>: ' + busInfo.id,
              closeBoxURL: '',
            });
            infoWindow.open(map, gMarker);
            gMarker.addListener('click', function() {
              infoWindow.open(map, gMarker);
            });
            markers[busInfo.id] = gMarker;
          } else {
            var gMarker = markers[busInfo.id];
            gMarker.setPosition({
              lat: busInfo.lat,
              lng: busInfo.lng,
            });
          }
          if (index === 0)
              firstBus = busInfo.id;
        });

        var deletedBuses = _.difference(_.keys(markers), _.map(busesInfo, a => _.toString(a.id)));
        _.each(deletedBuses, function(delBus){
          markers[delBus].setMap(null);
          delete markers[delBus];
        });

      },

      showBus: function(isShowFirst){
        if (_.size(markers) == 0){
          var msp = {lat: 44.9778, lng: -93.2650};
          map.setCenter(msp);
          return;
        }

        if (firstBus && (_.size(markers) == 1 || isShowFirst)){
          map.setCenter(markers[firstBus].getPosition());
          map.setZoom(15);
          return;
        }

        var bounds = new google.maps.LatLngBounds();
        _.each(markers, function(marker){
           bounds.extend(marker.getPosition());
        });
        map.fitBounds(bounds);
      }

    };

  });

}

