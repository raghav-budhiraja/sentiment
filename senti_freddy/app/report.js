$(document).ready( function() {
    app.initialized()
        .then(function(_client) {
          var client = _client;
          client.data.get("domainName").then (
            function(domainDetail) {
              console.log("hey")
              fetchTicketCount('Positive', domainDetail, client);
              fetchTicketCount('Negative', domainDetail, client);
              fetchTicketCount('Neutral', domainDetail, client);
              
            },
            function(error) {
              notifyError();
            }
            );        
          client.events.on('app.activated',
            function() {
              client.data.get("domainName").then(
                function (domainDetail) {
                  let agentTickets = `https://${domainDetail.domainName}/api/v2/agents`;

                  let headers = { "Authorization": "Basic Y3A5MVlRTTRTYVRsVTl2empJOnF3ZXJ0eTEyMzQ1Njc4" };
                  let options = { headers: headers };
                  client.request.get(agentTickets, options)
                    .then(
                      function (data) {
                        let responseData = JSON.parse(data.response)
                        for(let i =0;i<responseData.length;i++){  
                          let lin = `${responseData[i].contact.name}`
                          $('div#agents_list').append(lin)
                        }    
                      },
                      function (error) {
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

    $('#agents_list').click(function(e) {  
      console.log("lololololoololololo")
      // call all the tickets for that agent and with sentiment
    });
    function fetchTicketCount(sentimentalScoreQuery, domainDetail, client){
      let agentTickets = `https://${domainDetail.domainName}/api/v2/search/tickets?query="status:2 AND cf_sentimental_score: ${sentimentalScoreQuery}"`;
      let headers = { "Authorization": "Basic Y3A5MVlRTTRTYVRsVTl2empJOnF3ZXJ0eTEyMzQ1Njc4" };
      let options = { headers: headers };
      client.request.get(agentTickets, options)
        .then(
          function (data) {
            let numberOfTickets = 0;
            response = JSON.parse(data.response);
            numberOfTickets = response.total;
          },
          function (error) {
            console.log(error);
            notifyError();
          }
        );
    }
    
});