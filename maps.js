var RED_ICON = 'http://labs.google.com/ridefinder/images/mm_20_red.png';
var INITIAL_ZOOM = 14;
var TRAIN_MARKERS = [];
var MY_MARKER = null;
var DEFAULT_POS = {lat: 42.346577, lng: -71.1247365}; // Beacon Hill, Boston
var BUS_ROUTE_TYPE = 3; // spec for route_type (https://developers.google.com/transit/gtfs/reference)

ROUTE_COLORS = {
  'GREEN':'green',
  'RED':'red',
  'BLUE':'blue',
  'ORANGE':'orange',
  'SILVER':'gray'
};

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
  var map_p = $(document).data('MAP_P');
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  map_p.done(function(){
	       update_my_marker({lat: lat, lng: lng});
	     });
}

var INFO_WINDOW = null;

function load_map(position) {
  var mapOptions = { center: position, zoom: INITIAL_ZOOM };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var map_p = $(document).data('MAP_P');
  init_my_marker(map);
  map_p.resolve(map);
  google.maps.event.addListener(map,'zoom_changed',
  			  function() {on_zoom(map);});
  map.data.loadGeoJson('data/MBTARapidTransitLines.json');
  colorize_routes(map);
  update_my_marker(position);
  INFO_WINDOW = new google.maps.InfoWindow({ content: $('<div/>').text('train info')[0] });
  // Click anywhere on an info window to close it
  google.maps.event.addDomListener(INFO_WINDOW.content,
				'click',
				function() { INFO_WINDOW.close();});
}


function colorize_routes(map){
  map.data.setStyle(function(feature){
		      var line = feature.getProperty('LINE');
		      var color = ROUTE_COLORS[line];
		      if (line == undefined){
			color = 'pink';
		      }
		      return {
			strokeColor: color,
			strokeOpacity:0.3,
			strokeWeight: 4
		      };
		    });
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

function getTrainIcon(bearing, route_id, route_type, zoom){
  var arrow = {
    fillOpacity: 0.8,
    scale: 4.5,
    strokeOpacity: 0,
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    rotation: parseInt(bearing),
    fillColor: lookupRouteColor(route_id)
  };
  if (route_id == 'Orange'){
    arrow.strokeOpacity = 0.8;
    arrow.strokeColor = '#444';
    arrow.strokeWeight = 1;
  }
  if (route_type == BUS_ROUTE_TYPE){
    arrow.strokeOpacity = 0.8;
    arrow.strokeColor = '#444';
    arrow.path = google.maps.SymbolPath.CIRCLE;
    arrow.strokeWeight = 1;
    arrow.scale = 7;
  }
  if (zoom < 13) {
    arrow.scale = arrow.scale * .75;
  }
  return arrow;
}

// wait till map is loaded, then draw marker
function drawTrainMarker(lat, lng, title, bearing, route_id, route_type){
  var map_loader = $(document).data('MAP_P');
  map_loader.done(function(){
		    var map = $(document).data('MAP');
		    var zoom = map.getZoom();
		    var m = new google.maps.Marker({
		      position: {lat: lat, lng: lng},
		      map: map,
		      icon: getTrainIcon(bearing, route_id, route_type, zoom),
		      title: title});
		    m['route_info'] = {
		      bearing: bearing,
		      route_id: route_id,
		      route_type: route_type
		    };
		    TRAIN_MARKERS.push(m);
		    // If you click on a train marker, open an Info Window
		    google.maps.event.addListener(m, 'click',
						  function() {
						    INFO_WINDOW.content.innerHTML = title;
						    INFO_WINDOW.open(map,m);
						    });
		  });
  }

function on_zoom(map){
  var zoom = map.getZoom();
  for (var i in TRAIN_MARKERS) {
    var marker = TRAIN_MARKERS[i];
    var route_info = marker.route_info;
    var icon = getTrainIcon(route_info.bearing,
			    route_info.route_id,
			    route_info.route_type,
			    zoom);
    marker.setIcon(icon);
  }
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
