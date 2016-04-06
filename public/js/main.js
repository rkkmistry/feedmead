function selectMap(edit) {
  $('#select-map').on('click', 'a', function (evt) {
    evt.stopPropagation(); evt.preventDefault(); evt.stopImmediatePropagation();
    user = $(this).text();
    $("#select-map").hide();
    $("#container").css("pointer-events", "auto");
    $("#container").css("filter", "none");
    $("#container").css("-webkit-filter", "none");
    setMapOnPlaces(myPlaces, map, edit, user);
  });
}

function getData(edit, user, callback) {
  $.ajax({
      url: '/data/' + user,
      type: 'GET',
      dataType: 'json',
      error: function(data) {
        console.log(data);
        alert("Oh No! Try a refresh?");
      },
      success: function(data) {
        console.log("We have data");
        callback(edit);
        initMap(data, edit);
        $("#loading").hide();
        $("#container").show();
        $("#select-map").show();
        
      }
    });
}

function saveData(obj, marker){
  $.ajax({
    url: '/save',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(obj),
    error: function(resp){
      console.log("Oh no...");
      console.log(resp);
    },
    success: function(resp){
      console.log('WooHoo!');
      console.log(resp);
      obj._id = resp.id;
      obj._rev = resp.rev;
      console.log("Making the official marker");
      marker.setMap(null);
      initMapMarker(obj, false, true); 
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
			console.log("Oh no...");
			console.log(resp);
		},
		success: function(resp){
			console.log('Updated!');
			console.log(resp);
		}
	});
}

function deleteData(obj, marker, edit){
  //Make sure you want to delete
  var conf = confirm("Are you sure you want to delete '" + obj.name + "' ?");
  if (!conf) return;
  
  console.log(marker);
  marker.setMap(null);
  
  //Proceed if confirm is true
  $.ajax({
      url: '/delete',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(obj),
      error: function(resp){
        console.log("Oh no...");
        console.log(resp);
      },
      success: function(resp){
        console.log('Deleted!');
        console.log(resp);
//        setMapOnPlaces(myPlaces, map, edit, user);
      }
  });
}

$(document).ready(function(){
  var edit;
  $("#select-map").hide();
  $("#container").hide();
  
  if (currentPage === 'editPage'){
    console.log("Edit Mode");
    edit = true;
//    var secret = prompt('Please enter password');
//    if (secret === 'krishan'){
      getData(edit, '', selectMap);
//      } else {
//        alert("Go away.");
//      }
  } else {
    edit = false;
    console.log("Display Mode");
    getData(edit, '', selectMap);
  }
  
  $("#nav li").click(function(){
    user = $(this).text();
    setMapOnPlaces(myPlaces, map, edit, user);
//    $("#nav a").css("color", "yellow");
//    $(this).css("color", 'black');
  });
  
  $("#mobile-nav-button").click(function(){
    $("#nav").stop().slideToggle();
  });

  
});