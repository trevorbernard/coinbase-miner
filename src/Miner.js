var WebSocket = require("ws");
var ws = new WebSocket("wss://ws-feed.exchange.coinbase.com/");
var Client = require('node-rest-client').Client;

var apiUrl = "http://staging.emax.io:9000";

var client = new Client();

var orders = {};
var createOrder = function (data) {
  return {
    side: data.side === 'sell' ? 'ask' : 'bid',
    price: data.price,
    quantity: data.size
  };
};

ws.onopen = function () {
  var req = {"type": "subscribe", "product_id": "BTC-USD"};
  ws.send(JSON.stringify(req));
};

ws.onmessage = function (evt) {
  var data = JSON.parse(evt.data);
  switch (data.type) {
    case 'received':
      console.log(evt.data);
      var args = {
        data: createOrder(data),
        headers: {"Content-Type": "application/json"}
      };
      client.post(apiUrl + "/orders", args, function (data, response) {
        console.log('received:', data);
        orders[evt.order_id] = data.order_id;
      });
      break;
    case 'done':
      if (data.reason === 'canceled') {
        console.log(evt.data);
        var orderId = orders[evt.order_id];
        if(orderId) {
          client.delete(apiUrl + "/orders/" + orderId, args, function (data, response) {
            console.log('canceled:', data);
            delete orders[evt.order_id];
          });
        }
      }
      break;
    default:
    //no-op
  }
  //console.log(evt.data);
};

ws.onclose = function () {
};

