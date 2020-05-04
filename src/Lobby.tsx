import React, { useState, ChangeEvent } from 'react';
import { Lobby } from 'boardgame.io/react';
import { RabbitEmpire } from './core/rabbit-empire';
import Tablero from './tablero';
import './rabbit-empire.css';

const server = `https://rabbit-empire.herokuapp.com`;
const importedGames = [{ game: RabbitEmpire, board: Tablero }];

export default () => {
    const [minimizado, setMinimizado] = useState(false);

    const minimizar = (ev: ChangeEvent<HTMLInputElement>) => {
        setMinimizado(ev.currentTarget.checked);
    };

    return (
        <div>
            <h1>Lobby</h1>
            <input type='checkbox' id='minimizar' onChange={minimizar} />
            <label htmlFor='minimizar' className='minimizar'/>
            <div className={minimizado ? 'minimizado' : ''}>
                <Lobby gameServer={server} lobbyServer={server} gameComponents={importedGames} />
            </div>
        </div>
    )
};