import React from 'react';
import { Lobby } from 'boardgame.io/react';
import {RabbitEmpire} from './core/rabbit-empire';
import Tablero from './tablero';
import './rabbit-empire.css';

const server = `http://192.168.0.7:8000`;
const importedGames = [{ game: RabbitEmpire, board: Tablero }];

export default () => (
  <div>
    <h1>Lobby</h1>
    <Lobby gameServer={server} lobbyServer={server} gameComponents={importedGames} />
  </div>
);