var myPlaces = [];

function getData() {
    $.ajax({
      url: '/data',
      type: 'GET',
      dataType: 'json',
      error: function(data){
        console.log(data);
        alert("Oh No! Try a refresh?");
      },
      success: function(data){
        console.log("We have data");
        initMap(data);
      }
    });
  }

function saveData(obj){
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
      }
  });
}

function deleteData(obj){
  console.log("Entered delete...");
  console.log(obj);
  //Make sure you want to delete
  var conf = confirm("Are you sure you want to delete '" + obj.user + " : " + obj.word + "' ?");
  if (!conf) return;
  //Proceed if confirm is true
  $('#dataContainer').html('<div id="loading">Data is being deleted...</div>');
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
          getAllData();
      }
  });
}

$(document).ready(function(){
  getData();
  //initMap();
  console.log("Requesting data...");
});