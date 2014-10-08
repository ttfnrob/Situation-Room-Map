function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}  

function initialize(searchTerm) {
  
  if (typeof getUrlParameter('search') === 'undefined') {
    if ($("#searchBox").val()=="") { $("#searchBox").val("cat") };
    searchTerm = typeof searchTerm !== 'undefined' ? searchTerm : $("#searchBox").val();
  } else {
    $("#searchBox").val(getUrlParameter('search'));
    searchTerm = $("#searchBox").val();
  }

  $("#mapButton").click(function() {
    initialize();
  });

  $(":input").on("keyup", function(e) {
    if(e.which == 13)
      initialize();
  });

  console.log("Now tracking the term '"+searchTerm+"'");

  //Setup Google Map
  var myLatlng = new google.maps.LatLng(15.0,0);
  
  var light_grey_style = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]}];
  
  var myOptions = {
    zoom: 2,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    styles: light_grey_style
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  
  //Setup heat map and link to Twitter array we will append data to
  //positive comments
  var heatmapPos;
  var liveTweetsPos = new google.maps.MVCArray();
    heatmapPos = new google.maps.visualization.HeatmapLayer({
    data: liveTweetsPos,
    radius: 25
  });
  var gradient = [
    'rgba(255,255,255,0)',
    'rgba(255,255,255,0.1)',
    'rgba(255,255,255,0.2)',
    'rgba(210,253,254,0.3)',
    'rgba(30,244,248,0.4)',
    'rgba(32,248,158,0.5)',
    'rgba(33,249,152,0.66)',
    'rgba(51,255,75,0.66)',
    'rgba(51,255,75,0.66)'
  ]
  heatmapPos.set('gradient', heatmapPos.get('gradient') ? null : gradient);
  heatmapPos.setMap(map);

  //negative comments
  var heatmapNeg;
  var liveTweetsNeg = new google.maps.MVCArray();
    heatmapNeg = new google.maps.visualization.HeatmapLayer({
    data: liveTweetsNeg,
    radius: 25
  });
  var gradient = [
    'rgba(255,255,255,0)',
    'rgba(255,255,255,0.1)',
    'rgba(255,255,255,0.2)',
    'rgba(250,247,213,0.3)',
    'rgba(232,213,46,0.4)',
    'rgba(234,134,46,0.5)',
    'rgba(236,128,46,0.66)',
    'rgba(255,50,50,0.66)',
    'rgba(255,50,50,0.66)'
  ]
  heatmapNeg.set('gradient', heatmapNeg.get('gradient') ? null : gradient);
  heatmapNeg.setMap(map);

  if(io !== undefined) {
    // Storage for WebSocket connections
    var socket = io.connect('/');

    // This listens on the "twitter-steam" channel and data is 
    // received everytime a new tweet is receieved.
    socket.on('twitter-stream', function (data) {

      //Add tweet to the heat map array.
      var tweetLocation = new google.maps.LatLng(data.lng,data.lat);
      
      var pattern = new RegExp('\\b' + searchTerm + '\\b', 'i');
      if (pattern.test(data.text) == true) {
        if (data.sentiment.score > 0) {
          liveTweetsPos.push({location: tweetLocation, weight: data.sentiment.score});
          // liveTweetsNeg.push({location: tweetLocation, weight: 0});
        }
        if (data.sentiment.score < 0) {
          liveTweetsNeg.push({location: tweetLocation, weight: (-1*data.sentiment.score)});
          // liveTweetsPos.push({location: tweetLocation, weight: 0});
        }
      }

    });

    // Listens for a success response from the server to 
    // say the connection was successful.
    socket.on("connected", function(r) {

      //Now that we are connected to the server let's tell 
      //the server we are ready to start receiving tweets.
      socket.emit("start tweets");
    });
  }
}