var socket = new io.Socket();
socket.connect();
socket.on('connect', function() {
  socket.subscribe('biklu');
});

Socket = {};

Backbone.ajax = function() {
  var v = 0;
  Socket[arguments[0].type](arguments);
};

Socket.GET = function(args) {
  var v = args;
  var j = 0;
}

Socket.CREATE = function(args) {

}

Socket.patch = function(args) {

}

Socket.update = function(args) {

}