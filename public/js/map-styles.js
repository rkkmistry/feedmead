 var image = {
    url: '../img/pin.png',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(20, 32),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(9, 32), 
    scaledSize: new google.maps.Size(20, 32)
  };

var styles = [  
   {  
      "featureType":"landscape.man_made",
      "elementType":"geometry",
      "stylers":[  
         {  
            "color":"#f7f1df"
         }
      ]
   },
   {  
      "featureType":"landscape.natural",
      "elementType":"geometry",
      "stylers":[  
         {  
            "color":"#F5EED6"
         }
      ]
   },
   {  
      "featureType":"landscape.natural.terrain",
      "elementType":"geometry",
      "stylers":[  
         {  
            "visibility":"off"
         }
      ]
   },
   {  
      "featureType":"poi",
      "elementType":"labels",
      "stylers":[  
         {  
            "visibility":"off"
         }
      ]
   },
   {  
      "featureType":"poi.business",
      "elementType":"all",
      "stylers":[  
         {  
            "visibility":"on"
         }
      ]
   },
   {  
      "featureType":"poi.medical",
      "elementType":"geometry",
      "stylers":[  
         {  
            "visibility":"on"
         }
      ]
   },
   {  
      "featureType":"poi.park",
      "elementType":"geometry",
      "stylers":[  
         {  
            "color":"#bde6ab"
         }
      ]
   },
   {  
      "featureType":"road",
      "elementType":"geometry.stroke",
      "stylers":[  
         {  
            "visibility":"off"
         }
      ]
   },
   {  
      "featureType":"road",
      "elementType":"labels",
      "stylers":[  
         {  
            "visibility":"on"
         }
      ]
   },
   {  
      "featureType":"road.highway",
      "elementType":"geometry.fill",
      "stylers":[  
         {  
            "color":"#ffe15f"
         }
      ]
   },
   {  
      "featureType":"road.highway",
      "elementType":"geometry.stroke",
      "stylers":[  
         {  
            "color":"#efd151"
         }
      ]
   },
   {  
      "featureType":"road.arterial",
      "elementType":"geometry.fill",
      "stylers":[  
         {  
            "color":"#ffffff"
         }
      ]
   },
   {  
      "featureType":"road.local",
      "elementType":"geometry.fill",
      "stylers":[  
         {  
            "color":"black"
         }
      ]
   },
   {  
      "featureType":"transit.station.airport",
      "elementType":"geometry.fill",
      "stylers":[  
         {  
            "color":"#cfb2db"
         }
      ]
   },
   {  
      "featureType":"water",
      "elementType":"geometry",
      "stylers":[  
         {  
            "color":"#a2daf2"
         }
      ]
   }
];