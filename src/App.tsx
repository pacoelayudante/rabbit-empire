import React, { ChangeEvent, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Ctx } from 'boardgame.io';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import RabbitEmpire from './rabbit-empire';
import Tablero from './tablero';
import './rabbit-empire.css';

const cantJugs = 1;
// const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:cantJugs, multiplayer: SocketIO({ server: '192.168.0.7:8000' }), board: Tablero, debug:false });
const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:cantJugs, multiplayer: Local(), board: Tablero, debug:document.location.hash.includes('dbg') });
// const RabbitEmpireClient = Client({ game: RabbitEmpire, numPlayers:cantJugs, board: Tablero });

const Menu = ({cambiarPID}:{cambiarPID:(pid:string)=>void})=>{
  const opciones = new Map([
    ['Reset',()=>console.log('No reset for nows')],
    ...new Array(cantJugs).fill('').map<[string,()=>void]>((ply,ind)=>[('Jugar con '+ind),()=>cambiarPID(ind.toString())])
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
  const [PID,cambiarPID] = useState('0');
  return (<div className='app'>
    <RabbitEmpireClient playerID={PID} />
    <Menu cambiarPID={cambiarPID}/>
  </div>);
}