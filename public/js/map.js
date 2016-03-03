//GLOBAL MAP VARIABLES
var infowindow = new google.maps.InfoWindow();
var map;
var autocomplete;
var myPlaces;
var myMarkers = [];

//INITIALIZE MAP/AUTOCOMPLETE
function initMap(theData, edit) {
  myPlaces = [];
  theData.forEach(function(obj){
    myPlaces.push(obj.doc);
  });
  console.log(myPlaces);
  console.log("Initializing map...");
  
  //MAP PROPERTIES
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 24.4667, lng: 54.3667},
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false
  });
  
  if (edit) {
    //AUTOCOMPLETE PROPERTIES
    $('body').prepend(" <input id='pac-input' class='controls' type='text' placeholder='Enter a location'> ");
    var input = /** @type {!HTMLInputElement} */(document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      var options = {
      types: ['establishment']
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.bindTo('bounds', map);
  }

  console.log("Putting existing data on the map");
  setMapOnPlaces([], map, edit);
  setMapOnPlaces(myPlaces, map, edit);
  
  if (edit) {
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
      
//      console.log(myObj.num);

  //Mildly better syntax for below   
  //    if(myPlaces.every(function(found){
  //      found.place_id == myObj.place_id
  //    })) {
  //      
  //    }

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
        initMapMarker(myObj, true, true);
      } 

    });
  }
}

function setMapOnPlaces(placeList, map, edit) {
  console.log("Setting Places on Map...");
  placeList.forEach(function(obj){
    initMapMarker(obj, false, true);
  })
  displayPlaces(placeList);
}

function displayPlaces(placeList) {
  var display = '';
  placeList.forEach(function(obj){
    display += "<div class='place-info'>" + "<a href='#' class = 'name' id='" + obj.place_id + "'>" + obj.name + "</a>" + "<p class = 'phone'>" + obj.phone + "</p>" + "<p class = 'address'>" + obj.address + "</p>" + "</div>";
  });
 
  console.log(display);
  $('#list').html(display);
}

//set up a marker on the map, if temp = false then it is a marker from the database
function initMapMarker(myObj, temp, edit){

  //create new marker for place, center and erase input
  var marker = new google.maps.Marker({
    map: map,
    position: myObj.loc,
    anchorPoint: new google.maps.Point(0, -29),
    place_id: myObj.place_id, 
    temp: temp
//    icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + 'kk' + '|FF0000|000000'
//    label: myObj.num
  });
  
  myMarkers.push(marker);
  
  if (edit) {
    //create and open infowindow for new marker
    var saveID = "save-" + myObj.place_id;
    var deleteID = "delete-" + myObj.place_id;

    if (temp) {
      myObj.content = '<div><strong>' + myObj.name + '</strong><br>' + myObj.address + '<br>' + "<input id='" + saveID + "' type='button' value='Save'>" +  "<input id='" + deleteID + "' type='button' value='Delete'>";
    } else {
      myObj.content = '<div><strong>' + myObj.name + '</strong><br>' + myObj.address + '<br>' + "<input id='" + deleteID + "' type='button' value='Delete'>";
    }
  } else {
     myObj.content = '<div><strong>' + myObj.name + '</strong><br>' + myObj.address;
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
      
        displayPlaces(myPlaces);
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
        
        console.log("Waiting for couch confirmation...");
      }
      displayPlaces(myPlaces);
    });
  }
}