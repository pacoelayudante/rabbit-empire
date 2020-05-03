const Server = require('boardgame.io/server').Server;
const RabbitEmpire = require('./rabbit-empire').RabbitEmpire;

const server = Server({
  games: [RabbitEmpire],
});

server.run(8000, () => console.log("server running..."));

export {server};