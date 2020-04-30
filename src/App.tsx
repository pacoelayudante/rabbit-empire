import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import RabbitEmpire from './rabbit-empire';
import Tablero from './tablero';
import './App.css';

// const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:2, multiplayer: SocketIO({ server: '192.168.0.7:8000' }), board: Tablero, debug:false });
const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:2, multiplayer: Local(), board: Tablero, debug:true });
// const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:3, board: Tablero });

export default () =>
{
  const id = (document.location.hash).slice(1).toString();
  return (<div className='app'>
    {/* <RabbitEmpireClient playerID={id} /> */}
    <RabbitEmpireClient playerID='0' />
    <RabbitEmpireClient playerID='1' />
    {/* <RabbitEmpireClient playerID='2' /> */}
  </div>);
}
// export default RabbitEmpireClient;