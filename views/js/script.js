var timeout = null;
//Get pharmacy data from server
function getData(){
   $.ajax({
     url: '/geoList',
     method: 'GET',
     dataType: 'json',
     contentType: 'application/json',
     success: function(response) {
       console.log(response);
     }
   });
 };

//Send coordinates to server
$(document).on('click', '#send-coords', function(){
  var pendingCall = { timeStamp: null, procID: null };
  var longInput = $('.long').text();
  var latInput = $('.lat').text();
  var coords = longInput + ', ' + latInput;
  console.log(JSON.stringify(longInput) + ' ' + JSON.stringify(latInput));
  $.ajax({
    url: '/resList',
    method: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({coords: coords}),
    success: function(response){
      console.log(response);
    }
  });

  if(timeout) clearTimeout(timeout);
  timeout = setTimeout(getData, 2000);

});
