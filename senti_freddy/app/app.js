$(document).ready( function() {
    app.initialized()
        .then(function(_client) {
          var client = _client;
          client.data.get("loggedInUser").then (
            function(data) {
              fetchTicketsForAgent(data, client)
            },
            function(error) {
              notifyError(error);
            }
            );
          client.events.on('app.activated',
            function() {
                client.data.get("loggedInUser").then (
                  function(data) {
                    fetchSuggestedTicketsForAgent(data, client)
                  },
                  function(error) {
                    notifyError(error);
                  }
                );
            });
        },
          function (error) {
            notifyError(error);
          });
      function fetchSuggestedTicketsForAgent(agentPayload, client){
        client.data.get("domainName").then(
          function (domainDetail) {
            let agentTickets = `https://${domainDetail.domainName}/api/v2/search/tickets?query="agent_id:${agentPayload.loggedInUser.id} AND status:2 AND cf_sentimental_score: 'Negative'"`;
            let headers = { "Authorization": "Basic Y3A5MVlRTTRTYVRsVTl2empJOnF3ZXJ0eTEyMzQ1Njc4" };
            let options = { headers: headers };

            client.request.get(agentTickets, options)
              .then(
                function (data) {
                  results = JSON.parse(data.response);
                  console.log(results);
                  if(results.total != 0){
                    for (i = 0; i < results.total; i++){
                      $('#error').html("");
                      ticketurl = `https://${domainDetail.domainName}/a/tickets/${results.results[i].id}`;
                      $('#suggested_ticket').append(`<p><a href= "${ticketurl}">${results.results[i].subject}</a></p>`);
                      $('a').attr('target','_blank');
                    }
                  }else {
                    $('#suggested_ticket').html("");
                    $('#error').html("<p>No ticket with negative reply.</p>");
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
      }
      function fetchTicketsForAgent(agentPayload, client) {
        client.data.get("domainName").then(
          function (domainDetail) {
            let agentTickets = `https://${domainDetail.domainName}/api/v2/search/tickets?query="agent_id:${agentPayload.loggedInUser.id}"`;

            let headers = { "Authorization": "Basic Y3A5MVlRTTRTYVRsVTl2empJOnF3ZXJ0eTEyMzQ1Njc4" };
            let options = { headers: headers };

            client.request.get(agentTickets, options)
              .then(
                function (data) {
                  data = JSON.parse(data.response);
                  console.log(data);
                  for(i = 0 ; i < data.results.length ; i++){
                    resultScore = calculateScore(data.results[i].description_text);
                    console.log(resultScore);
                    
                    setTicketStatus(data.results[i].id, domainDetail, resultScore);
                    
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
      }
      function setTicketStatus (ticketId, domainDetail, score = "Neutral") {
            var data = {
              "custom_fields": {
                "cf_sentimental_score": score
              }
            };
            $.ajax({
              url: 'https://' + domainDetail.domainName+'/api/v2/tickets/' + ticketId,
              type: 'put',
              data: JSON.stringify(data),
              headers: {
                  'Authorization': 'Basic Y3A5MVlRTTRTYVRsVTl2empJOnF3ZXJ0eTEyMzQ1Njc4',
                  "Content-Type": "application/json"
              },
              dataType: 'json'
            })
      }
      function notifyError(error){
        $('#suggested_ticket').html();
        $('#error').html(error);
      }
});

var incorrectNegs = [];
var incorrectPos = [];

var negations = new RegExp("^(never|no|nothing|nowhere|noone|none|not|havent|hasnt|hadnt|cant|couldnt|shouldnt|wont|wouldnt|dont|doesnt|didnt|isnt|arent|aint)$");

var length = negatives.length;
var split = Math.floor(0.85 * length);

Bayes.debug = false;

Bayes.tokenizer = function (text) {
    text = Bayes.unigramTokenizer(text);
    for (var i = 0, len = text.length; i < len; i++) {
        if (text[i].match(negations)) {
            if (typeof text[i + 1] !== 'undefined') text[i + 1] = "!" + text[i + 1];
            if (typeof text[i - 1] !== 'undefined') text[i - 1] = "!" + text[i - 1];
        }
    }
    text = text.map(function (t) { return stemmer(t); });
    return text;
};

Bayes.storage = Storage;

function go() {

    var correct = 0;
    var incorrect = 0;
    var skipped = 0;
    var trainingPct = 0;
    var resultsPct = 0.0;
    
    Bayes.storage._data = {};

    
    negatives.sort(function () { return Math.random() - 0.5; });
    positives.sort(function () { return Math.random() - 0.5; });

    
    for (var i = 0; i < split; i++) {
        Bayes.train(negatives[i], 'negative');
        Bayes.train(positives[i], 'positive');
        if (i % 500 === 0) {       
            trainingPct = Math.round(i*100 / split);
            
        }
    }
    
    trainingPct = 100;
    

    
    for (var i = split; i < length; i++) {
        var negResult = Bayes.extractWinner(Bayes.guess(negatives[i]));
        var posResult = Bayes.extractWinner(Bayes.guess(positives[i]));

        
        if (negResult.score < 0.75) skipped++;
        else if (negResult.label === 'negative') correct++;
        else {
            incorrect++;
            incorrectNegs.push(negatives[i]);
        }

        if (posResult.score < 0.75) skipped++;
        else if (posResult.label === 'positive') correct++;
        else {
            incorrect++;
            incorrectPos.push(positives[i]);
        }
    }


    resultsPct = Math.round(10000 * correct / (correct + incorrect)) / 100;
    return resultsPct;
}

function calculateScore(text) {
  var result = Bayes.extractWinner(Bayes.guess(text));
  percentage = Math.round(100*result.score)
  if(percentage < 100 && percentage > 85){
    return "Negative"
  } else if (percentage > 75 && percentage < 85){
    return "Neutral"
  } else {
    return "Positive"
  }
}

setTimeout(go, 500);
function run() {
    var n = 30;
    var i = n;
    var scores = [];
    var sum = 0;
    while (i--) scores.push(go());
    scores.forEach(function (score) {
        sum += score;
    });

    console.log(scores);
    console.log("Average " + sum / n);
}


