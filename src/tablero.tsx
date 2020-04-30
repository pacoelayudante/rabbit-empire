import React, { useState, ChangeEvent } from 'react';
import { Ctx, State, MoveMap, PlayerID } from 'boardgame.io';
import { ITerritorio, TipoTerritorio, IState, TipoItem, IJugador, ICarta, TipoCarta, ICtx, IFicha, TipoRecurso } from './tipos';

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

const FichaEnTablero = ({ territorio }: ({ territorio: ITerritorio })) => {
    const ficha = territorio.ficha;
    let imagen = imgFicha(ficha);
    // if (ficha && ficha.tipo === TipoItem.Castillo && ficha.torres) {
    //     imagen = imgCastillos[ficha.torres];
    // }
    return (<img src={imagen} alt={ficha?.tipo} />);
}

const Mapa = ({ G, ctx, elegirCarta, cartasPorElegir }:{G:IState,ctx:ICtx,elegirCarta:(indice:number)=>void,cartasPorElegir:number[]}) => {
    const jug = G.players[ctx.playerID || 0];
    const mapa = G.mapa;
    const filas = mapa.length;

    let cartaEnMano = jug.mano.map(carta => G.cartas[carta]).filter(carta => carta.tipo === TipoCarta.Territorio)
        .map(carta => carta.territorio?.indice);
        
    const classBrillo = ' brillo';
    const classElegida = ' elegida';
    const classConfirmada = ' confirmada';

    let grillaMapa = mapa.map(
        (fila, y) => {
            let filaCasilleros = fila.map(
                casillero => {
                    const estaEnMano = cartaEnMano.includes(casillero.indice);
                    const elegida = cartasPorElegir.includes(casillero.indice);
                    const confirmada = jug.cartasElegidas.includes(casillero.indice);
                    const click = estaEnMano ? ()=>elegirCarta(casillero.indice) : ()=>{};
                    return (<div key={casillero.x} onClick={click}
                        className={'casillero' + (estaEnMano?classBrillo:'') + (elegida?classElegida:'') + (confirmada?classConfirmada:'')}>
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

const CartaEnMano = ({ctx,carta,elegida,confirmada,elegirCarta}:{ctx:ICtx,carta:ICarta,elegida:boolean,confirmada:boolean,elegirCarta:(indice:number)=>void}) => {
    let inner : any = carta.nombre;
    const click = carta.territorio ? ()=>{} : ()=>elegirCarta(carta.indice);
    if (carta.territorio) inner = <img src={imgConejos[ctx.playOrder.indexOf(ctx.playerID||'')]} alt='territorio'/>
    else if (carta.item) {
        const img = imgFicha(carta.item);
        if (img) inner = (<img src={img} alt={carta.item.tipo}/>);
        else inner = (<span>{carta.item.tipo} {carta.item.color} {carta.item.recurso} {carta.item.prioridad}</span>);
        // if (carta.item.torres) {
        //     inner = (<img src={imgCastillos[carta.item.torres]} alt='castillo'/>);
        // }
        // else if (carta.item.recurso) {
        //     inner = (<span>{carta.item.recurso}</span>);
        // }
        // else if (carta.item.color) {
        //     inner = (<span>Torre Celestial {coloresTorresCelestiales[carta.item.color]}</span>);
        // }
        // else if (carta.item.prioridad) {
        //     inner = (<span>Campamento con prioridad {carta.item.prioridad}</span>);
        // }

    }

    return (
        <div className={'carta '+(elegida?'elegida ':' ')+(confirmada?'confirmada ':' ')+carta.tipo} onClick={click}>{inner}</div>
    );
}

const Mano = ({ G, ctx, elegirCarta, moves, cartasPorElegir }: {G:IState,ctx:ICtx, elegirCarta:(indice:number)=>void,moves:MoveMap,cartasPorElegir:number[]}) => {
    const jug = G.players[ctx.playerID || 0];
    const mano = jug.mano;
    // const manoRend = mano.map(cadaCarta => <div key={cadaCarta} className={'carta '+(cartasPorElegir.includes(cadaCarta)?'elegida':'')}>
    //     {G.cartas[cadaCarta].nombre} ({cadaCarta}-{G.cartas[cadaCarta].tipo})</div>);
    const manoRend = mano.map(cadaCarta=><CartaEnMano key={cadaCarta} ctx={ctx} carta={G.cartas[cadaCarta]}
        elegida={cartasPorElegir.includes(cadaCarta)} confirmada={jug.cartasElegidas.includes(cadaCarta)} elegirCarta={elegirCarta}/>);
    
    const confirmar = ()=>{
        moves.accionElegirCartas(cartasPorElegir);
    };
    const cancelar = ()=>{
        moves.accionElegirCartas(null);
    };
    const draftear = ctx.phase==='draftear';

    return (<div className='mano'>
        {manoRend}
        {draftear && <button onClick={confirmar} disabled={G.reglas.cartasElegidasPorTurno!==cartasPorElegir.length}>Confirmar</button>}
        {draftear && <button onClick={cancelar} disabled={jug.cartasElegidas.length!==G.reglas.cartasElegidasPorTurno}>Cancelar</button>}
    </div>);
}

const ItemEnMano = ({G,ctx,item}:{G:IState,ctx:ICtx,item:IFicha}) => {
    let inner : any = item.tipo;
    const img = imgFicha(item);
    if (img) inner = (<img src={img} alt={item.tipo}/>);
    else inner = (<span>{item.tipo} {item.color} {item.recurso} {item.prioridad}</span>);
    return (<div className={'item '+item.tipo}>{inner}</div>);
}
const Items = ({G,ctx,moves}:{G:IState,ctx:ICtx,moves:MoveMap})=>{
    const jug = G.players[ctx.playerID || 0];
    const items = jug.itemsEnMano;
    const itemsRend = items.map(cadaItem=><ItemEnMano key={cadaItem.indice} G={G} ctx={ctx} item={cadaItem}/>);
    
    const ubicar = ctx.phase === 'ubicar';
    const changeTerminar = (event:ChangeEvent<HTMLInputElement>)=>{
        moves.accionTerminar(event.target.checked);
    };

    return (<div className='items'>
        {itemsRend}
        {ubicar && <input className='terminar' onChange={changeTerminar} checked={jug.terminado} type='checkbox'/>}
    </div>);
};

const Tablero = ({ G, ctx, moves, playerID }:{G: IState,ctx: ICtx,moves: MoveMap,playerID?: PlayerID,}) => {
    const [cartasPorElegir, setCartasPorElegir] = useState<number[]>([]);
    console.log(`ctx.playerID ${ctx.playerID} --- playerID ${playerID}`);
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
            <div className='jugador'>
                <Mano G={G} ctx={ctx} elegirCarta={elegirCarta} moves={moves} cartasPorElegir={cartasPorElegir} />
                <Items G={G} ctx={ctx} moves={moves}/>
            </div>
        </div>
    );
};

export default Tablero;