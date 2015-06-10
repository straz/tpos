var RED_ICON = 'http://labs.google.com/ridefinder/images/mm_20_red.png';
var INITIAL_ZOOM = 14;
var TRAIN_MARKERS = [];
var MY_MARKER = null;
var DEFAULT_POS = {lat: 42.346577, lng: -71.1247365}; // Beacon Hill, Boston

$(document).ready(init_map);

function init_map(){
  if (!navigator.geolocation){
    load_map_noLocation('Geolocation not supported by this browser');
  } else {
    navigator.geolocation.getCurrentPosition(load_map_foundLocation, load_map_noLocation);
  }
}

function update_my_position(){
  if (!navigator.geolocation){
    update_noLocation('Geolocation not supported by this browser');
  } else {
    navigator.geolocation.getCurrentPosition(update_pos_foundLocation, update_pos_noLocation);
  }
}

function load_map_noLocation(err){
  console.log('could not find location', err);
  load_map(DEFAULT_POS);
}

function update_pos_noLocation(err){
  console.log('could not find location', err);
}

function load_map_foundLocation(position){
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  load_map({lat: lat, lng: lng});
}

function update_pos_foundLocation(position){
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  update_my_marker({lat: lat, lng: lng});
}

function load_map(position) {
  var mapOptions = { center: position, zoom: INITIAL_ZOOM };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var map_p = $(document).data('MAP_P');
  map_p.resolve(map);
  init_my_marker(map);
  update_my_marker(position);
}


// called after map is loaded
function init_my_marker(map){
  MY_MARKER = new google.maps.Marker({
		icon: RED_ICON,
		position: DEFAULT_POS,
		map: map,
		title: 'Your current position'});
}

function update_my_marker(position){
  MY_MARKER.setPosition(position);
}

function lookupRouteColor(route_id){
  var properties = ROUTES[route_id];
  return properties['color'];
}

function getTrainIcon(bearing, route_id){
  return {
    fillOpacity: 0.8,
    scale: 4.5,
    strokeOpacity: 0,
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    rotation: parseInt(bearing),
    fillColor: lookupRouteColor(route_id)
  };
}

// wait till map is loaded, then draw marker
function drawTrainMarker(lat, lng, title, bearing, route_id){
  var map_loader = $(document).data('MAP_P');
  var icon = getTrainIcon(bearing, route_id);
  map_loader.done(function(){
		    var map = $(document).data('MAP');
		    var m = new google.maps.Marker({
		      position: {lat: lat, lng: lng},
		      map: map,
		      icon: icon,
		      title: title});
		    TRAIN_MARKERS.push(m);
		  });
  }

// Sets the map on all train markers.
function setAllMap(map) {
  for (var i in TRAIN_MARKERS) {
    TRAIN_MARKERS[i].setMap(map);
  }
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  setAllMap(null);
  TRAIN_MARKERS = [];
}
