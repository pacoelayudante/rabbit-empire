import React, {useState} from 'react';
import { Ctx, State, MoveMap } from 'boardgame.io/src/types';
import { Territorio, TipoTerritorio, Ficha, TipoFicha, Jugador, Carta, TipoCarta } from './tipos';

const imgCasilleros = {
    [TipoTerritorio.Bosque]: require('./imagenes/terrenos/bosque.png'),
    [TipoTerritorio.Granja]: require('./imagenes/terrenos/granja.png'),
    [TipoTerritorio.Lago]: require('./imagenes/terrenos/lago.png'),
    [TipoTerritorio.Montaña]: require('./imagenes/terrenos/montania.png'),
    [TipoTerritorio.Pradera]: require('./imagenes/terrenos/pradera.png'),
    [TipoTerritorio.PuebloInicial]: require('./imagenes/terrenos/pueblo.png'),
};
const imgCastillos = [null,require('./imagenes/terrenos/castillo1.png')
    ,require('./imagenes/terrenos/castillo2.png'),require('./imagenes/terrenos/castillo3.png')];

const FichaEnTablero = ({territorio}) => {
    let ficha : Ficha = territorio.ficha;
    let imagen = null;
    if (ficha.tipo === TipoFicha.Ciudad && ficha.torres) {
        imagen = imgCastillos[ficha.torres];
    }
    return (<img src={imagen} alt={ficha.tipo}/>);
}

const Mapa = ({G,moves,playerID}):React.FC<State,MoveMap,string> => {
    const jug : Jugador = G.players.state[playerID];
    const mapa : Territorio[][] = G.mapa;
    const filas : number = mapa.length;

    let brillos = jug.mano.map<Carta>(carta=>G.cartas[carta]).filter(carta=>carta.tipo === TipoCarta.Territorio)
        .map(carta=>carta.territorio?.indice);
    // console.log(moves);
    const classBrillo = 'brillo';

    let grillaMapa = mapa.map(
        (fila,y) => {
            let filaCasilleros = fila.map(
                casillero => {
                    return (<div key={casillero.x} className={'casillero '+(brillos.includes(casillero.indice)&&classBrillo)}>
                            <img alt={casillero.tipo} src={imgCasilleros[casillero.tipo]} />
                            {casillero.ficha && <FichaEnTablero territorio={casillero} />}
                        </div>);
                }
            )
            return (<div className='fila-casilleros' key={y}>{filaCasilleros}</div>);
        }
    );

    return (
        <div className='mapa' onClick={moves.accionSignal} style={{'--cant-casilleros':filas}}>
            {grillaMapa}
        </div>
    );
};
const Mano = ({G,ctx,moves,playerID}):React.FC<State,Ctx,MoveMap,string> =>{  
    // const pdata : PlayerAPI = ctx.player;
    // const jug : Jugador = pdata.state[ctx.playerID];
    // console.log(pdata);
    // console.log(jug);
    const mano : number[] = G.players.state[playerID].mano;
    const manoRend = mano.map(cadaCarta => <div key={cadaCarta}>{G.cartas[cadaCarta].nombre} ({cadaCarta}-{G.cartas[cadaCarta].tipo})</div>);

    return (<div>
        {manoRend}
    </div>);
}

const Tablero = ({G,ctx,moves,playerID}):React.FC<State,Ctx,MoveMap,string> =>{
    const [cartasElegidas,setCartasElegidas] = useState<number[]>([]);
    // let mapa : Territorio[][] = G.mapa;
    // let filas : number = mapa.length;
    // // console.log(moves);

    // let grillaMapa = mapa.map(
    //     (fila,y) => {
    //         let filaCasilleros = fila.map(
    //             casillero => {
    //                 return (<div key={casillero.x} className='casillero'>
    //                         <img alt={casillero.tipo} src={imgCasilleros[casillero.tipo]} />
    //                         {casillero.ficha && <FichaEnTablero territorio={casillero} />}
    //                     </div>);
    //             }
    //         )
    //         return (<div className='fila-casilleros' key={y}>{filaCasilleros}</div>);
    //     }
    // );

    return (
        // <div className='mapa' onClick={moves.accionSignal} style={{'--cant-casilleros':filas}}>
        //     {grillaMapa}
        // </div>
        <div className='tablero'>
            <Mapa G={G} moves={moves} playerID={playerID}/>
            <Mano G={G} ctx={ctx} moves={moves} playerID={playerID}/>
        </div>
    );
};

export default Tablero;