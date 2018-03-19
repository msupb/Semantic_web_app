//Get pharmacy data from server
function getData(){
  let temp = [];
   $.ajax({
     url: '/geoList',
     method: 'GET',
     dataType: 'json',
     contentType: 'application/json',
     success: function(response) {
       temp = response.geoList;
       console.log(temp);
       let el = $('#test');
       //el.html('');
       temp.forEach(function(temp){
         el.append('<div class="card"><h5 class="card-title"><b>Pharmacy:</b></h5><p class="card-text">' + temp.l + '</p><p class="card-text">' + temp.s + '</p></div>');
        });
     }
   });
 };

//Send coordinates to server
$(document).on('click', '#send-coords', function(){
  let timeout = null;
  let pendingCall = { timeStamp: null, procID: null };
  let longInput = $('.long').text();
  let latInput = $('.lat').text();
  let coords = longInput + ', ' + latInput;
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
