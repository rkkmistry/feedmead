//GLOBAL MAP VARIABLES
var infowindow = new google.maps.InfoWindow();
var map;
var autocomplete;
var myPlaces = [];
var myMarkers = [];

//INITIALIZE MAP/AUTOCOMPLETE
function initMap(theData) {
  theData.forEach(function(obj){
    myPlaces.push(obj.doc);
  });
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
    var options = {
    types: ['establishment']
  };
  autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.bindTo('bounds', map);

  console.log("Putting existing data on the map");
  setMapOnPlaces(myPlaces, map);
 // displayPlaces(theData);
  
  console.log("Configuring map settings...");
  autocomplete.addListener('place_changed', function() {
    myMarkers.forEach(function(marker){
      if (marker.temp) {
        marker.setMap(null);
      }
    });
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
    
    var notinArray = true;
    myPlaces.forEach(function(found) {
      if (found.place_id == myObj.place_id) {
        notinArray = false;
        myMarkers.forEach(function(foundMark){
          if(found.place_id == foundMark.place_id) {
            map.setCenter(found.loc);
            infowindow.setContent(found.content);
            infowindow.open(map, foundMark);
            return;
          }
        });
        return;
      }
    });
    
    if (notinArray) {
      map.setCenter(myObj.loc);
      initMapMarker(myObj, true);
    } 
    
  });
}

function setMapOnPlaces(placeList, map) {
  console.log("Setting Places on Map...");
  for (var i = 0; i < placeList.length; i++) {
    initMapMarker(placeList[i], false);  
  }
}

function displayPlaces(thePlaces) {
  var display = '';
  for (var i = 0; i < thePlaces.length; i++) {
    display += "<div>" + "<h1 id='name'>" + thePlaces[i].name + "</h1>" + "<p>" + thePlaces[i].phone + "</p>" + "<p>" + thePlaces[i].address + "</p>" + "</div>";
  }
  console.log(display);
  $('main').html(display);
}

//set up a marker on the map, if temp = false then it is a marker from the database
function initMapMarker(myObj, temp){

  //create new marker for place, center and erase input
  var marker = new google.maps.Marker({
    map: map,
    position: myObj.loc,
    anchorPoint: new google.maps.Point(0, -29),
    place_id: myObj.place_id, 
    temp: temp
  });
  
  myMarkers.push(marker);
  
  //create and open infowindow for new marker
  var saveID = "save-" + myObj.place_id;
  var deleteID = "delete-" + myObj.place_id;

  if (temp) {
    myObj.content = '<div><strong>' + myObj.name + '</strong><br>' + myObj.address + '<br>' + "<input id='" + saveID + "' type='button' value='Save'>" +  "<input id='" + deleteID + "' type='button' value='Delete'>";
  } else {
    myObj.content = '<div><strong>' + myObj.name + '</strong><br>' + myObj.address + '<br>' + "<input id='" + deleteID + "' type='button' value='Delete'>";
  }
  
  infowindow.setContent(myObj.content);
  infowindow.open(map, marker);
  
  marker.addListener('click', function() {
    infowindow.setContent(myObj.content);
    infowindow.open(map, this);
  });
    
  google.maps.event.addListener(infowindow, 'domready', function() {
    $('#'+deleteID).click(function(){
      console.log("Entered delete...");
      
      if (temp) {
        marker.setMap(null);
      } else {
        deleteData(myObj, function() {
          marker.setMap(null);
        });
        console.log(myObj);
        console.log(myPlaces.indexOf(myObj));
        myPlaces.splice(myPlaces.indexOf(myObj), 1);
      }
      
  //      displayPlaces(myPlaces);
    });
  });
  
  if (temp) {
    $('#'+saveID).click(function(evt) {
      console.log("Clicked Save...");
      evt.stopPropagation();
      evt.preventDefault();
      evt.stopImmediatePropagation();

      if(myPlaces.indexOf(myObj) == -1) {
        myPlaces.push(myObj);
        saveData(myObj, marker);
        
        console.log("Waiting for couch confitmation...");
      }
//      displayPlaces(myPlaces);
    });
  }
}