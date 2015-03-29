var WebSocket = require("ws");
var ws = new WebSocket("wss://ws-feed.exchange.coinbase.com/");

var req = {"type":"subscribe","product_id":"BTC-USD"}

ws.onopen = function() {
  ws.send(JSON.stringify(req));
};

ws.onmessage = function(evt) {
  console.log(evt.data);
};

ws.onclose = function() {};
