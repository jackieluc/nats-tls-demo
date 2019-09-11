var NATS = require('nats');
var fs = require('fs');

// Use a client certificate if the server requires
var tlsOptions = {
  key: fs.readFileSync('./certs/client-key.pem'),
  cert: fs.readFileSync('./certs/client-cert.pem'),
  ca: [ fs.readFileSync('./certs/ca-cert.pem') ]
};

var nats = NATS.connect({url: 'nats://docker.for.mac.localhost:4222', tls: tlsOptions});

 
nats.on('connect', function(nats) {
    console.log('======> connected');
    console.log(nats);
});

nats.on('error', function(err) {
  console.log(err);
});

nats.on('disconnect', function() {
  console.log('======> disconnect');
});

nats.on('reconnecting', function() {
  console.log('======> reconnecting');
});

nats.on('reconnect', function(nats) {
  console.log('======> reconnect');
});

nats.on('close', function() {
  console.log('======> close');
});

// Simple Publisher
nats.publish('foo', 'Hello World!');
 
// Simple Subscriber
nats.subscribe('foo', function(msg) {
  console.log('======> Received a message: ' + msg);
});
 
// Unsubscribing
var sid = nats.subscribe('foo', function(msg) {});
nats.unsubscribe(sid);
 
// Request Streams
var sid = nats.request('request', function(response) {
  console.log('======> Got a response in msg stream: ' + response);
});
 
// Request with Auto-Unsubscribe. Will unsubscribe after
// the first response is received via {'max':1}
nats.request('help', null, {'max':1}, function(response) {
  console.log('======> Got a response for help: ' + response);
});
 
 
// Request for single response with timeout.
nats.requestOne('help', null, {}, 1000, function(response) {
  // `NATS` is the library.
  if(response instanceof NATS.NatsError && response.code === NATS.REQ_TIMEOUT) {
    console.log('======> Request for help timed out.');
    return;
  }
  console.log('======> Got a response for help: ' + response);
});
 
// Replies
nats.subscribe('help', function(request, replyTo) {
  nats.publish(replyTo, 'I can help!');
});
 
// Close connection
// nats.close();
