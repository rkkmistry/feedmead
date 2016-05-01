function selectMap(data) {
  var choiceString = "";
  
  data.forEach(function(obj) {
    if(obj.type == "user" && obj.id !== user) {
      choiceString += `<a id="${obj.id}" class="userChoice">${obj.name}</a>`;        
    }
  });
  $(choiceString).insertAfter("#top");
        
  $('#select-map').on('click', '.userChoice', function (evt) {
    var theUserID = $(this).attr("id");
      
    $("#select-map").hide();
    $("#container").css("pointer-events", "auto");
    $("#container").css("filter", "none");
    $("#container").css("-webkit-filter", "none");
    console.log("I'm looking at someone else's map");
    setMapOnPlaces(data, map, false, theUserID);
  });
  
  $('.me').click(function () {
    $("#select-map").hide();
    $("#container").css("pointer-events", "auto");
    $("#container").css("filter", "none");
    $("#container").css("-webkit-filter", "none");
    console.log("Let me edit my maps");
    console.log(user);
    setMapOnPlaces(data, map, true, user);
  });
  
  $('#maplist').click(function(){
    $("#select-map").show();
    $("#container").css("pointer-events", "none");
    $("#container").css("filter", "blur(5px)");
    $("#container").css("-webkit-filter", "blur(5px)");
  });
  
  
}

function getData(callback) {
  $.ajax({
      url: '/data/',
      type: 'GET',
      dataType: 'json',
      error: function(data) {
        alert("Oh No! Try a refresh?");
      },
      success: function(data) {
        var filterArray = [];
        data.forEach(function(obj) {
            filterArray.push(obj.doc);  
        });
        callback(filterArray);
        $("#loading").hide();
        $("#container").show();
        $("#select-map").show();
      }
    });
}

function saveData(obj, marker, user){
  $.ajax({
    url: '/save',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(obj),
    error: function(resp){
     
    },
    success: function(resp){
      obj._id = resp.id;
      obj._rev = resp.rev;
      marker.setMap(null);
      initMapMarker(obj, false, true, user); 
    }
  });
}

function updateData(obj){
	$.ajax({
		url: '/update',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(obj),
		error: function(resp){
		
		},
		success: function(resp){
			
		}
	});
}

function deleteData(obj, marker, edit){
  //Make sure you want to delete
  var conf = confirm("Are you sure you want to delete '" + obj.name + "' ?");
  if (!conf) return;
  marker.setMap(null);
  //Proceed if confirm is true
  $.ajax({
      url: '/delete',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(obj),
      error: function(resp){
       
      },
      success: function(resp){
   
      }
  });
}

$(document).ready(function(){ 
//  $("#select-map").hide();
//  $("#container").hide();
  
  initMap();
  getData(selectMap);
  
  $("#mobile-nav-button").click(function(){
    $("#nav").stop().slideToggle();
  });

  
});