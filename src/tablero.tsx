import React, { useState } from 'react';
import { Ctx, State, MoveMap, PlayerID } from 'boardgame.io/src/types';
import { ITerritorio, TipoTerritorio, IState, TipoFicha, IJugador, ICarta, TipoCarta, ICtx } from './tipos';

interface IProp {
    G: IState,
    ctx: Ctx,
    moves: MoveMap,
    playerID?: PlayerID,
}

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

const FichaEnTablero = ({ territorio }: ({ territorio: ITerritorio })) => {
    const ficha = territorio.ficha;
    let imagen = null;
    if (ficha && ficha.tipo === TipoFicha.Ciudad && ficha.torres) {
        imagen = imgCastillos[ficha.torres];
    }
    return (<img src={imagen} alt={ficha?.tipo} />);
}

const Mapa: React.FC<IProp> = ({ G, ctx, elegirCarta, cartasPorElegir }) => {
    const jug = G.players[ctx.playerID || 0];
    const mapa = G.mapa;
    const filas = mapa.length;

    let cartaEnMano = jug.mano.map(carta => G.cartas[carta]).filter(carta => carta.tipo === TipoCarta.Territorio)
        .map(carta => carta.territorio?.indice);
    // console.log(moves);
    const classBrillo = 'brillo ';
    const classElegida = 'elegida';

    let grillaMapa = mapa.map(
        (fila, y) => {
            let filaCasilleros = fila.map(
                casillero => {
                    const estaEnMano = cartaEnMano.includes(casillero.indice);
                    const elegida = cartasPorElegir.includes(casillero.indice);
                    const click = estaEnMano ? ()=>elegirCarta(casillero.indice) : ()=>{};
                    return (<div key={casillero.x} onClick={click}
                        className={'casillero ' + (estaEnMano?classBrillo:'') + (elegida?classElegida:'')}>
                        <img alt={casillero.tipo} src={imgCasilleros[casillero.tipo]} />
                        {casillero.ficha && <FichaEnTablero territorio={casillero} />}
                        {casillero.dueño && (<img alt={casillero.dueño} src={imgConejos[ctx.playOrder.indexOf(casillero.dueño)]} />)}
                    </div>);
                }
            )
            return (<div className='fila-casilleros' key={y}>{filaCasilleros}</div>);
        }
    );

    return (
        <div className='mapa' style={{ '--cant-casilleros': filas }}>
            {grillaMapa}
        </div>
    );
};
const Mano = ({ G, ctx, moves, cartasPorElegir }: IProp) => {
    const jug = G.players[ctx.playerID || 0];
    const mano: number[] = jug.mano;
    const manoRend = mano.map(cadaCarta => <div key={cadaCarta} className={'carta '+(cartasPorElegir.includes(cadaCarta)?'elegida':'')}>
        {G.cartas[cadaCarta].nombre} ({cadaCarta}-{G.cartas[cadaCarta].tipo})</div>);
    
    const confirmar = ()=>{
        moves.accionElegirCartas(cartasPorElegir);
    };
    const cancelar = ()=>{
        moves.accionElegirCartas(null);
    };

    return (<div className='mano'>
        {manoRend}
        <button onClick={confirmar} disabled={G.reglas.cartasElegidasPorTurno!==cartasPorElegir.length}>Confirmar</button>
        <button onClick={cancelar} disabled={jug.cartasElegidas.length!==G.reglas.cartasElegidasPorTurno}>Cancelar</button>
    </div>);
}

const Tablero = ({ G, ctx, moves, playerID }: IProp) => {
    const [cartasPorElegir, setCartasPorElegir] = useState<number[]>([]);
    if (playerID) ctx.playerID = playerID;
    const mano = G.players[playerID||0].mano;

    const elegirCarta = (indice: number) => {
        if (!mano.includes(indice)) return;
        if (cartasPorElegir.includes(indice)) {
            setCartasPorElegir(cartasPorElegir.filter(carta => carta !== indice));
        }
        else {
            if (cartasPorElegir.length >= G.reglas.cartasElegidasPorTurno) {
                cartasPorElegir.pop();
            }
            setCartasPorElegir([indice,...cartasPorElegir]);
        }
    };

    return (
        <div className='tablero'>
            <Mapa G={G} ctx={ctx} elegirCarta={elegirCarta} cartasPorElegir={cartasPorElegir}/>
            <Mano G={G} ctx={ctx} moves={moves} cartasPorElegir={cartasPorElegir} />
        </div>
    );
};

export default Tablero;