//GLOBAL MAP VARIABLES
var infowindow;
var map;
var autocomplete;
var myPlaces;

//INITIALIZE MAP/AUTOCOMPLETE
function initMap(theData) {
  myPlaces = theData;
  console.log(myPlaces);
  console.log("Initializing map...");
  
  //MAP PROPERTIES
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 24.4667, lng: 54.3667},
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false
  });
  
  //AUTOCOMPLETE PROPERTIES
  var input = /** @type {!HTMLInputElement} */(document.getElementById('pac-input'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
//  autocomplete.setTypes('establishments');
  
  console.log("Putting existing data on the map");
  setMapOnPlaces(myPlaces, map);
 // displayPlaces(theData);
  
  console.log("Configuring map settings...");
  autocomplete.addListener('place_changed', function() {
    //get place and pull out desired properties in new object
    var place = autocomplete.getPlace(); 
    $('#pac-input').val('');
    
    var myObj = { 
      name: place.name,
      address: place.formatted_address,
      loc: place.geometry.location,
      id: place.id,
      place_id: place.place_id,
      phone: place.international_phone_number
    };
    
    map.setCenter(myObj.loc);
    initMapMarker(myObj, true);
  });
}

function setMapOnPlaces(placeList, map) {
  console.log("Setting Places on Map...")
  
  if(placeList != null) {
    for (var i = 0; i < placeList.length; i++) {
      var thePlace = placeList[i].doc;
      initMapMarker(thePlace, false);  
    }
  }
}

function displayPlaces(thePlaces) {
  var display = '';
  for (var i = 0; i < thePlaces.length; i++) {
    display += "<div>" + "<h1 id='name'>" + thePlaces[i].doc.name + "</h1>" + "<p>" + thePlaces[i].doc.phone + "</p>" + "<p>" + thePlaces[i].doc.address + "</p>" + "</div>";
  }
  console.log(display);
  $('main').html(display);
}

//set up a marker on the map, if temp = false then it is a marker from the database
function initMapMarker(myObj, temp){

  //create new marker for place, center and erase input
  var marker =  new google.maps.Marker({
    map: map,
    position: myObj.loc,
    anchorPoint: new google.maps.Point(0, -29)
  });
  
  //create and open infowindow for new marker
  infowindow = new google.maps.InfoWindow();
  var saveID = "save-" + myObj.id;
  var deleteID = "delete-" + myObj.id;

  if (temp) {
    myObj.content = '<div><strong>' + myObj.name + '</strong><br>' + myObj.address + '<br>' + "<input id='" + saveID + "' type='button' value='Save'>" +  "<input id='" + deleteID + "' type='button' value='Delete'>"
  } else {
    myObj.content = '<div><strong>' + myObj.name + '</strong><br>' + myObj.address + '<br>' + "<input id='" + deleteID + "' type='button' value='Delete'>"
  }
  
  infowindow.setContent(myObj.content);
  infowindow.open(map, marker);
  
  marker.addListener('click', function() {
    infowindow.setContent(myObj.content);
    infowindow.open(map, this);
  });
  
  if (temp) {
    $('#'+saveID).click(function(evt) {
      console.log("Clicked Save...");
      evt.stopPropagation();
      evt.preventDefault();
      evt.stopImmediatePropagation();

      if(myPlaces.length > 0) {
        myPlaces.push(myObj);
        saveData(myObj);
        console.log("First Place Added");
      }

      if(myPlaces.indexOf(myObj) == -1) {
        myPlaces.push(myObj);
        saveData(myObj);
        console.log("New Place Added");
      }
//      displayPlaces(myPlaces);
    });
  }
  
  $('#'+deleteID).click(function(){
    console.log("Entered delete...");
    if (temp) {
      marker.setMap(null);  
    } else {
      deleteData(myObj);
    }
//      displayPlaces(myPlaces);
  });
  
}



