import { PluginPlayer } from 'boardgame.io/plugins';
import { Game, Ctx, PlayerID } from 'boardgame.io';
import { TipoRecurso, TipoTerritorio, ITerritorio, TipoFicha, TipoCarta, ICarta, IJugador, IState, ICtx } from './tipos';

const cartasPorRonda : number = 3;//10
const cartasElegidasPorTurno : number = 1;//2

const cantCastillos : number[] = [9,9,3];
const cantCampamentos : number = 6;
const cantTorres : number = 3;
const cantCartasRecurso = [
    { tipo:TipoRecurso.Zanahoria, cant:1 },
    { tipo:TipoRecurso.Madera, cant:1 },
    { tipo:TipoRecurso.Pescado, cant:1 },
    { tipo:TipoRecurso.Comodin, cant:2 },
]

const premapa : string[] = [
    // 'ccc cc',
    // 'ccc cc',
    // 'ccc cc',
    
    // 'ccc cc',
    // 'ccc cc',
    'cpgb mblp cc',
    'cpgb mblp cc',
    'cpgb mblp cc',
    'cpgb mblp cc',
    
    'cpgb mblp cc',
    'cpgb mblp cc',
    'cpgb mblp cc',
    'cpgb mblp cc',
    
    'cpgb mblp cc',
    'cpgb mblp cc',
]

const mapeoTerritoriosLetra : any = {
    'c' : TipoTerritorio.PuebloInicial,
    'p' : TipoTerritorio.Pradera,
    'g' : TipoTerritorio.Granja,
    'b' : TipoTerritorio.Bosque,
    'm' : TipoTerritorio.Montaña,
    'l' : TipoTerritorio.Lago,
};

const letraTerritorio = (indice:number,x:number,y:number,letra:string):ITerritorio => {
    letra = ['c','p','g','b','m','l'][Math.floor(Math.random()*6.0)];
    const territorio : ITerritorio = {
        indice:indice,x:x,y:y,tipo:mapeoTerritoriosLetra[letra],
    };
    if (territorio.tipo === TipoTerritorio.PuebloInicial) {
        territorio.ficha = {tipo:TipoFicha.Ciudad,torres:1};
    }
    return territorio;
}

const crearCartas = (territorios:ITerritorio[]):ICarta[] => {
    let indiceDeCarta : number = 0;
    
    const cartasTerritorios = territorios.map(
        (territorio):ICarta=>({
            indice:(indiceDeCarta++), tipo:TipoCarta.Territorio,
            nombre:`territorio ${(territorio.x+1)}-${(territorio.y+1)}`,
            territorio:territorio}),
    );

    // const cartasCastillos = cantCastillos.flatMap(
    //     (cants,cantTorres):Carta[]=>new Array(cants).fill('').map(
    //         ():Carta => ({indice:(indiceDeCarta++), tipo:TipoCarta.Item, nombre: 'ciudad', item:{tipo:TipoFicha.Ciudad,torres:(cantTorres+1)}})
    //     )
    // );

    // const cartasCamps = new Array(cantCampamentos).fill('').map(
    //     (nada,indice):Carta=>({indice:(indiceDeCarta++), tipo:TipoCarta.Item, nombre:'campamento', item:{tipo:TipoFicha.Campamento,prioridad:indice}})
    // );
    
    // const cartasTorres = new Array(cantTorres*2).fill('').map(
    //     (nada,indice):Carta=>({indice:(indiceDeCarta++), tipo:TipoCarta.Item, nombre:'torre celestial', item:{tipo:TipoFicha.TorreCelestial,color:indice%cantTorres}})
    // );

    // const cartasRecursos = cantCartasRecurso.flatMap(
    //     (combo):Carta[]=>new Array(combo.cant).fill('').map(
    //         ():Carta => ({indice:(indiceDeCarta++), tipo:TipoCarta.Item, nombre: 'recurso', item:{tipo:TipoFicha.Recurso, recurso:combo.tipo}})
    //     )
    // );

    // return [...cartasTerritorios, ...cartasCastillos,...cartasCamps,...cartasTorres, ...cartasRecursos];
    return cartasTerritorios;
}

const playerSetup = (playerID:PlayerID):IJugador => {
    return ({
        id: playerID,
        nombre: 'sin nombre',
        mano:[],
        cartasApropiadas:[],
        cartasElegidas:[],
        ptsPorTurno:[],
        items:[],
        ptsPorPegaminos:0,
    });
};

const accionElegirCartas = (G:IState,ctx:ICtx,cartas:number[])=>{
    if (!ctx.playerID) return;
    const pdata = ctx.player;
    const jug = pdata.state[ctx.playerID];

    if (cartas == null) {
        //cancelar
        jug.cartasElegidas = [];
        pdata.state[ctx.playerID] = jug;
        return;
    }
    //cartas es un array
    //deben ser todos numeros validos
    //debe y la cantidad de cartas correcta
    if (!cartas.length || cartas.some(cada=>cada===undefined) || cartas.length !== G.reglas.cartasElegidasPorTurno) return;
    //debe tenerla en la mano
    if (cartas.some(cada=>!jug.mano.includes(cada))) return;
    //no debe haber duplicadas (esto es asi, filtro las cartas iguales, deberia filtrarse solo una, si misma)
    if (cartas.some(cada=>cartas.length !== cartas.filter(filtrada=>filtrada!==cada).length+1 )) return;

    jug.cartasElegidas = cartas;
    pdata.state[ctx.playerID] = jug;
};
const accionSignal = (G:IState,ctx:Ctx)=>{
    console.log('playerID ' + ctx.playerID); // SI FUNCA PERO NO EN DEBUG
    console.log('currentPlayer ' + ctx.currentPlayer);
}

const faseRevelar = (G:IState,ctx:ICtx)=>{
    console.log('revelar');
    const newJugState = ctx.playOrder.map(cada=>{
        const jug = ctx.player.state[cada];
        jug.mano = jug.mano.filter(carta=>!jug.cartasElegidas.includes(carta));
        jug.cartasElegidas.forEach(elegida=>{
            const carta = G.cartas[elegida];
            if(carta.territorio) revelarTerritorio(G,jug,carta.territorio);
        });
        jug.cartasApropiadas = [...jug.cartasApropiadas,...jug.cartasElegidas];
        jug.cartasElegidas = [];
        return jug;
    });
    const manos = newJugState.map(jug=>jug.mano);
    newJugState.forEach((jug,indice) => {
        jug.mano = manos[(indice+1)%manos.length];
        ctx.player.state[jug.id] = jug;
    });

    return true;
}

const revelarTerritorio = (G:IState,jug:IJugador,territorio:ITerritorio)=>{
    territorio.dueño = jug.id;
    G.mapa[territorio.y][territorio.x] = territorio;
};

const RabbitEmpire : Game<IState,ICtx> = {
    name : 'RabbitEmpire',

    plugins : [PluginPlayer({setup:playerSetup})],

    setup : (ctx:ICtx, setupData):IState => {
        const trimpremapa = premapa.map(fila=>fila.replace(/[^cpgbml]/gi,''));        
        let indiceT : number = 0;
        const mapa = trimpremapa.map( (fila,y)=> fila.split('').map((letra,x)=>letraTerritorio(indiceT++,x,y,letra)) );
        const cartas = crearCartas(mapa.flat());
        const mazo = ctx.random.Shuffle( cartas.map(carta=>carta.indice) );

        return ({mapa:mapa,cartas:cartas,mazo:mazo,players:ctx.player.state,
            reglas:{cartasElegidasPorTurno:cartasElegidasPorTurno,cartasPorRonda:cartasPorRonda} });
    },

    phases : {
        inicio:{
            // start:true,
            //nada
        },
        predraftear:{      
            start:true,
            next:'draftear',

            endIf:(G:IState, ctx:ICtx) => {
                const pdata = ctx.player;
                const mazo = G.mazo;
                ctx.playOrder.forEach((jug,index)=>{
                    const jugState = pdata.state[jug];
                    jugState.mano = mazo.splice(0, cartasPorRonda);
                    pdata.state[jug] = jugState;
                });
                return true;
            },
        },
        draftear:{
            onBegin: (G:IState, ctx:ICtx) => {
                console.log('draft begin');
                // ctx.events.setActivePlayers({ all:'draftear' });
            },

            turn:{
                activePlayers: {all:'draftear'},
                stages:{
                    draftear:{
                        moves: {accionElegirCartas,accionSignal},
                    },
                },
                // endIf: (G:IState, ctx:ICtx) => ctx.playOrder.every(cadaJug=>ctx.player.state[cadaJug].cartasElegidas.length===G.reglas.cartasElegidasPorTurno),
                endIf: ()=>true,
            },
            
            endIf: (G:IState, ctx:ICtx) => ctx.playOrder.every(cadaJug=>ctx.player.state[cadaJug].cartasElegidas.length===G.reglas.cartasElegidasPorTurno),
            // endIf: ()=>true,

            next:'revelar',
        },
        revelar:{
            endIf: faseRevelar,
            // endIf:()=>true,
            next:'draftear',
        },
        puntuar:{},
    },

}

export default RabbitEmpire;