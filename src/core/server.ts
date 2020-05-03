const Server = require('boardgame.io/server').Server;
const RabbitEmpire = require('./rabbit-empire').RabbitEmpire;

const server = Server({
  games: [RabbitEmpire],
});
const PORT = process.env.PORT || 8000;

server.run(PORT, () => console.log("server running..."));

export {server};