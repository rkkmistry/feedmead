//GLOBAL MAP VARIABLES
var infowindow = new google.maps.InfoWindow();
var map;
var autocomplete;
var myPlaces;
var myMarkers = [];
var user;
var actionColor = 'rgb(253, 197, 14)';
var textColor = 'rgb(38, 38, 38)';
var boxShadow = 'inset 0 1px 2px #aaa';
var lightGray = 'rgb(244, 244, 244)';

//INITIALIZE MAP/AUTOCOMPLETE
function initMap(theData, edit) {
  myPlaces = [];
  theData.forEach(function(obj) {
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
    $('body').prepend("<input id='pac-input' class='controls' type='text' placeholder='Enter a location'>");
    var input = /** @type {!HTMLInputElement} */(document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var options = {
      types: ['establishment']
    };
    
    autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.bindTo('bounds', map);
    
    autocomplete.addListener('place_changed', function() {
      myMarkers.forEach(function(marker) {
        if (marker.temp) {
          marker.setMap(null);
        }
      });
      
      var place = autocomplete.getPlace();
      $('#pac-input').val('');
      
      //get place and pull out desired properties in new object
      var myObj = { 
        name: place.name,
        address: place.formatted_address,
        loc: place.geometry.location,
        id: place.id,
        place_id: place.place_id,
        phone: place.international_phone_number,
        desc: "",
        user: user
      };
      
      //basic formatting for the address -- there is an issue here
      myObj.address = myObj.address.replace(" - ", " ");
      myObj.address = myObj.address.replace(" -", " ");
      myObj.address = myObj.address.replace("Abu Dhabi", "");
      myObj.address = myObj.address.replace("United Arab Emirates", "");

  //Mildly better syntax for below   
  //    if(myPlaces.every(function(found){
  //      found.place_id == myObj.place_id
  //    })) {
  //      
  //    }
      
      var notinArray = true;
      myPlaces.forEach(function(found) {
        if (found.user == user && found.place_id == myObj.place_id) {
          notinArray = false;
          myMarkers.forEach(function(foundMark){
            if(found.place_id == foundMark.place_id) {
              map.setCenter(found.loc);
              infowindow.setContent(found.content);
              infowindow.open(map, foundMark);
              return;
            }
          });
          //return;
        }
      });

      if (notinArray) {
        map.setCenter(myObj.loc);
        initMapMarker(myObj, true, true);
      } 

    });
  }
}

function setMapOnPlaces(placeList, map, edit, user) {
  console.log("The User is: " + user);
  
  $("#nav li").each(function() {  
    if($(this).text() == user) {
      $(this).css('background-color', lightGray);
      $(this).css('box-shadow', boxShadow);
    } else {
      $(this).css('background-color', 'white');
      $(this).css('color', textColor);
      $(this).css('box-shadow', 'none');
    }
  });
  
  //Get rid of any pre-existing event listeners 
  myMarkers.forEach(function(marker){
//    google.maps.event.clearInstanceListeners(marker);
    marker.setMap(null);
  });
  
  myMarkers = [];
  console.log("Setting Places on Map...");
  var thisMap = [];
  
  placeList.forEach(function(obj){
    if (obj.user === user){
      thisMap.push(obj);
      initMapMarker(obj, false, edit);
    }
  });
  displayPlacesList(thisMap, edit);
}

function initMapMarker(myObj, temp, edit) {
  var curMap = [];
  
  var marker = new google.maps.Marker({
    map: map,
    position: myObj.loc,
    anchorPoint: new google.maps.Point(0, -29),
    place_id: myObj.place_id,
    temp: temp,
    user: user,
//    icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + 'kk' + '|FF0000|000000'
//    label: myObj.num
  });
  
  var saveID, deleteID, inputID;
  if (marker.temp) {
    saveID = "save-" + myObj.place_id + "-temp-" + marker.user.replace(/ /g,'');
    deleteID = "delete-" + myObj.place_id +  "-temp-"  + marker.user.replace(/ /g,'');
    inputID = "input-" + myObj.place_id +  "-temp-" + marker.user.replace(/ /g,'');
  } else {
    saveID = "save-" + myObj.place_id + "-" + marker.user.replace(/ /g,'');
    deleteID = "delete-" + myObj.place_id  + "-" + marker.user.replace(/ /g,'');
    inputID = "input-" + myObj.place_id  + "-" + marker.user.replace(/ /g,'');
  }

  myObj.content = makeinfoHTML(myObj, temp, edit, saveID, deleteID, inputID);
  myMarkers.push(marker);      
  infowindow.setContent(myObj.content);
  infowindow.open(map, marker);
  
  marker.addListener('click', function() {
    infowindow.setContent(myObj.content);
    infowindow.open(map, this);
  });
  
  $('.window-text').on('click', '#'+deleteID,  function(evt) {
    evt.stopPropagation(); evt.preventDefault(); evt.stopImmediatePropagation();

    curMap = [];
    console.log(marker);

    if (marker.temp) {
      console.log("Deleting temp marker...");
      marker.setMap(null);
    } else {
      console.log("Deleting permanent marker...");
      deleteData(myObj, marker, edit);
      myPlaces.forEach(function(obj) {
        if(obj.user === user && obj.id === myObj.id) {
          myPlaces.splice(myPlaces.indexOf(obj), 1);  
        }
      }); 
    }
    
    //-----Sidebar logic-----//
    myPlaces.forEach(function(obj){
      if (obj.user === user) {
        curMap.push(obj);
      }
    });
    displayPlacesList(curMap, true);
  });
  
  $('.window-text').on('click', '#'+saveID,  function(evt) {
    evt.stopPropagation(); evt.preventDefault(); evt.stopImmediatePropagation();
    console.log("Saving marker...");

    curMap = [];

    if(myPlaces.indexOf(myObj) == -1) {
      myObj.desc = $("#"+inputID).val();
      myPlaces.push(myObj);
      saveData(myObj, marker);
      console.log("Waiting for couch confirmation...");
    }

    //-----Sidebar logic-----//
    myPlaces.forEach(function(obj){
      if (obj.user === user){
        curMap.push(obj);
      }
    });
    displayPlacesList(curMap, true);
  });

}

function displayPlacesList(placeList, edit) {
  var display = '';
  
  placeList.forEach(function(obj){
    display += makeListHTML(obj, edit);
  });
  
  $('#list').on('click', '.map-button', function (evt) {
    evt.stopPropagation(); evt.preventDefault(); evt.stopImmediatePropagation();
    
    var clickedID = $(this).parent().parent().parent().attr("id");
    var hashID = "#" + clickedID;
    
    myMarkers.forEach(function(obj){
      if(obj.place_id == clickedID) {
        google.maps.event.trigger(obj, 'click');
      }
    });
  });
  
  $('#list').on('click', '.edit-button', function (evt) {
    evt.stopPropagation(); evt.preventDefault(); evt.stopImmediatePropagation();
    
    console.log("clicked");
    
    var clickedID = $(this).closest(".place-info").attr("id");
    var hashID = "#" + clickedID;
    
    $(this).hide();
    $(hashID).children(".desc").hide();
    
    var curText = $(hashID).children(".desc").text();
    
    $(hashID).find(".desc-input").show();
    $(hashID).find(".desc-input").removeAttr('placeholder');
    $(hashID).find(".desc-input").text(curText);
    $(hashID).find(".save-button").show();
  });
  
  $('#list').on('click', '.save-button', function (evt) {
    evt.stopPropagation(); evt.preventDefault(); evt.stopImmediatePropagation();
    
    var clickedID = $(this).closest(".place-info").attr("id");
    var hashID = "#" + clickedID;
    
    var newText = $(hashID).children(".desc-input").val();
    $(this).hide();
    $(hashID).find(".desc-input").hide();
    $(hashID).find(".edit-button").show();
    $(hashID).find(".desc").html(newText);
    $(hashID).find(".desc").show();
    
    //this doesn't work - "every"?
    myPlaces.forEach(function(obj){
      if(obj.place_id == clickedID) {
        console.log('found');
        if (obj.desc !== newText) {
          obj.desc = newText;
          updateData(obj); 
        }
      }
    });
    
  });

  $('#list').html(display);
  $(".desc-input").hide();
  $(".save-button").hide();
}

function makeListHTML(obj, edit) {
  var listText = '';
  
  //this is sort of a stopgap solution
  obj.address = obj.address.replace(/,/g, ', ');
  
  listText += "<div class='place-info' id='" + obj.place_id + "'>" + 
                "<h2 href='#' class='name'>" + obj.name + "</h2>";
       
  listText+= "<p class = 'desc'>" + obj.desc + "</p>";
  
  if (obj.desc === '') {
    listText+= "<textarea rows='10' cols='10' class='desc-input' placeholder='Add a description...'></textarea>";
  } else {
    listText+= "<textarea rows='10' cols='10' class='desc-input'>" + obj.desc + "</textarea>";
  }
  
  listText+= "<div class ='details'>" +
               "<div class='control'>" +
                  "<a class='map-button'>Show on Map</a>";
  
  if (edit) {
    listText+=    "<a class='edit-button'>Edit</a>" +
                  "<a class='save-button'>Save</a>";
  }
  
  listText +=   "</div>";
  
  if (obj.phone == null) {
    listText += "<h3 class = 'address'>" + obj.address + "</h3>";                
  } else {
    listText += 
                "<h3 class = 'address'>" + obj.address + "</h3>" + 
                "<h3 class = 'phone'>" + obj.phone + "</h3>";
  }
             
  listText+= "</div>" + "<hr>";
  
  return listText;
}

function makeinfoHTML(obj, temp, edit, theSave, theDelete, theInput) {
  var windowText = '';
  
  //this is sort of a stopgap solution
  obj.address = obj.address.replace(/,/g, ', ');

  windowText += '<div class="window-text">' + 
                  "<h4 class='window-name'>" + obj.name + "</h4>" +
                  "<h3 class='window-address'>" + obj.address + "</h3>";
  
  if (temp) {
    windowText+= "<input id='" + theInput + "' type='text' value='Add a description...'>" +
                 "<a class='window-save' id='" + theSave + "'>Save</a>" +  
                 "<a class='window-delete' id='" + theDelete + "'>Delete</a>";
                 
  } else if (edit) {
    windowText+= "<a class='window-delete' id='" + theDelete + "'>Delete</a>";
  }
  
  if (!temp) {
    windowText+= "<a class='list-button' href='#" + obj.place_id + "'>Show on List</a>";  
  }
  
  windowText+= "</div>";
  
  return windowText;
}
