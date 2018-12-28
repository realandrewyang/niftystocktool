var apiKey = "DFQTOSESTP9UI9GX";
var tickerList = "";

$.getJSON("./tickers.json").done(function (obj){
  tickerList = obj;
  console.log(tickerList);
});

console.log(tickerList);

function getUserTickerSearch(){
  return document.getElementById("tickerSearch").value;
}

function testAlphaVantageAPI(key){
  $.getJSON("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=" + key).done(function (obj){
    console.log(JSON.stringify(obj));
  });
  return null;
}

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

function callAPI(key){
  if (key == ''){
    key = apiKey;
  }

  var ticker = getUserTickerSearch().toUpperCase();

  if (ticker){

    $.getJSON("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + ticker + "&interval=1min&apikey=" + key).done(function (obj){

      if (obj["Error Message"]){
        alert("Sorry, we couldn't find this stock ticker. Please try another one.");
        return -1;

      } else {

        document.getElementById("tickerDisplay").innerHTML = ticker;
        document.getElementById("tickerSearch").value = "";

        if (tickerList[ticker]){
          document.getElementById("companyDisplay").innerHTML = tickerList[ticker];
        }

        var data = $.map(obj["Time Series (1min)"], function(a) { return a });

        updateMultipleTags({"openValue": data[0]["1. open"],
                            "highValue": data[0]["2. high"],
                            "lowValue": data[0]["3. low"],
                            "closeValue": data[0]["4. close"],
                            "volumeValue": data[0]["5. volume"]});
        return null;
      }
    });

  }
}
