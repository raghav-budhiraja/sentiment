

$(document).ready( function() {
    app.initialized()
        .then(function(_client) {
          var client = _client;
          client.data.get("loggedInUser").then (
            function(data) {
              fetchTicketsForAgent(data, client)
            },
            function(error) {
              notifyError();
            }
            );
          client.events.on('app.activated',
            function() {
                client.data.get("loggedInUser").then (
                  function(data) {
                    fetchSuggestedTicketsForAgent(data, client)
                  },
                  function(error) {
                    notifyError();
                  }
                );
            });
        },
          function (error) {
            notifyError();
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
                  console.log(data);
                  // pass the ticket details to frontend
                },
                function (error) {
                  notifyError();
                }
              );
          },
          function (error) {
            notifyError();
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
                  data = JSON.parse(data.response)
                  for(i = 0 ; i < data.results.length ; i++){
                    resultScore = calculateScore(data.results[i].description_text);
                    //setTicketStatus(data.results[i].id, client, domainDetail, resultScore);
                  }
                  //loop through the ticket list check for if custom field sentimental score is present don't have to proceed
                  //calculate score too before calling
                  //calback for new ticket
                  
                },
                function (error) {
                  notifyError();
                }
              );
          },
          function (error) {
            notifyError();
          }
        );
      }
      function setTicketStatus (ticketId, client, domainDetail, score = "neutral") {

            var data = JSON.stringify({
              "custom_fields": {
                "cf_sentimental_score": "negative"
              }
            });

            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;

            xhr.addEventListener("readystatechange", function () {
              if (this.readyState === 4) {
                console.log(this.responseText);
              }
            });

            xhr.open("PUT", "https://freshworksassist092.freshdesk.com/api/v2/tickets/16");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "Basic Y3A5MVlRTTRTYVRsVTl2empJOnF3ZXJ0eTEyMzQ1Njc4");
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("Postman-Token", "86c006e4-15eb-4023-8de6-b16c430d7621");
            xhr.send(data);
  }
});
function myFunction() {
  var x = document.getElementById("myDIV");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}


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
    return "negative"
  } else if (percentage > 65 && percentage < 85){
    return "neutral"
  } else {
    return "positive"
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


