function getUserTickerSearch(){
  var ticker = document.getElementById("tickerSearch");
  //  document.write(ticker.value);
  var tickerDisplay = document.getElementById("tickerDisplay");

  if (ticker.value == ""){
    tickerDisplay.innerHTML = "Ticker: None Selected";
  } else {
    tickerDisplay.innerHTML = "Ticker: " + ticker.value;
  }
  ticker.value = "";
  return null;
}
