import { PluginPlayer } from 'boardgame.io/plugins';
import { Game, Ctx, PlayerID } from 'boardgame.io';
import { TipoRecurso, TipoTerritorio, ITerritorio, TipoItem, TipoCarta, ICarta, IJugador, IState, ICtx, IFicha, IFeudo } from './tipos';

const cartasPorRonda : number = 10
const cartasElegidasPorTurno : number = 2

const cantCastillos : number[] = [9,9,3];
const cantCampamentos : number = 6;
const cantTorres : number = 3;
const cantCartasRecurso = [
    { tipo:TipoRecurso.Mercado, cant:2 },//comodin
    { tipo:TipoRecurso.Zanahoria, cant:1 },
    { tipo:TipoRecurso.Madera, cant:1 },
    { tipo:TipoRecurso.Pescado, cant:1 },
    { tipo:TipoRecurso.Perla, cant:1 },
    { tipo:TipoRecurso.Hongo, cant:1 },
    { tipo:TipoRecurso.Especia, cant:1 },
    { tipo:TipoRecurso.Diamante, cant:1 },
    { tipo:TipoRecurso.Oro, cant:1 },
    { tipo:TipoRecurso.Cobre, cant:1 },
    { tipo:TipoRecurso.Metal, cant:1 },
]

const recursosBaseDeRecursos : any = {
    [TipoTerritorio.Bosque] : TipoRecurso.Madera,
    [TipoTerritorio.Granja] : TipoRecurso.Zanahoria,
    [TipoTerritorio.Lago] : TipoRecurso.Pescado,
};
const requerimentosDeLujo = {
    [TipoRecurso.Perla] : TipoTerritorio.Lago,
    [TipoRecurso.Hongo] : TipoTerritorio.Bosque,
    [TipoRecurso.Especia] : TipoTerritorio.Granja,
    [TipoRecurso.Diamante] : TipoTerritorio.Montaña,
    [TipoRecurso.Oro] : TipoTerritorio.Montaña,
    [TipoRecurso.Cobre] : TipoTerritorio.Montaña,
    [TipoRecurso.Metal] : TipoTerritorio.Montaña
}

const premapa : string[] = [
    'ccc cc',
    'ccc cc',
    'ccc cc',
    
    'ccc cc',
    'ccc cc',
    // 'cpgb mblp cc',
    // 'cpgb mblp cc',
    // 'cpgb mblp cc',
    // 'cpgb mblp cc',
    
    // 'cpgb mblp cc',
    // 'cpgb mblp cc',
    // 'cpgb mblp cc',
    // 'cpgb mblp cc',
    
    // 'cpgb mblp cc',
    // 'cpgb mblp cc',
].map(fila=>fila.replace(/[^cpgbml]/gi,''));//trimear mapa

const ancho = premapa[0].length;
const alto = premapa.length;
const vecindadesMapper = (indice:number):number[] => {
    return [
        indice-ancho, // arriba
        (indice%ancho+1)<ancho?indice+1:-1, // derecha
        indice+ancho, // abajo
        (indice%ancho>0)?indice-1:-1, // izquierda
    ];
};

const fichaUbicable = (jug:IJugador, ficha:IFicha, territorio:ITerritorio):boolean=>{
    if (!jug.itemsEnMano.includes(ficha) || territorio.dueño !== jug.id || territorio.ficha) return false;
    if (ficha.torres && ficha.torres >= 3 && territorio.tipo !== TipoTerritorio.Montaña) return false;
    if (ficha.recurso && requerimentosDeLujo[ficha.recurso] && territorio.tipo!==requerimentosDeLujo[ficha.recurso]) return false;
    return true;
}

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
        indice:indice,x:x,y:y,tipo:mapeoTerritoriosLetra[letra],vecindad:vecindadesMapper(indice),
    };
    if (territorio.tipo === TipoTerritorio.PuebloInicial) {
        territorio.ficha = {indice:indice,tipo:TipoItem.Castillo,torres:1};
    }
    if ( recursosBaseDeRecursos[territorio.tipo] ) {
        territorio.recurso = recursosBaseDeRecursos[territorio.tipo];
    }
    return territorio;
}

const crearCartas = (territorios:ITerritorio[]):ICarta[] => {
    let indiceDeCarta : number = territorios.length-1;// arranco en -1 porque voy a ir haciendo ++X en vez de X++
    
    const cartasTerritorios = territorios.map(
        (territorio):ICarta=>({
            indice:territorio.indice, tipo:TipoCarta.Territorio,
            nombre:`territorio ${(territorio.x+1)}-${(territorio.y+1)}`,
            territorio:territorio.indice}),
    );

    const cartasCastillos = cantCastillos.flatMap(
        (cants,cantTorres):ICarta[]=>new Array(cants).fill('').map(
            ():ICarta => ({indice:(++indiceDeCarta), tipo:TipoCarta.Item, nombre: 'ciudad',
                item:{indice:indiceDeCarta,tipo:TipoItem.Castillo,torres:(cantTorres+1)}})
        )
    );

    const cartasCamps = new Array(cantCampamentos).fill('').map(
        (nada,indice):ICarta=>({indice:(++indiceDeCarta), tipo:TipoCarta.Item, nombre:'campamento',
            item:{indice:indiceDeCarta,tipo:TipoItem.Campamento,prioridad:indice}})
    );
    
    const cartasTorres = new Array(cantTorres).fill('').map(
        (nada,indice):ICarta=>({indice:(++indiceDeCarta), tipo:TipoCarta.Item, nombre:'torre celestial',
            item:{indice:indiceDeCarta,tipo:TipoItem.TorreCelestial,color:indice}})
    );

    const cartasRecursos = cantCartasRecurso.flatMap(
        (combo):ICarta[]=>new Array(combo.cant).fill('').map(
            ():ICarta => ({indice:(++indiceDeCarta), tipo:TipoCarta.Item, nombre: 'recurso',
                item:{indice:indiceDeCarta,tipo:TipoItem.Recurso, recurso:combo.tipo}})
        )
    );

    return [...cartasTerritorios, ...cartasCastillos,...cartasCamps,...cartasTorres, ...cartasRecursos];
}

const playerSetup = (playerID:PlayerID):IJugador => {
    return ({
        id: playerID,
        nombre: 'sin nombre',
        mano:[],
        cartasApropiadas:[],
        cartasElegidas:[],
        ptsPorTurno:[],
        itemsEnMano:[],
        ptsPorPegaminos:0,
        ptsPorTesoros:0,
        terminado:false,
    });
};

const accionTerminar = (G:IState,ctx:ICtx,terminar:boolean) => {
    if (!ctx.playerID) {
        console.warn(`ctx.playerID = ${ctx.playerID} - esto no puede suceder`);
        console.log(ctx);
        return;
    }
    const jug = ctx.player.state[ctx.playerID];
    jug.terminado = terminar;
    ctx.player.state[ctx.playerID] = jug;
};

const accionElegirCartas = (G:IState,ctx:ICtx,cartas:number[])=>{
    if (!ctx.playerID) {
        console.warn(`ctx.playerID = ${ctx.playerID} - esto no puede suceder`);
        console.log(ctx);
        return;
    }
    const jug = ctx.player.state[ctx.playerID];

    if (cartas === null) cartas = [];
    //cartas es un array
    //deben ser todos numeros validos
    //debe y la cantidad de cartas correcta
    if (cartas.length===undefined || cartas.some(cada=>cada===undefined)) return;
    //debe tenerla en la mano
    if (cartas.some(cada=>!jug.mano.includes(cada))) return;
    //no debe haber duplicadas (esto es asi, filtro las cartas iguales, deberia filtrarse solo una, si misma)
    if (cartas.some(cada=>cartas.length !== cartas.filter(filtrada=>filtrada!==cada).length+1 )) return;

    jug.cartasElegidas = cartas.slice(0,G.reglas.cartasElegidasPorTurno);    
    jug.terminado = cartas.length === G.reglas.cartasElegidasPorTurno;
    ctx.player.state[ctx.playerID] = jug;
};

const accionUbicar = (G:IState,ctx:ICtx,indiceItem:number, indicesTerritorios:number[]) => {
    if (!ctx.playerID) {
        console.warn(`ctx.playerID = ${ctx.playerID} - esto no puede suceder`);
        console.log(ctx);
        return;
    }
    const mapa = G.mapa;
    let territorios = indicesTerritorios.map(ind=>G.mapaIndexado[ind]).map(({y,x}:{y:number,x:number})=>mapa[y][x]);
    if (territorios.some(terr=>terr.ficha || terr.dueño!==ctx.playerID)) return;
    else {
        //ubicar ficha y hacer cosas
        const pj = ctx.player.state[ctx.playerID];
        const ficha = pj.itemsEnMano[indiceItem];
        if (ficha) {
            if (ficha.tipo !== TipoItem.TorreCelestial) territorios = territorios.slice(0,1);
            territorios.forEach(terr=>terr.ficha=ficha);
            G.mapa = mapa;
            pj.itemsEnMano = pj.itemsEnMano.filter((itm,ind)=>ind!==indiceItem);
            ctx.player.state[ctx.playerID] = pj;
        }
    }
}

const finDeTurnoRevelar = (G:IState,ctx:ICtx)=>{
    if (ctx.playOrder.every(cadaJug=>ctx.player.state[cadaJug].terminado
            && ctx.player.state[cadaJug].cartasElegidas.length===G.reglas.cartasElegidasPorTurno)) {
        console.log('revelar');
        const newJugState = ctx.playOrder.map(cada=>{
            const jug = ctx.player.state[cada];
            jug.mano = jug.mano.filter(carta=>!jug.cartasElegidas.includes(carta));
            jug.cartasElegidas.forEach(elegida=>revelarCarta(G,jug,G.cartas[elegida]));
            jug.cartasApropiadas = [...jug.cartasApropiadas,...jug.cartasElegidas];
            jug.cartasElegidas = [];
            jug.terminado = false;
            return jug;
        });
        const manos = newJugState.map(jug=>jug.mano);
        newJugState.forEach((jug,indice) => {
            jug.mano = manos[(indice+1)%manos.length];
            ctx.player.state[jug.id] = jug;
        });
        actualizarFeudos(G);
        return true;
    }
    else return false;
}

const floodIndiceFeudo = (G:IState,territorio:ITerritorio, indice:number)=>{
    if (territorio.indiceFeudo !== undefined) return;
    territorio.indiceFeudo = indice;
    territorio.vecindad.filter(vecId=>G.mapaIndexado[vecId])//vecinos existen?
        .map(vecId=>G.mapaIndexado[vecId])//convertir vecino index a {y,x}
        .map(({y,x})=>G.mapa[y][x])//convertir vecino{y,x} a vecino ITerritorio
        .filter(vecino=>(vecino?.dueño===territorio.dueño))//vecino comparte dueño
        .forEach(vecino=>floodIndiceFeudo(G,vecino,indice));
};
const actualizarFeudos = (G:IState) => {
    const feudos:IFeudo[] = [];
    G.mapaIndexado.forEach(({y,x})=>G.mapa[y][x].indiceFeudo = undefined);
    G.mapaIndexado.forEach(({y,x})=>{
        const territorio = G.mapa[y][x];
        if (territorio.dueño) {
            if (territorio.indiceFeudo === undefined) {
                floodIndiceFeudo(G,territorio,feudos.length);
                if (territorio.indiceFeudo === undefined) return;//innecesario pero para que no joda el error
            }
            const indice = territorio.indiceFeudo;
            if (feudos[indice] === undefined) {
                territorio.indiceFeudo = feudos.length;
                feudos[indice] = ( {territorios:[],dueño:territorio.dueño,torres:0,recursos:[]} );
            }
            
            feudos[indice].territorios.push(territorio.indice);
            feudos[indice].torres += territorio.ficha?.torres || 0;
            if(territorio.recurso) feudos[indice].recursos.push(territorio.recurso);
            if(territorio.ficha?.recurso) feudos[indice].recursos.push(territorio.ficha.recurso);
        }
    });
    G.feudos = feudos;
}

const revelarCarta = (G:IState,jug:IJugador,carta:ICarta)=>{
    if(carta.territorio!==undefined) revelarTerritorio(G,jug,G.mapa[G.mapaIndexado[carta.territorio].y][G.mapaIndexado[carta.territorio].x]);
    else if (carta.item) {
        if (carta.item.tipo === TipoItem.Provisiones) {
            // PROVISIONES!
        }
        else {
            jug.itemsEnMano = [...jug.itemsEnMano,carta.item];
        }
    }
}

const revelarTerritorio = (G:IState,jug:IJugador,territorio:ITerritorio)=>{
    territorio.dueño = jug.id;
    G.mapa[territorio.y][territorio.x] = territorio;
};

const RabbitEmpire : Game<IState,ICtx> = {
    name : 'RabbitEmpire',

    plugins : [PluginPlayer({setup:playerSetup})],

    setup : (ctx:ICtx, setupData):IState => {
        const trimpremapa = premapa;        
        let indiceT : number = 0;
        const mapa = trimpremapa.map( (fila,y)=> fila.split('').map((letra,x)=>letraTerritorio(indiceT++,x,y,letra)) );
        const flatMap : ITerritorio[] = [];
        mapa.forEach(subMapa => flatMap.push(...subMapa));
        // const cartas = crearCartas(mapa.flat());
        const mapaIndexado = flatMap.map(terr=>({y:terr.y, x:terr.x}));
        const cartas = crearCartas(flatMap);
        const mazo = ctx.random.Shuffle( cartas.map(carta=>carta.indice) );

        return ({mapa:mapa,mapaIndexado:mapaIndexado,feudos:[],cartas:cartas,mazo:mazo,players:ctx.player.state,
            reglas:{cartasElegidasPorTurno:cartasElegidasPorTurno,cartasPorRonda:cartasPorRonda} });
    },

    phases : {
        inicio:{
            // start:true,
            //nada
        },
        robar:{      
            start:true,
            next:'draftear',

            endIf:(G:IState, ctx:ICtx) => {
                const pdata = ctx.player;
                const mazo = G.mazo;
                ctx.playOrder.forEach((jug,index)=>{
                    const jugState = pdata.state[jug];
                    jugState.mano = mazo.splice(0, cartasPorRonda);
                    jugState.terminado = false;
                    pdata.state[jug] = jugState;
                });
                return true;
            },
        },
        draftear:{
            turn:{
                activePlayers: {all:'draftear'},
                stages:{
                    draftear:{
                        moves: {accionElegirCartas,accionTerminar},
                    },
                },
                endIf: finDeTurnoRevelar,
            },
            
            endIf: (G:IState, ctx:ICtx)=> ctx.playOrder.some(pid=>ctx.player.state[pid].mano.length===0),

            next:'ubicar',
        },
        ubicar:{
            turn:{
                activePlayers: {all:'ubicar'},
                stages:{
                    ubicar:{
                        moves:{accionUbicar,accionTerminar},
                    }
                }
            },
            endIf: (G:IState, ctx:ICtx)=> ctx.playOrder.every(pid=>ctx.player.state[pid].terminado),
            next:'robar',
        },
        puntuar:{},
    },

}

export default RabbitEmpire;