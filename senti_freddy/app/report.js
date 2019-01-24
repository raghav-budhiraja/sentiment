$(document).ready( function() {
    app.initialized()
        .then(function(_client) {
          var client = _client;
          $(".main_content").css("visibility", "visible");
          $(".error").css("visibility", "hidden");
          client.data.get("domainName").then (
            function(domainDetail) {
              console.log("hey")
              fetchTicketCount('Positive', domainDetail, client);
              fetchTicketCount('Negative', domainDetail, client);
              fetchTicketCount('Neutral', domainDetail, client);
              
            },
            function(error) {
              notifyError(error);
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
                          $('#agent_table').children('tbody').append(`<tr class="table-active list_entry"> <td>${i+1}</td><td>${responseData[i].contact.name}</td><td>${responseData[i].contact.email}</td><td>${responseData[i].contact.phone}</td></tr>`);  
                        }    
                      },
                      function (error) {
                        notifyError(error);
                      }
                    );
                },
                function (error) {
                  notifyError(error);
                }
              );
            });
        },
          function (error) {
            notifyError(error);
          });

    $('#agents_list').click(function(e) {  
      
      // call all the tickets for that agent and with sentiment
    });
    function fetchTicketCount(sentimentalScoreQuery, domainDetail, client){
      let agentTickets = `https://${domainDetail.domainName}/api/v2/search/tickets?query="status:2 AND cf_sentimental_score: ${sentimentalScoreQuery}"`;
      let headers = { "Authorization": "Basic Y3A5MVlRTTRTYVRsVTl2empJOnF3ZXJ0eTEyMzQ1Njc4" };
      let options = { headers: headers };
      let numberOfTickets = 0;
      client.request.get(agentTickets, options)
        .then(
          function (data) {
            response = JSON.parse(data.response);
            numberOfTickets = response.total;
            console.log(numberOfTickets);
            $("."+sentimentalScoreQuery).html(numberOfTickets);
          },
          function (error) {
            notifyError(error);
          }
        );
    }
    function notifyError(error){
      $(".main_content").css("visibility", "hidden");
      $(".error").css("visibility", "visible");
      $(".error").html(error);
    }
    
});