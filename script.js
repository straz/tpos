MBTA_API_KEY = 'wX9NwuHnZU2ToO7GmGR9uw';
MBTA_API_URL = 'http://realtime.mbta.com/developer/api/v2/';

DEFAULT_ROUTE = 'All';

// sequence for select menu
ROUTE_ORDER = ['All', 'Red', 'Orange', 'Blue', 'Green-B', 'Green-C', 'Green-D', 'Green-E', 741, 742];

// map key onto properties
ROUTES = { 'All': {name: 'All'},
	   'Green-B': {name:'Green-B', color:'green'},
	   'Green-C': {name:'Green-C', color:'green'},
	   'Green-D': {name:'Green-D', color:'green'},
	   'Green-E': {name:'Green-E', color:'green'},
	   'Red':  {name:'Red', color:'red'},
	   'Orange': {name:'Orange', color:'orange'},
	   'Blue':{name:'Blue', color:'blue'},
	   '741': {name: 'Silver SL1', color: '#BBB'},
	   '742': {name: 'Silver SL2', color: '#BBB'}
	 };

// MAP_P is a promise that waits for the map to be loaded.
// When map is loaded, store it in document.MAP
MAP_P = $.Deferred().done(init_map);
$(document).data('MAP_P', MAP_P);

$(document).ready(function(){
		    init_routes();
		    $('button#refresh').click(plot_mbta);
		    $('#routes').change(plot_mbta);
		    plot_mbta();});

function init_map(map){
  $(document).data('MAP', map);
}

function change_route(){
  var val = null;
  vv = this;
  if (this == window){
    val = DEFAULT_ROUTE;
  } else {
    val = $(this).attr('value');
  }
  $('#routes').attr('value', val);
  $('#routes a.routename').text(val);
}

// reset menu of available routes
function init_routes(){
  $('li#routes ul li').remove();
  for (var i in ROUTE_ORDER){
    var key = ROUTE_ORDER[i];
    var val = ROUTES[key]['name'];
    var option = $('<option/>', {value:key}).html(val);
    if (DEFAULT_ROUTE == key){
	  option.attr('selected', true);
    }
    $('#routes').append(option);
  }
}

function plot_mbta() {
  deleteMarkers();
  update_my_position(); // refresh 'you are here' marker position
  var route = $('#routes').val();
  if (route == 'All'){
     for (var i in ROUTE_ORDER){
       var r = ROUTE_ORDER[i];
       if (r == 'All'){
	 continue;
       }
       plot_one_route(r);
     }
  } else {
    plot_one_route(route);
  }
}

function plot_one_route(route){
  var params = { route: route,
		 api_key: MBTA_API_KEY,
		 jsonpcallback: 'handle_callback',
		 format: 'jsonp'
	       };
  var url = get_mbta_api_url('predictionsbyroute', params);
  $.getJSON(url).always(handle_api);
}

// fcn = 'predictionsbyroute'
// params is an object
function get_mbta_api_url(fcn, params){
  return MBTA_API_URL + fcn + '?' + $.param( params );
}

function handle_api(data){
  if (data.status == 200){
    var msg = data.responseText;
    eval(msg);
  }
}

function handle_callback (data){
  MAP_P.done(function() {plot_data(data);});
}

function plot_data(data){
  var directions = data.direction;
  for (var dir_i in directions){
    var dir = directions[dir_i];
    var trips = dir.trip;
    for (var trip_i in trips){
      var trip = trips[trip_i];
      var vehicle = trip.vehicle;
      if (vehicle == undefined){
	continue;
      }
      var route_id = data.route_id;
      var bearing = vehicle.vehicle_bearing;
      var id = vehicle.vehicle_id;
      var lat = parseFloat(vehicle.vehicle_lat);
      var lng = parseFloat(vehicle.vehicle_lon);
      var timestamp = vehicle.vehicle_timestamp;
      drawTrainMarker(lat, lng, 'train #' + id, bearing, route_id);
      }
    }
}
