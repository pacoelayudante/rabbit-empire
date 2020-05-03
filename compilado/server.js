"use strict";
exports.__esModule = true;
var Server = require('boardgame.io/server').Server;
var RabbitEmpire = require('./rabbit-empire').RabbitEmpire;
var server = Server({
    games: [RabbitEmpire]
});
exports.server = server;
server.run(8000, function () { return console.log("server running..."); });
