import { PluginPlayer } from 'boardgame.io/plugins';
import { Game, Ctx } from 'boardgame.io';
import { TipoRecurso, TipoTerritorio, Territorio, TipoFicha, TipoCarta, Carta } from './tipos';
import { PlayerAPI } from 'boardgame.io/dist/types/src/plugins/plugin-player';

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

const letraTerritorio = (x:number,y:number,letra:string):Territorio => {
    letra = ['c','p','g','b','m','l'][Math.floor(Math.random()*6.0)];
    const territorio : Territorio = {
        x:x,y:y,tipo:mapeoTerritoriosLetra[letra]
    };
    if (territorio.tipo === TipoTerritorio.PuebloInicial) {
        territorio.ficha = {tipo:TipoFicha.Ciudad,torres:1};
    }
    return territorio;
}

const crearCartas = ():Carta[] => {
    let indiceDeCarta : number = 0;

    let cartasCastillos = cantCastillos.flatMap(
        (cants,cantTorres):Carta[]=>new Array(cants).fill('').map(
            ():Carta => ({indice:(indiceDeCarta++), tipo:TipoCarta.Item, nombre: 'ciudad', item:{tipo:TipoFicha.Ciudad,torres:(cantTorres+1)}})
        )
    );

    let cartasCamps = new Array(cantCampamentos).fill('').map(
        (nada,indice):Carta=>({indice:(indiceDeCarta++), tipo:TipoCarta.Item, nombre:'campamento', item:{tipo:TipoFicha.Campamento,prioridad:indice}})
    );
    
    let cartasTorres = new Array(cantTorres*2).fill('').map(
        (nada,indice):Carta=>({indice:(indiceDeCarta++), tipo:TipoCarta.Item, nombre:'torre celestial', item:{tipo:TipoFicha.TorreCelestial,color:indice%cantTorres}})
    );

    let cartasRecursos = cantCartasRecurso.flatMap(
        (combo):Carta[]=>new Array(combo.cant).fill('').map(
            ():Carta => ({indice:(indiceDeCarta++), tipo:TipoCarta.Item, nombre: 'recurso', item:{tipo:TipoFicha.Recurso, recurso:combo.tipo}})
        )
    );

    return [...cartasCastillos,...cartasCamps,...cartasTorres, ...cartasRecursos];
}

const playerSetup = () => {
    return ({
        mano:[],
        cartasApropiadas:[],
        cartasElegidas:[],
        ptsPorTurno:[],
        ptsPorPegaminos:0,
    });
};

const accionElegirCartas = (G,ctx:Ctx,player:PlayerID,unaCarta:number,otraCarta:number)=>{
    if (unaCarta !== undefined && otraCarta !== undefined && unaCarta !== otraCarta) {
        // mas validaciones (tengo las cartas en la mano por ejemplo)
        // G.
        let pdata : PlayerAPI = ctx.player;
        if(ctx.events && ctx.events.setActivePlayers) ctx.events.setActivePlayers({currentPlayer:player})
        console.log(pdata.get());
        console.log(ctx.activePlayers);
    }
};
const accionSignal = (G,ctx:Ctx)=>{
    let pdata : PlayerAPI = ctx.player;
    console.log(pdata.get());
    console.log(ctx.activePlayers);
    console.log(ctx.playerID); // SI FUNCA PERO NO EN DEBUG
    console.log(ctx.currentPlayer);
    console.log(G.player);
}

const RabbitEmpire : Game = {
    name : 'RabbitEmpire',

    plugins : [PluginPlayer({setup:playerSetup})],

    setup : () => {
        let trimpremapa = premapa.map(fila=>fila.replace(/[^cpgbml]/gi,''));        
        let mapa:Territorio[][] = trimpremapa.map( (fila,y)=> fila.split('').map((letra,x)=>letraTerritorio(x,y,letra)) );
        let cartas = crearCartas();
        let mazo = cartas.map(carta=>carta.indice);

        return ({mapa:mapa,cartas:cartas,mazo:mazo});
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
                    if(ctx.events && ctx.events.setActivePlayers) ctx.events.setActivePlayers({ all:'draftear', });
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