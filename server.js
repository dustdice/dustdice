var app = require('express')();
var http = require('http').Server(app);
var express = require('express');

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var port = process.env.PORT || 8080;


http.listen(port, function(){
  console.log('listening on *:', port);
});
