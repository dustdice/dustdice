#!/bin/env node

var app = require('express')();
var http = require('http').Server(app);
var express = require('express');

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var ipaddress = process.env.OPENSHIFT_NODEJS_IP;
var port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;

if (typeof ipaddress === "undefined") {
    //console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
    ipaddress = "0.0.0.0";
}

http.listen(port, ipaddress, function(){
  console.log('listening on *:', port);
});


//var fs      = require('fs');