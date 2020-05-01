import React, { useState, ReactNode, ChangeEvent } from 'react';
import { MoveMap, PlayerID } from 'boardgame.io';
import { ITerritorio, TipoTerritorio, IState, ICarta, ICtx, IFicha, TipoRecurso } from './tipos';

const imgConejos = [require('./imagenes/conejo_celeste.png'),
    require('./imagenes/conejo_naranja.png'),require('./imagenes/conejo_verde.png')]
const imgCasilleros = {
    [TipoTerritorio.Bosque]: require('./imagenes/bosque.png'),
    [TipoTerritorio.Granja]: require('./imagenes/granja.png'),
    [TipoTerritorio.Lago]: require('./imagenes/lago.png'),
    [TipoTerritorio.Montaña]: require('./imagenes/montania.png'),
    [TipoTerritorio.Pradera]: require('./imagenes/pradera.png'),
    [TipoTerritorio.PuebloInicial]: require('./imagenes/pueblo.png'),
};
const imgCastillos = [null, require('./imagenes/castillo1.png')
    , require('./imagenes/castillo2.png'), require('./imagenes/castillo3.png')];
// const img
const imgRecursos = {
    [TipoRecurso.Madera]: require('./imagenes/madera.png'),
    [TipoRecurso.Zanahoria]: require('./imagenes/zanahoria.png'),
    [TipoRecurso.Pescado]: require('./imagenes/pescado.png'),
    [TipoRecurso.Perla]: require('./imagenes/perla.png'),
    [TipoRecurso.Hongo]: require('./imagenes/hongo.png'),
    [TipoRecurso.Especia]: require('./imagenes/especia.png'),
    [TipoRecurso.Diamante]: require('./imagenes/diamante.png'),
    [TipoRecurso.Oro]: require('./imagenes/oro.png'),
    [TipoRecurso.Cobre]: require('./imagenes/cobre.png'),
    [TipoRecurso.Metal]: require('./imagenes/metal.png'),
    [TipoRecurso.Mercado]: require('./imagenes/mercado.png'),
    [TipoRecurso.Vacio]: null,
};
const imgCamp = require('./imagenes/camp.png');
const imgTorresCelestiales = [require('./imagenes/torre_negra.png'),
    require('./imagenes/torre_celeste.png'),require('./imagenes/torre_verde.png')];
const coloresTorresCelestiales = ['negra,celeste,verde'];

const imgFicha = (ficha:IFicha|undefined)=>{
    if (!ficha) return null;
    else if (ficha.torres) return imgCastillos[ficha.torres];
    else if (ficha.recurso) return imgRecursos[ficha.recurso];
    else if (ficha.prioridad !== undefined) return imgCamp;
    else if (ficha.color !== undefined) return imgTorresCelestiales[ficha.color];
};

const Ficha = ({G,ctx,ficha}:{G?:IState,ctx?:ICtx,ficha:IFicha})=>{
    const img = imgFicha(ficha);
    const txt = `${ficha.tipo} ${ficha.indice} ${ficha?.color} ${ficha?.recurso} ${ficha?.prioridad}`;
    return (<div className={'ficha '+ficha.tipo}>
            {img ? <img src={img} alt={txt}/> : <span>txt</span>}
        </div>);
}
const Territorio = ({territorio,children}:{territorio:ITerritorio,children:ReactNode}) => {
    return (
        <div className='territorio' style={{backgroundImage:`url(${imgCasilleros[territorio.tipo]})`}}>
            {territorio.ficha && <Ficha ficha={territorio.ficha} />}
            {children}
        </div>
    );
};
const Carta = ({carta,playerIndex,children}:{carta:ICarta,playerIndex:number,children:ReactNode})=>{
    return (
        <div className={'carta '+carta.tipo}>
            {carta.item && <Ficha ficha={carta.item} />}
            {carta.territorio!==undefined && <img src={imgConejos[playerIndex]} alt={'territorio '+carta.territorio}/>}
            {children}
        </div>
    );
};

const Tablero = ({ G, ctx, moves, playerID }:{G: IState,ctx: ICtx,moves: MoveMap,playerID?: PlayerID,}) => {
    const [cartasPorElegir, setCartasPorElegir] = useState<number[]>([]);
    if (playerID) ctx.playerID = playerID;
    const playerIndex = playerID ? ctx.playOrder.indexOf(playerID):-1;
    const mano = playerID ? G.players[playerID].mano : [];
    const cartasElegidas = playerID ? G.players[playerID].cartasElegidas : [];
    
    const elegirCarta = (carta:number)=>{
        if (cartasPorElegir.includes(carta)) {
            setCartasPorElegir( cartasPorElegir.filter(cada=>cada!==carta) );
        }
        else {
            setCartasPorElegir( [...cartasPorElegir.reverse().slice(0,G.reglas.cartasElegidasPorTurno-1), carta] );
        };
    }
    const spreadSelector = (id:number) => ({
        name:cartasPorElegir.includes(id),
        onClick:()=>elegirCarta(id),
        className:`seleccionable ${cartasPorElegir.includes(id)?'elegido':''} ${cartasElegidas.includes(id)?'confirmado':''}` 
    });


    const cartasEnManoRend = mano.map(carta=>
        <Carta key={carta} carta={G.cartas[carta]} playerIndex={playerIndex}>
            {!G.cartas[carta].territorio && <span {...spreadSelector(carta)} />}
        </Carta>)

    const filaMapaRend = G.mapa.map(fila=><div className='fila' key={fila[0].indice}>
        {fila.map(terr=>
        <Territorio territorio={terr}>
            {mano.includes(terr.indice) && <span {...spreadSelector(terr.indice)}
                  />}
        </Territorio>)} </div>)

    return (
        <div className={'tablero '+ctx.phase}>
            <div className='mapa' style={{ '--cant-casilleros': G.mapa.length }}>
                {filaMapaRend}
            </div>
            {playerID && <div className='jugador'>
                <div className='data'>Jugador {playerID}</div>
                <div className='mano'>{cartasEnManoRend}</div>
                <div className='items'></div>
            </div>}
        </div>
    );
};

export default Tablero;