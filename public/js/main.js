function selectMap(edit) {
  $('#select-map').on('click', 'button', function (evt) {
    evt.stopPropagation(); evt.preventDefault(); evt.stopImmediatePropagation();
    user = $(this).text();
    $("#select-map").hide();
    $("#container").css("pointer-events", "auto");
    $("#container").css("-webkit-filter", "none");
    console.log(myPlaces);
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
      initMapMarker(obj, false, true); 
      marker.setMap(null);
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

function deleteData(obj, callback){
  //Make sure you want to delete
  var conf = confirm("Are you sure you want to delete '" + obj.name + "' ?");
  if (!conf) return;
  callback();
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
      }
  });
}

$(document).ready(function(){
  var edit;
  $("#select-map").hide();
  $("#container").hide();
  
  if (currentPage === 'editPage'){
    edit = true;
    var secret = prompt('Please enter password');
    if (secret === 'krishan'){
      console.log("Set to true");
      getData(edit, '', selectMap);
    } else {
//      $('body').html("<h2 style="po">FUCK YOU</h2>");
      alert("Go away.");
    }
  } else {
    edit = false;
    console.log("Set to false");
    getData(edit, '', selectMap);
  }
  
  $("#nav a").click(function(){
    console.log("click");
    user = $(this).text();
    setMapOnPlaces(myPlaces, map, edit, user);
  });
});