var apiKey = "DFQTOSESTP9UI9GX";
var tickerList = "";
var intervalList = {"TIME_SERIES_INTRADAY": "Time Series",
                    "TIME_SERIES_DAILY": "Time Series (Daily)",
                    "TIME_SERIES_DAILY_ADJUSTED": "Time Series (Daily)",
                    "TIME_SERIES_WEEKLY": "Weekly Time Series",
                    "TIME_SERIES_WEEKLY_ADJUSTED": "Weekly Adjusted Time Series",
                    "TIME_SERIES_MONTHLY": "Monthly Time Series",
                    "TIME_SERIES_MONTHLY_ADJUSTED": "Monthly Adjusted Time Series"};
var indicatorList = ["1. open", "2. high", "3. low", "4. close"];
var myChart;

// Load the list of tickers
$.getJSON("./tickers.json").done(function (obj){
  tickerList = obj;
  // console.log(tickerList);
});

// This function instantiates the graph on the Search page
function setUpGraph(id){
  var ctx = document.getElementById(id);
  myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: []
      },
      options: {
          title: {
            display: true,
            text: "Time Series (This Graph is a Placeholder)"
          },
          scales: {
              xAxes: [{
                  ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: 10
                  }
              }],
              yAxes: [{
                  ticks: {
                      beginAtZero: true,
                      min: 0,
                      max: 10
                  }
              }]
          }
      }
  });

  $("#" + id).css("width", "600px");
  $("#" + id).css("height", "300px");
}

// Get data points for an interval
function parseData(rawData){
  var arr = $.map(rawData, function(el) { return el });
  var output = [[], [], [], []];

  for (i = 0; i < arr.length; i++){
    for (j = 0; j < 4; j++){
      output[j].push({"x": i,
                      "y": parseFloat(arr[i][indicatorList[j]])});
    }
  }

  // console.log(output);

  return output;
}

// Get raw time series
function getTimeSeries(ticker, type, interval = "1min"){
  var apiURL = "https://www.alphavantage.co/query?function=" + type + "&symbol=" + ticker;
  var intervalName = intervalList[type];

  if (type == "TIME_SERIES_INTRADAY"){
    apiURL += "&interval=" + interval;
    intervalName += " (" + interval + ")";
  } else {
    interval = "";
  }

  apiURL += "&outputsize=full&apikey=" + apiKey;

  $.getJSON(apiURL).done(function (obj){
    if (obj["Error Message"]){
      alert("Sorry, we couldn't find this stock ticker. Please try another one.");
      return -1;

    } else {
      loadTimeSeriesGraph(myChart, parseData(obj[intervalName]), ticker, tickerList[ticker], interval);
      return null;
    }
  });
}

// This function generates a new graph given some time series data
function loadTimeSeriesGraph(chart, data, ticker, companyName, interval = "1min"){
  var maxes = [];
  var labels = [];

  for (i = 0; i < data.length; i++){
    labels.push(i);
  }

  chart.options.title.text = "Times Series (" + interval + ") - " + ticker + ": " + companyName;
  chart.data.datasets.labels = labels;

  for (i = 0; i < data.length; i++){
    chart.data.datasets.push({label: indicatorList[i], data: data[i], backgroundColor: 'rgba(0, 0, 0, 0)',
                              borderColor: 'rgba(0, 0, 0, 0.5)', borderWidth: 10});
    maxes.push(Math.max(...data[i]));
  }

  chart.options.scales.yAxes[0].ticks.min = 29.5;
  chart.options.scales.yAxes[0].ticks.max = 30.3;
  chart.options.scales.xAxes[0].ticks.max = 2000;
  // chart.data.datasets.push({label: "Test Price", data: data, backgroundColor: 'rgba(0, 0, 0, 0)'});
  console.log(maxes);
  chart.update();

  return null;
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
function getTickerInfo(key){
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
        $("#recommendation").html("Loading...");

        if (tickerList[ticker]){
          document.getElementById("companyDisplay").innerHTML = tickerList[ticker];
        }

        var data = obj["Global Quote"];

        updateMultipleTags({"openValue": data["02. open"],
                            "highValue": data["03. high"],
                            "lowValue": data["04. low"],
                            "priceValue": data["05. price"],
                            "volumeValue": data["06. volume"]});

        // Load graph after loading table data
        // getTimeSeries(ticker, "TIME_SERIES_INTRADAY", "1min");

        // Load recommendation after loading table data and graph
        giveRecommendation(key, ticker, 50, 200);

        return null;
      }
    });
  }
}

function maxY(dataset){
  var a = [];

  for (i = 0; i < dataset.length; i++){
    a.push(dataset[i]['y']);
  }

  return Math.max(...a);
}

// Fetches recommendation
function giveRecommendation(key, ticker, shortPeriod, longPeriod){
  $.getJSON("https://www.alphavantage.co/query?function=SMA&symbol=" + ticker
  + "&interval=daily&time_period=" + shortPeriod.toString() + "&series_type=close&apikey=" + key).done(function (shortObj){
    $.getJSON("https://www.alphavantage.co/query?function=SMA&symbol=" + ticker
    + "&interval=daily&time_period=" + longPeriod.toString() + "&series_type=close&apikey=" + key).done(function (longObj){

      shortData = $.map(shortObj["Technical Analysis: SMA"], function(el) { return el });
      longData = $.map(longObj["Technical Analysis: SMA"], function(el) { return el });

      if(shortData[0]["SMA"] > longData[0]["SMA"]){
        document.getElementById("recommendation").innerHTML = "Buy Soon";
      } else if (shortData[0]["SMA"] < longData[0]["SMA"]){
        document.getElementById("recommendation").innerHTML = "Sell Soon";
      } else {
        document.getElementById("recommendation").innerHTML = "No Action";
      }

    });
  });
}
