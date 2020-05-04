import React, { ReactNode, ChangeEvent, useState, useEffect, useRef } from 'react';
import { MoveMap, PlayerID } from 'boardgame.io';
import { ITerritorio, TipoTerritorio, IState, ICarta, ICtx, IFicha, TipoRecurso, IFeudo, TipoItem } from './core/tipos';
import { territoriosElegibles, recursoMercadoActivo, puntosPorFeudo } from './core/comunes';

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
const imgRecursos = {
    [TipoRecurso.Madera]: [require('./imagenes/madera.png'),require('./imagenes/hay_madera.png')],
    [TipoRecurso.Zanahoria]: [require('./imagenes/zanahoria.png'),require('./imagenes/hay_zanahoria.png')],
    [TipoRecurso.Pescado]: [require('./imagenes/pescado.png'),require('./imagenes/hay_pescado.png')],
    [TipoRecurso.Perla]: [require('./imagenes/perla.png'),require('./imagenes/hay_perla.png')],
    [TipoRecurso.Hongo]: [require('./imagenes/hongo.png'),require('./imagenes/hay_hongo.png')],
    [TipoRecurso.Especia]: [require('./imagenes/especia.png'),require('./imagenes/hay_especia.png')],
    [TipoRecurso.Diamante]: [require('./imagenes/diamante.png'),require('./imagenes/hay_diamante.png')],
    [TipoRecurso.Oro]: [require('./imagenes/oro.png'),require('./imagenes/hay_oro.png')],
    [TipoRecurso.Cobre]: [require('./imagenes/cobre.png'),require('./imagenes/hay_cobre.png')],
    [TipoRecurso.Metal]: [require('./imagenes/metal.png'),require('./imagenes/hay_metal.png')],
    [TipoRecurso.Mercado]: [require('./imagenes/mercado.png'),require('./imagenes/hay_mercado.png')],
    [TipoRecurso.Vacio]: [null,null],
};
// const imgArrow = require('./imagenes/arrow.svg');
const imgMoneda = require('./imagenes/moneda.png');
const imgTorres = require('./imagenes/hay_torres.png');
const imgCamp = require('./imagenes/camp.png');
const imgTorresCelestiales = [require('./imagenes/torre_negra.png'),
    require('./imagenes/torre_celeste.png'),require('./imagenes/torre_verde.png')];

const nombreBordes = ['arr','der','aba','izq'];
// const coloresTorresCelestiales = ['negra,celeste,verde'];

const imgFicha = (ficha:IFicha|undefined)=>{
    if (!ficha) return null;
    else if (ficha.torres) return imgCastillos[ficha.torres];
    else if (ficha.recurso) return imgRecursos[ficha.recurso][0];
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
const Territorio = ({G,ctx,territorio,children}:{G:IState,ctx?:ICtx,territorio:ITerritorio,children:ReactNode}) => {
    const territoriosVecinos = territorio.vecindad.map(indice=>G.mapaIndexado[indice]||({y:-1,x:-1}))
        .map(({y,x})=>G.mapa[y] ? G.mapa[y][x] : undefined);
    const bordes = territoriosVecinos.reduce((actual,terr,ind)=>actual + ' ' + (terr&&ind<nombreBordes.length&&terr.dueño===territorio.dueño?nombreBordes[ind]:''),'');

    return (
        <div className='territorio' style={{backgroundImage:`url(${imgCasilleros[territorio.tipo]})`}}>
            {territorio.ficha && <Ficha ficha={territorio.ficha} />}
            {territorio.dueño && <img className={'control '+bordes+' c'+territorio.dueño} src={imgConejos[parseInt(territorio.dueño)]} alt={'controlado por '+territorio.dueño}/>}
            {children}
        </div>
    );
};

const Feudo = ({feudo}:{feudo:IFeudo})=>{
    const recursosFiltrados = feudo.recursos.filter((rec,i)=>feudo.recursos.indexOf(rec)===i);
    const recursos = recursosFiltrados.map(rec=><img key={rec} src={imgRecursos[rec][1]} alt={'Feudo tiene '+rec} className={rec}/>);
    return (<div className={'feudo '+(recursoMercadoActivo(recursosFiltrados)?'':'sin-mercado')}>
                {recursos.length>0 && <div className='recursos'>{recursos}</div>}
                {feudo.torres>0 && <div className='torres'>{feudo.torres}</div>}
                <div className='puntos'>{puntosPorFeudo(feudo)}</div>
            </div>);
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
const Item = ({ficha,children}:{ficha:IFicha,children:ReactNode})=>{
    return (
        <div className={'item '+ficha.tipo}>
            {ficha && <Ficha ficha={ficha} />}
            {children}
        </div>
    );
};

const Tablero = ({ G, ctx, moves, playerID }:{G: IState,ctx: ICtx,moves: any,playerID?: PlayerID,}) => {
    if (playerID) ctx.playerID = playerID;
    const playerIndex = playerID ? ctx.playOrder.indexOf(playerID):-1;
    const playerData = playerID ? G.jugadores[playerID] : null;

    const [indItemActivo,setItemActivo] = useState<number>(-1);
    const [territorioDestino,setTerritorioDestino] = useState(-1);
    // const []

    const mano = playerData?.mano || [];
    const items = playerData?.itemsEnMano || [];
    const cartasElegidas = playerData?.cartasElegidas || [];
    
    const onClickSeleccionable = (carta:number) => {
        if (cartasElegidas.includes(carta)) {
            moves.accionElegirCartas(cartasElegidas.filter(cada=>cada!==carta));
        }
        else {
            const lista = [...cartasElegidas.slice(-G.reglas.cartasElegidasPorTurno+1), carta]
            moves.accionElegirCartas(lista);
        };
    }
    const spreadSeleccionable = (id:number) => ({
        onClick:()=>onClickSeleccionable(id),
        className:`seleccionable ${cartasElegidas.includes(id)?'elegido':''}` 
    });
    const spreadSeleccionableItem = (indItem:number) => ({
        onClick:()=>{            
            setTerritorioDestino(-1);
            setItemActivo(indItem===indItemActivo?-1:indItem)
        },
        className:`seleccionable ${indItem===indItemActivo?'elegido':''}` 
    });
    const spreadSeleccionableTerritorio = (indTerr:number) => ({
        onClick:()=>{
            if(items.find(it=>it.indice===indItemActivo)?.tipo === TipoItem.TorreCelestial) {
                if (territorioDestino!==-1) {
                    if (territorioDestino!==indTerr) moves.accionUbicar(indItemActivo,[indTerr,territorioDestino]);
                    else {
                        setTerritorioDestino(-1);
                        return; // evitar clean up
                    }
                }
                else {
                    setTerritorioDestino(indTerr);
                    return; // evitar clean up
                }
            }
            else moves.accionUbicar(indItemActivo,[indTerr]);
            setItemActivo(-1);
            setTerritorioDestino(-1);
        },
        className:`seleccionable ${territorioDestino===indTerr?'elegido':''}`
    });

    const cambiarListo = (ev:ChangeEvent<HTMLInputElement>)=>{
        moves.accionTerminar(ev.target.checked);
        setItemActivo(-1);
        setTerritorioDestino(-1);
    }
    const listoActivo:{[fase:string]:()=>boolean} = {
        draftear:()=>cartasElegidas.length!==G.reglas.cartasElegidasPorTurno,
    };

    const cartasEnManoRend = mano.sort((c1,c2)=>c2-c1).map(carta=>
        <Carta key={carta} carta={G.cartas[carta]} playerIndex={playerIndex}>
            {G.cartas[carta].territorio===undefined && <span {...spreadSeleccionable(carta)} />}
        </Carta>)
    const itemsEnManoRend = items.sort((c1,c2)=>c1.indice-c2.indice).map((item)=>
        <Item key={item.indice} ficha={item}>
            {ctx.phase==='ubicar' && <span {...spreadSeleccionableItem(item.indice)} />}
        </Item>)

    const pid = playerID||''; // para que no joda typescript
    const itemActivo = items.find(it=>it.indice===indItemActivo);
    const territoriosUtiles = itemActivo?territoriosElegibles(G,pid,itemActivo):new Array(G.mapaIndexado.length).fill(false);
    const filaMapaRend = G.mapa.map(fila=><div className='fila' key={fila[0].indice}>
        {fila.map(terr=>
        <Territorio key={terr.indice} G={G} territorio={terr}>
            {terr.dueño&& G.feudos[terr.indiceFeudo||0].territorios[0]===terr.indice && <Feudo feudo={G.feudos[terr.indiceFeudo||0]}/>}
            {mano.includes(terr.indice) && <span {...spreadSeleccionable(terr.indice)}/>}
            {territoriosUtiles[terr.indice] && <span {...spreadSeleccionableTerritorio(terr.indice)}/>}
        </Territorio>)} </div>)

    const tableroRef = useRef<HTMLDivElement>(null);
    useEffect(()=>{
        if(tableroRef.current) {
            tableroRef.current.style.setProperty('--img-torres',`url(${imgTorres})`);
            tableroRef.current.style.setProperty('--img-moneda',`url(${imgMoneda})`);
            tableroRef.current.style.setProperty('--cant-casilleros',G.mapa.length.toString());
        }
    });

    const jugadores = ctx.playOrder.map((pid,idx)=><div key={pid} className={'puntos '+(pid===playerID?'actual':'')}>
        <img src={imgConejos[idx]} alt={'puntaje de jugador '+pid}/>
        <span>{G.jugadores[pid].ptsPorTurno.reduce((prev,curr)=>prev+curr,0)}</span>
    </div>);

    return (
        <div ref={tableroRef} className={'tablero '+ctx.phase+((playerData?.terminado)?' terminado':'')}>
            <div className='mapa'>
                {filaMapaRend}
            </div>
            {playerID && <div className='jugador'>
                <div className='data'>
                    {jugadores}
                    <input id='listo' className='listo' type='checkbox' disabled={listoActivo[ctx.phase]?listoActivo[ctx.phase]():false}
                        checked={playerData?.terminado} onChange={cambiarListo}/>
                    {ctx.phase!=='final' && <label htmlFor='listo'/>}
                </div>
                <div className='mano'>{cartasEnManoRend}</div>
                <div className='items'>{itemsEnManoRend}</div>
            </div>}
        </div>
    );
};

export default Tablero;