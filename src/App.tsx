import React, { ChangeEvent } from 'react';
import { Client } from 'boardgame.io/react';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import RabbitEmpire from './rabbit-empire';
import Tablero from './tablero';
import './rabbit-empire.css';

// const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:2, multiplayer: SocketIO({ server: '192.168.0.7:8000' }), board: Tablero, debug:false });
const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:2, multiplayer: Local(), board: Tablero, debug:document.location.hash.includes('dbg') });
// const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:3, board: Tablero });

const Menu = ()=>{  
  const opciones = new Map([
    ['Reset',()=>console.log('No reset for nows')],
  ]);
  const opcionesRend = Array.from(opciones,([key])=><option key={key} value={key}>{key}</option>);

  const seleccionarOpcion = (ev:ChangeEvent<HTMLSelectElement>)=>{
    const f = opciones.get(ev.target.value);
    if(f) {
      f();
    }
  };

  return (
    <div className='opciones'>
      <select name='opciones' value='' onChange={seleccionarOpcion}>
        {opcionesRend}
        <option value=''>Opciones</option>
      </select>
    </div>
  );
};

export default () =>
{
  const id = (document.location.hash).slice(1).toString();
  return (<div className='app'>
    {/* <RabbitEmpireClient playerID={id} /> */}
    <RabbitEmpireClient playerID='0' />
    <RabbitEmpireClient playerID='1' />
    {/* <RabbitEmpireClient playerID='2' /> */}
    <Menu />
  </div>);
}
// export default RabbitEmpireClient;