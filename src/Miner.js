var WebSocket = require("ws");
var ws = new WebSocket("wss://ws-feed.gdax.com");
var Client = require('node-rest-client').Client;

var apiUrl = "https://api.sandbox.braveno.com/products/ETH-BTC";
var walletId = '__wallet_id__';
var accountId = '__account_id__';

var opts = {
  user:'__api_key__',
  password:'__api_secret__'
};

var client = new Client(opts);

var orders = {};
var createOrder = function (data) {
  if(data.order_type === 'limit') {
    return {
      type: 'limit',
      side: data.side === 'sell' ? 'ask' : 'bid',
      price: data.price,
      quantity: data.size,
      wallet_id: walletId,
      account_id: accountId
    };
  }
  return {}
};

ws.onopen = function () {
  var req = {"type": "subscribe", "product_id": "ETH-BTC"};
  ws.send(JSON.stringify(req));
};

ws.onmessage = function (evt) {
  var data = JSON.parse(evt.data);
  switch (data.type) {
    case 'received':
      //console.log(evt.data);
      var args = {
        data: createOrder(data),
        headers: {"Content-Type": "application/json"}
      };
      var resp = client.post(apiUrl + "/orders", args, function (data, response) {
        console.log('received:', data);
        orders[evt.order_id] = data.order_id;
      });
    console.log("Options",resp.options);
      break;
    case 'done':
      if (data.reason === 'canceled') {
        console.log('done', evt.data);
        var orderId = orders[evt.order_id];
        if(orderId) {
          var args = {
          };
          client.post(apiUrl + "/orders/" + orderId, args, function (data, response) {
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
