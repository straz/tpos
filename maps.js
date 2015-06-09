var RED_ICON = 'http://labs.google.com/ridefinder/images/mm_20_red.png';
var GREEN_ICON = 'http://labs.google.com/ridefinder/images/mm_20_green.png';
var ARROW = {
   //path: "M512 32l-480 480h288v512h384v-512h288z",
   //scale: .017
   //path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
   fillColor: 'green',
   fillOpacity: 0.8,
   scale: 4.5,
   strokeOpacity: 0
 };

var INITIAL_ZOOM = 14;
var TRAIN_MARKERS = [];

$(document).ready(init_location);

function init_location(){
  if (!navigator.geolocation){
    console.log('geolocation not supported by this browser');
    return;
  }
  navigator.geolocation.getCurrentPosition(foundLocation, noLocation);
}

function foundLocation(position){
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  initialize_maps(lat, lng);
}

// initialize map
function initialize_maps(lat, lng) {
  var mapOptions = { center: { lat: lat, lng: lng}, zoom: INITIAL_ZOOM };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var map_p = $(document).data('MAP_P');
  map_p.resolve(map);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push($('#legend')[0]);
  drawMarker(lat, lng, RED_ICON, 'Your current position');
  $('#legend').css('display', 'block');
}

function noLocation(err){
  console.log('could not find location', err);
  var default_lat = 42.346577;
  var default_lng = -71.1247365;
  initialize_maps(default_lat, default_lng);
}

// wait till map is loaded, then draw marker
function drawMarker(lat, lng, icon, title){
  var map_loader = $(document).data('MAP_P');
  map_loader.done(function(){
		    var map = $(document).data('MAP');
		    var m = new google.maps.Marker({
		      position: {lat: lat, lng: lng},
		      map: map,
		      icon: icon,
		      title: title});
		  });
  }

function lookupRouteColor(){
  var route = $('#legend select').val();
  var properties = ROUTES[route];
  return properties['color'];
}

// wait till map is loaded, then draw marker
function drawTrainMarker(lat, lng, title, bearing){
  var map_loader = $(document).data('MAP_P');
  var icon = JSON.parse(JSON.stringify(ARROW));
  icon.path = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
  icon.rotation = parseInt(bearing);
  icon.fillColor = lookupRouteColor();
  map_loader.done(function(){
		    var map = $(document).data('MAP');
		    var m = new google.maps.Marker({
		      position: {lat: lat, lng: lng},
		      map: map,
		      icon: icon,
		      title: title + ' dir:' + bearing + '\u00B0'});
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
