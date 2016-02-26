function getData(edit, user) {
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
        initMap(data, edit);
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
  getData(true, '');
  
  $('a').click(function(){
    getData(false, 'krishan')
  });
});