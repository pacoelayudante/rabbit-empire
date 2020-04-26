import { PluginPlayer } from 'boardgame.io/plugins';
import { Game, Ctx } from 'boardgame.io';
import { TipoRecurso, TipoTerritorio, Territorio, TipoFicha, TipoCarta, Carta, Jugador } from './tipos';
import { PlayerAPI } from 'boardgame.io/dist/types/src/plugins/plugin-player';

const cartasPorRonda : number = 10;
const cartasPorTurno : number = 2;

const cantCastillos : number[] = [9,9,3];
const cantCampamentos : number = 6;
const cantTorres : number = 3;
const cantCartasRecurso = [
    { tipo:TipoRecurso.Zanahoria, cant:1 },
    { tipo:TipoRecurso.Madera, cant:1 },
    { tipo:TipoRecurso.Pescado, cant:1 },
    { tipo:TipoRecurso.Comodin, cant:2 },
]

const ancho : number = 10;
const alto : number = 10;
const premapa : string[] = [
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

const letraTerritorio = (indice:number,x:number,y:number,letra:string):Territorio => {
    letra = ['c','p','g','b','m','l'][Math.floor(Math.random()*6.0)];
    const territorio : Territorio = {
        indice:indice,x:x,y:y,tipo:mapeoTerritoriosLetra[letra],
    };
    if (territorio.tipo === TipoTerritorio.PuebloInicial) {
        territorio.ficha = {tipo:TipoFicha.Ciudad,torres:1};
    }
    return territorio;
}

const crearCartas = (territorios:Territorio[]):Carta[] => {
    let indiceDeCarta : number = 0;
    
    const cartasTerritorios = territorios.map(
        (territorio):Carta=>({
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

const playerSetup = (playerID):Jugador => {
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

const accionElegirCartas = (G,ctx:Ctx,cartas:number[])=>{
    const pdata : PlayerAPI = ctx.player;
    const jug : Jugador = pdata.state[ctx.playerID];
    const mano : number[] = jug.mano;
    if (cartas.some(cada=>cada===undefined)) {//deben ser todos numeros validos
        return;
    }
    if (unaCarta !== undefined && otraCarta !== undefined && unaCarta !== otraCarta) {
        // mas validaciones (tengo las cartas en la mano por ejemplo)
        // G.
        if(ctx.events && ctx.events.setActivePlayers) ctx.events.setActivePlayers({currentPlayer:player})
        console.log(pdata.get());
        console.log(ctx.activePlayers);
    }
};
const accionSignal = (G,ctx:Ctx)=>{
    // let pdata : PlayerAPI = ctx.player;
    // console.log(pdata.get());
    // console.log(ctx.activePlayers);
    console.log('playerID ' + ctx.playerID); // SI FUNCA PERO NO EN DEBUG
    console.log('currentPlayer ' + ctx.currentPlayer);
    // console.log(G.player);
}

const RabbitEmpire : Game = {
    name : 'RabbitEmpire',

    plugins : [PluginPlayer({setup:playerSetup})],

    setup : (ctx, setupData) => {
        const trimpremapa = premapa.map(fila=>fila.replace(/[^cpgbml]/gi,''));        
        let indiceT : number = 0;
        const mapa:Territorio[][] = trimpremapa.map( (fila,y)=> fila.split('').map((letra,x)=>letraTerritorio(indiceT++,x,y,letra)) );
        const cartas = crearCartas(mapa.flat());
        const mazo = ctx.random?.Shuffle( cartas.map(carta=>carta.indice) );
        // const mazo = cartas.map(carta=>carta.indice);

        return ({mapa:mapa,cartas:cartas,mazo:mazo,players:ctx.player});
    },

    phases : {
        inicio:{
            // start:true,
            //nada
        },
        draftear:{            
            start:true,

            turn:{
                
                onBegin: (G, ctx:Ctx) => {
                    if(ctx.events && ctx.events.setActivePlayers) {
                        ctx.events.setActivePlayers({ all:'draftear', });
                        const pdata : PlayerAPI = ctx.player;
                        const mazo : number[] = G.mazo;
                        ctx.playOrder.forEach((jug,index)=>{
                            const jugState:Jugador = pdata.state[jug];
                            jugState.mano = mazo.splice(0, cartasPorRonda);
                            pdata.state[jug] = jugState;
                        });
                    }
                },

                stages:{
                    draftear:{
                        moves: {accionElegirCartas,accionSignal},
                    },
                    revelar:{},
                }
            }
        },
        puntuar:{},
    },

}

export default RabbitEmpire;