var apiKey = "DFQTOSESTP9UI9GX";
var tickerList = "";

// Load the list of tickers
$.getJSON("./tickers.json").done(function (obj){
  tickerList = obj;
  // console.log(tickerList);
});

// This function instantiates the graph on the Search page
function setUpGraph(id){
  var ctx = document.getElementById(id);
  var myChart = new Chart(ctx, {
      type: 'line',
      options: {
          title: {
            display: true,
            text: "Time Series (This Graph is a Placeholder)"
          },
          scales: {
              yAxes: [{
                  ticks: {

                      beginAtZero: true
                  }
              }]
          }
      }
});
}

// This function retrieves the inputted ticker
function getUserTickerSearch(){
  return document.getElementById("tickerSearch").value;
}

// Tests the AlphaVantage API
function testAlphaVantageAPI(key){
  $.getJSON("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=" + key).done(function (obj){
    console.log(JSON.stringify(obj));
  });
  return null;
}

// Updates multiple HTML text tags by id
function updateMultipleTags(dict){
  for (id in dict){
    if (!document.getElementById(id)){
      console.log("Error: Tag ID " + id + " not found.");
      return -1;
    } else {
      document.getElementById(id).innerHTML = dict[id];
    }
  }
  return null;
}

// Calls the API and produces the necessary information for the "Search" Page
function callAPI(key){
  if (key == ''){
    key = apiKey;
  }

  var ticker = getUserTickerSearch().toUpperCase();

  if (ticker){

    $.getJSON("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + ticker + "&interval=1min&apikey=" + key).done(function (obj){

      if (jQuery.isEmptyObject(obj["Global Quote"])){
        alert("Sorry, we couldn't find this stock ticker. Please try another one.");
        return -1;

      } else {

        document.getElementById("tickerDisplay").innerHTML = ticker;
        document.getElementById("tickerSearch").value = "";

        if (tickerList[ticker]){
          document.getElementById("companyDisplay").innerHTML = tickerList[ticker];
        }

        var data = obj["Global Quote"];
        console.log(data);

        updateMultipleTags({"openValue": data["02. open"],
                            "highValue": data["03. high"],
                            "lowValue": data["04. low"],
                            "priceValue": data["05. price"],
                            "volumeValue": data["06. volume"]});
        return null;
      }
    });

  }
}
