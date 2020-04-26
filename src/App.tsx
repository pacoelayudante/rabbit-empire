import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import RabbitEmpire from './rabbit-empire';
import Tablero from './tablero';
import './App.css';

const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:3, multiplayer: Local(), board: Tablero });
// const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:3, board: Tablero });

export default () =>
  (<div className='app'>
    <RabbitEmpireClient playerID='0' debug={false}/>
    <RabbitEmpireClient playerID='1' debug={false} />
    <RabbitEmpireClient playerID='2' debug={false} />
  </div>);
// export default RabbitEmpireClient;