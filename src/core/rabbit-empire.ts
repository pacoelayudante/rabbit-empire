import { PluginPlayer } from 'boardgame.io/plugins';
import { Game, Ctx, PlayerID } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { TipoRecurso, TipoTerritorio, ITerritorio, TipoItem, TipoCarta, ICarta, IJugador, IState, ICtx, IFicha, IFeudo } from './tipos';
import {fichaValidaParaTerritorio} from './validacion';

const cartasPorRonda: number = 4
const cartasElegidasPorTurno: number = 2

const cantCastillos: number[] = [9, 9, 3];
const cantCampamentos: number = 6;
const cantTorres: number = 3;
const cantCartasRecurso = [
    { tipo: TipoRecurso.Mercado, cant: 2 },//comodin
    { tipo: TipoRecurso.Zanahoria, cant: 1 },
    { tipo: TipoRecurso.Madera, cant: 1 },
    { tipo: TipoRecurso.Pescado, cant: 1 },
    { tipo: TipoRecurso.Perla, cant: 1 },
    { tipo: TipoRecurso.Hongo, cant: 1 },
    { tipo: TipoRecurso.Especia, cant: 1 },
    { tipo: TipoRecurso.Diamante, cant: 1 },
    { tipo: TipoRecurso.Oro, cant: 1 },
    { tipo: TipoRecurso.Cobre, cant: 1 },
    { tipo: TipoRecurso.Metal, cant: 1 },
]

const recursosBaseDeRecursos: any = {
    [TipoTerritorio.Bosque]: TipoRecurso.Madera,
    [TipoTerritorio.Granja]: TipoRecurso.Zanahoria,
    [TipoTerritorio.Lago]: TipoRecurso.Pescado,
};

const premapa: string[] = [
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
].map(fila => fila.replace(/[^cpgbml]/gi, ''));//trimear mapa

const ancho = premapa[0].length;
const alto = premapa.length;
const vecindadesMapper = (indice: number): number[] => {
    return [
        indice - ancho, // arriba
        (indice % ancho + 1) < ancho ? indice + 1 : -1, // derecha
        indice + ancho, // abajo
        (indice % ancho > 0) ? indice - 1 : -1, // izquierda
    ];
};

// const fichaUbicable = (jug: IJugador, ficha: IFicha, territorio: ITerritorio): boolean => {
//     if (!jug.itemsEnMano.includes(ficha) || territorio.dueño !== jug.id || territorio.ficha) return false;
//     if (ficha.torres && ficha.torres >= 3 && territorio.tipo !== TipoTerritorio.Montaña) return false;
//     if (ficha.recurso && requerimentosDeLujo[ficha.recurso] && territorio.tipo !== requerimentosDeLujo[ficha.recurso]) return false;
//     return true;
// }

const mapeoTerritoriosLetra: any = {
    'c': TipoTerritorio.PuebloInicial,
    'p': TipoTerritorio.Pradera,
    'g': TipoTerritorio.Granja,
    'b': TipoTerritorio.Bosque,
    'm': TipoTerritorio.Montaña,
    'l': TipoTerritorio.Lago,
};

const letraTerritorio = (indice: number, x: number, y: number, letra: string): ITerritorio => {
    letra = ['c', 'p', 'g', 'b', 'm', 'l'][Math.floor(Math.random() * 6.0)];
    const territorio: ITerritorio = {
        indice: indice, x: x, y: y, tipo: mapeoTerritoriosLetra[letra], vecindad: vecindadesMapper(indice),
    };
    if (territorio.tipo === TipoTerritorio.PuebloInicial) {
        territorio.ficha = { indice: indice, tipo: TipoItem.Castillo, torres: 1 };
    }
    if (recursosBaseDeRecursos[territorio.tipo]) {
        territorio.recurso = recursosBaseDeRecursos[territorio.tipo];
    }
    return territorio;
}

const crearCartas = (territorios: ITerritorio[]): ICarta[] => {
    let indiceDeCarta: number = territorios.length - 1;// arranco en -1 porque voy a ir haciendo ++X en vez de X++

    const cartasTerritorios = territorios.map(
        (territorio): ICarta => ({
            indice: territorio.indice, tipo: TipoCarta.Territorio,
            nombre: `territorio ${(territorio.x + 1)}-${(territorio.y + 1)}`,
            territorio: territorio.indice
        }),
    );

    const cartasCastillos = cantCastillos.map(
        (cants, cantTorres): ICarta[] => new Array(cants).fill('').map(
            (): ICarta => ({
                indice: (++indiceDeCarta), tipo: TipoCarta.Item, nombre: 'ciudad',
                item: { indice: indiceDeCarta, tipo: TipoItem.Castillo, torres: (cantTorres + 1) }
            })
        )
    ).reduce((a,b)=>a.concat(b),[]);

    const cartasCamps = new Array(cantCampamentos).fill('').map(
        (nada, indice): ICarta => ({
            indice: (++indiceDeCarta), tipo: TipoCarta.Item, nombre: 'campamento',
            item: { indice: indiceDeCarta, tipo: TipoItem.Campamento, prioridad: indice }
        })
    );

    const cartasTorres = new Array(cantTorres).fill('').map(
        (nada, indice): ICarta => ({
            indice: (++indiceDeCarta), tipo: TipoCarta.Item, nombre: 'torre celestial',
            item: { indice: indiceDeCarta, tipo: TipoItem.TorreCelestial, color: indice }
        })
    );

    const cartasRecursos = cantCartasRecurso.map(
        (combo): ICarta[] => new Array(combo.cant).fill('').map(
            (): ICarta => ({
                indice: (++indiceDeCarta), tipo: TipoCarta.Item, nombre: 'recurso',
                item: { indice: indiceDeCarta, tipo: TipoItem.Recurso, recurso: combo.tipo }
            })
        )
    ).reduce((a,b)=>a.concat(b),[]);;

    return [...cartasTerritorios, ...cartasCastillos, ...cartasCamps, ...cartasTorres, ...cartasRecursos];
}

const playerSetup = (playerID: PlayerID): IJugador => {
    return ({
        id: playerID,
        nombre: 'sin nombre',
        mano: [],
        cartasApropiadas: [],
        cartasElegidas: [],
        ptsPorTurno: [],
        itemsEnMano: [],
        ptsPorPegaminos: 0,
        ptsPorTesoros: 0,
        terminado: false,
    });
};

const accionTerminar = (G: IState, ctx: ICtx, terminar: boolean) => {
    if (!ctx.playerID) {
        console.warn(`ctx.playerID = ${ctx.playerID} - esto no puede suceder`);
        console.log(ctx);
        return INVALID_MOVE;
    }
    G.jugadores[ctx.playerID].terminado = terminar;
};

const accionElegirCartas = (G: IState, ctx: ICtx, cartas: number[]) => {
    if (!ctx.playerID) {
        console.warn(`ctx.playerID = ${ctx.playerID} - esto no puede suceder`);
        console.log(ctx);
        return INVALID_MOVE;
    }
    const jug = G.jugadores[ctx.playerID];

    if (cartas === null) cartas = [];
    //cartas es un array
    //deben ser todos numeros validos
    //debe y la cantidad de cartas correcta
    if (cartas.length === undefined || cartas.some(cada => cada === undefined)) return INVALID_MOVE;
    //debe tenerla en la mano
    if (cartas.some(cada => !jug.mano.includes(cada))) return INVALID_MOVE;
    //no debe haber duplicadas (esto es asi, filtro las cartas iguales, deberia filtrarse solo una, si misma)
    if (cartas.some(cada => cartas.length !== cartas.filter(filtrada => filtrada !== cada).length + 1)) return INVALID_MOVE;

    jug.cartasElegidas = cartas.slice(0, G.reglas.cartasElegidasPorTurno);
    jug.terminado = cartas.length === G.reglas.cartasElegidasPorTurno;
    G.jugadores[ctx.playerID] = jug;
};

const accionUbicar = (G: IState, ctx: ICtx, idItem: number, indTerritorio: number[]) => {
    if (!ctx.playerID) {
        console.warn(`ctx.playerID = ${ctx.playerID} - esto no puede suceder`);
        console.log(ctx);
        return INVALID_MOVE;
    }

    const territorios = indTerritorio.map(ind => G.mapaIndexado[ind]).map(({ y, x }: { y: number, x: number }) => G.mapa[y][x]);
    
    const pj = G.jugadores[ctx.playerID];
    const ficha = pj.itemsEnMano.find(item => item.indice === idItem);
    //chequear si el item esta en al mano
    if (!ficha) return INVALID_MOVE;

    const pid = ctx.playerID;// esto es para que typescript no me joda aca abajo
    if (territorios.some(terr=>fichaValidaParaTerritorio(G,pid,ficha,terr)===false)) return INVALID_MOVE;

    if (ficha.tipo === TipoItem.TorreCelestial) {
        //dos territorios elegidos para la torre celestial
        if (territorios.length < 2) return INVALID_MOVE;

        territorios.forEach( terr=>{
            const agregar = territorios.filter(este=>este.indice!==terr.indice&&!terr.vecindad.includes(este.indice));
            terr.vecindad.push(...agregar.map(este=>este.indice));
        } );
    }
    else if (ficha.tipo === TipoItem.Campamento) {
        territorios.forEach(terr => terr.dueño = pid);
    }
    territorios.forEach(terr => terr.ficha = ficha);
    G.jugadores[ctx.playerID].itemsEnMano = pj.itemsEnMano.filter(itm => itm.indice !== idItem);
    actualizarFeudos(G);
}

const finDeTurnoRevelar = (G: IState, ctx: ICtx) => {
    const newJugState = ctx.playOrder.map(cada => {
        const jug = G.jugadores[cada];
        jug.mano = jug.mano.filter(carta => !jug.cartasElegidas.includes(carta));
        jug.cartasElegidas.forEach(elegida => realizarRevelarCarta(G, jug, G.cartas[elegida]));
        jug.cartasApropiadas = [...jug.cartasApropiadas, ...jug.cartasElegidas];
        jug.cartasElegidas = [];
        jug.terminado = false;
        return jug;
    });
    const manos = newJugState.map(jug => jug.mano);
    newJugState.forEach((jug, indice) => {
        jug.mano = manos[(indice + 1) % manos.length];
        G.jugadores[jug.id] = jug;
    });
    actualizarFeudos(G);
}

const floodIndiceFeudo = (G: IState, territorio: ITerritorio, indice: number) => {
    if (territorio.indiceFeudo !== undefined) return;
    territorio.indiceFeudo = indice;
    territorio.vecindad.filter(vecId => G.mapaIndexado[vecId])//vecinos existen?
        .map(vecId => G.mapaIndexado[vecId])//convertir vecino index a {y,x}
        .map(({ y, x }) => G.mapa[y][x])//convertir vecino{y,x} a vecino ITerritorio
        .filter(vecino => (vecino?.dueño === territorio.dueño))//vecino comparte dueño
        .forEach(vecino => floodIndiceFeudo(G, vecino, indice));
};
const actualizarFeudos = (G: IState) => {
    const feudos: IFeudo[] = [];
    G.mapaIndexado.forEach(({ y, x }) => G.mapa[y][x].indiceFeudo = undefined);
    G.mapaIndexado.forEach(({ y, x }) => {
        const territorio = G.mapa[y][x];
        if (territorio.dueño) {
            if (territorio.indiceFeudo === undefined) {
                floodIndiceFeudo(G, territorio, feudos.length);
                if (territorio.indiceFeudo === undefined) return;//innecesario pero para que no joda el error
            }
            const indice = territorio.indiceFeudo;
            if (feudos[indice] === undefined) {
                territorio.indiceFeudo = feudos.length;
                feudos[indice] = ({ territorios: [], dueño: territorio.dueño, torres: 0, recursos: [] });
            }

            feudos[indice].territorios.push(territorio.indice);
            feudos[indice].torres += territorio.ficha?.torres || 0;
            if (territorio.recurso) feudos[indice].recursos.push(territorio.recurso);
            if (territorio.ficha?.recurso) feudos[indice].recursos.push(territorio.ficha.recurso);
        }
    });
    G.feudos = feudos;
}

const realizarRevelarCarta = (G: IState, jug: IJugador, carta: ICarta) => {
    if (carta.territorio !== undefined) realizarRevelarTerritorio(G, jug, G.mapa[G.mapaIndexado[carta.territorio].y][G.mapaIndexado[carta.territorio].x]);
    else if (carta.item) {
        if (carta.item.tipo === TipoItem.Provisiones) {
            // PROVISIONES!
        }
        else {
            jug.itemsEnMano = [...jug.itemsEnMano, carta.item];
        }
    }
}
const realizarRevelarTerritorio = (G: IState, jug: IJugador, territorio: ITerritorio) => {
    territorio.dueño = jug.id;
    if (territorio.ficha && territorio.ficha.tipo === TipoItem.Campamento) territorio.ficha = undefined;
};

const RabbitEmpire: Game<IState, ICtx> = {
    name: 'rabbit-empire',

    plugins: [PluginPlayer({ setup: playerSetup })],

    setup: (ctx: ICtx, setupData): IState => {
        const trimpremapa = premapa;
        let indiceT: number = 0;
        const mapa = trimpremapa.map((fila, y) => fila.split('').map((letra, x) => letraTerritorio(indiceT++, x, y, letra)));
        const flatMap: ITerritorio[] = [];
        mapa.forEach(subMapa => flatMap.push(...subMapa));
        
        const mapaIndexado = flatMap.map(terr => ({ y: terr.y, x: terr.x }));
        const cartas = crearCartas(flatMap);
        const mazo = ctx.random.Shuffle(cartas.map(carta => carta.indice));

        return ({
            mapa: mapa, mapaIndexado: mapaIndexado, feudos: [], cartas: cartas, mazo: mazo, jugadores: ctx.player.state,
            reglas: { cartasElegidasPorTurno: cartasElegidasPorTurno, cartasPorRonda: cartasPorRonda }
        });
    },

    phases: {
        inicio: {
            // start:true,
            //nada
        },
        robar: {
            start: true,
            next: 'draftear',

            endIf: () => true,
            onEnd: (G: IState, ctx: ICtx) => {
                const pdata = G.jugadores;
                const mazo = G.mazo;
                ctx.playOrder.forEach((jug, index) => {
                    const jugState = pdata[jug];
                    jugState.mano = mazo.splice(0, cartasPorRonda);
                    jugState.terminado = false;
                    pdata[jug] = jugState;
                });
            },
        },
        draftear: {
            turn: {
                activePlayers: { all: 'draftear' },
                stages: {
                    draftear: {
                        moves: { accionElegirCartas, accionTerminar },
                    },
                },
                endIf: (G: IState, ctx: ICtx) => (ctx.playOrder.every(cadaJug => G.jugadores[cadaJug].terminado
                    && G.jugadores[cadaJug].cartasElegidas.length === G.reglas.cartasElegidasPorTurno)),
                onEnd: finDeTurnoRevelar,
            },

            endIf: (G: IState, ctx: ICtx) => ctx.playOrder.some(pid => G.jugadores[pid].mano.length === 0),

            next: 'ubicar',
        },
        ubicar: {
            turn: {
                activePlayers: { all: 'ubicar' },
                stages: {
                    ubicar: {
                        moves: { accionUbicar, accionTerminar },
                    }
                }
            },
            endIf: (G: IState, ctx: ICtx) => ctx.playOrder.every(pid => G.jugadores[pid].terminado),
            next: 'robar',
        },
        puntuar: {},
    },

}

export {RabbitEmpire};