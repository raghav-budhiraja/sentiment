import {app} from 'app';
$(document).ready( function() {
    app.initialized()
        .then(function(_client) {
          var client = _client;
          
          client.events.on('app.activated',
            function() {
              client.data.get("domainName").then(
                function (domainDetail) {
                  let agentTickets = `https://${domainDetail.domainName}/api/v2/agents`;

                  let headers = { "Authorization": "Basic Y3A5MVlRTTRTYVRsVTl2empJOnF3ZXJ0eTEyMzQ1Njc4" };
                  let options = { headers: headers };
                  let ex = app();
                  cosnsole.log('calling app.js');

                  client.request.get(agentTickets, options)
                    .then(
                      function (data) {
                        console.log(data.response);
                        let ar = JSON.parse(data.response)
                        for(let i =0;i<ar.length;i++){
                          let link = "https://google.com"
                          let lin = `<a href=${link}>${ar[i].contact.name}</a>`
                          $('div#agents_list').append(lin)
                        }
                        
                        
                      },
                      function (error) {
                        console.log(error);
                      }
                    );
                },
                function (error) {
                  notifyError();
                }
              );
            });
        },
          function (error) {
            notifyError();
          });
    
});