"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var _a;
exports.__esModule = true;
var plugins_1 = require("boardgame.io/plugins");
var core_1 = require("boardgame.io/core");
var tipos_1 = require("./tipos");
var validacion_1 = require("./validacion");
var cartasPorRonda = 4;
var cartasElegidasPorTurno = 2;
var cantCastillos = [9, 9, 3];
var cantCampamentos = 6;
var cantTorres = 3;
var cantCartasRecurso = [
    { tipo: tipos_1.TipoRecurso.Mercado, cant: 2 },
    { tipo: tipos_1.TipoRecurso.Zanahoria, cant: 1 },
    { tipo: tipos_1.TipoRecurso.Madera, cant: 1 },
    { tipo: tipos_1.TipoRecurso.Pescado, cant: 1 },
    { tipo: tipos_1.TipoRecurso.Perla, cant: 1 },
    { tipo: tipos_1.TipoRecurso.Hongo, cant: 1 },
    { tipo: tipos_1.TipoRecurso.Especia, cant: 1 },
    { tipo: tipos_1.TipoRecurso.Diamante, cant: 1 },
    { tipo: tipos_1.TipoRecurso.Oro, cant: 1 },
    { tipo: tipos_1.TipoRecurso.Cobre, cant: 1 },
    { tipo: tipos_1.TipoRecurso.Metal, cant: 1 },
];
var recursosBaseDeRecursos = (_a = {},
    _a[tipos_1.TipoTerritorio.Bosque] = tipos_1.TipoRecurso.Madera,
    _a[tipos_1.TipoTerritorio.Granja] = tipos_1.TipoRecurso.Zanahoria,
    _a[tipos_1.TipoTerritorio.Lago] = tipos_1.TipoRecurso.Pescado,
    _a);
var premapa = [
    'ccc cc',
    'ccc cc',
    'ccc cc',
    'ccc cc',
    'ccc cc',
].map(function (fila) { return fila.replace(/[^cpgbml]/gi, ''); }); //trimear mapa
var ancho = premapa[0].length;
var alto = premapa.length;
var vecindadesMapper = function (indice) {
    return [
        indice - ancho,
        (indice % ancho + 1) < ancho ? indice + 1 : -1,
        indice + ancho,
        (indice % ancho > 0) ? indice - 1 : -1,
    ];
};
// const fichaUbicable = (jug: IJugador, ficha: IFicha, territorio: ITerritorio): boolean => {
//     if (!jug.itemsEnMano.includes(ficha) || territorio.dueño !== jug.id || territorio.ficha) return false;
//     if (ficha.torres && ficha.torres >= 3 && territorio.tipo !== TipoTerritorio.Montaña) return false;
//     if (ficha.recurso && requerimentosDeLujo[ficha.recurso] && territorio.tipo !== requerimentosDeLujo[ficha.recurso]) return false;
//     return true;
// }
var mapeoTerritoriosLetra = {
    'c': tipos_1.TipoTerritorio.PuebloInicial,
    'p': tipos_1.TipoTerritorio.Pradera,
    'g': tipos_1.TipoTerritorio.Granja,
    'b': tipos_1.TipoTerritorio.Bosque,
    'm': tipos_1.TipoTerritorio.Montaña,
    'l': tipos_1.TipoTerritorio.Lago
};
var letraTerritorio = function (indice, x, y, letra) {
    letra = ['c', 'p', 'g', 'b', 'm', 'l'][Math.floor(Math.random() * 6.0)];
    var territorio = {
        indice: indice, x: x, y: y, tipo: mapeoTerritoriosLetra[letra], vecindad: vecindadesMapper(indice)
    };
    if (territorio.tipo === tipos_1.TipoTerritorio.PuebloInicial) {
        territorio.ficha = { indice: indice, tipo: tipos_1.TipoItem.Castillo, torres: 1 };
    }
    if (recursosBaseDeRecursos[territorio.tipo]) {
        territorio.recurso = recursosBaseDeRecursos[territorio.tipo];
    }
    return territorio;
};
var crearCartas = function (territorios) {
    var indiceDeCarta = territorios.length - 1; // arranco en -1 porque voy a ir haciendo ++X en vez de X++
    var cartasTerritorios = territorios.map(function (territorio) { return ({
        indice: territorio.indice, tipo: tipos_1.TipoCarta.Territorio,
        nombre: "territorio " + (territorio.x + 1) + "-" + (territorio.y + 1),
        territorio: territorio.indice
    }); });
    var cartasCastillos = cantCastillos.map(function (cants, cantTorres) { return new Array(cants).fill('').map(function () { return ({
        indice: (++indiceDeCarta), tipo: tipos_1.TipoCarta.Item, nombre: 'ciudad',
        item: { indice: indiceDeCarta, tipo: tipos_1.TipoItem.Castillo, torres: (cantTorres + 1) }
    }); }); }).reduce(function (a, b) { return a.concat(b); }, []);
    var cartasCamps = new Array(cantCampamentos).fill('').map(function (nada, indice) { return ({
        indice: (++indiceDeCarta), tipo: tipos_1.TipoCarta.Item, nombre: 'campamento',
        item: { indice: indiceDeCarta, tipo: tipos_1.TipoItem.Campamento, prioridad: indice }
    }); });
    var cartasTorres = new Array(cantTorres).fill('').map(function (nada, indice) { return ({
        indice: (++indiceDeCarta), tipo: tipos_1.TipoCarta.Item, nombre: 'torre celestial',
        item: { indice: indiceDeCarta, tipo: tipos_1.TipoItem.TorreCelestial, color: indice }
    }); });
    var cartasRecursos = cantCartasRecurso.map(function (combo) { return new Array(combo.cant).fill('').map(function () { return ({
        indice: (++indiceDeCarta), tipo: tipos_1.TipoCarta.Item, nombre: 'recurso',
        item: { indice: indiceDeCarta, tipo: tipos_1.TipoItem.Recurso, recurso: combo.tipo }
    }); }); }).reduce(function (a, b) { return a.concat(b); }, []);
    ;
    return __spreadArrays(cartasTerritorios, cartasCastillos, cartasCamps, cartasTorres, cartasRecursos);
};
var playerSetup = function (playerID) {
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
        terminado: false
    });
};
var accionTerminar = function (G, ctx, terminar) {
    if (!ctx.playerID) {
        console.warn("ctx.playerID = " + ctx.playerID + " - esto no puede suceder");
        console.log(ctx);
        return core_1.INVALID_MOVE;
    }
    G.jugadores[ctx.playerID].terminado = terminar;
};
var accionElegirCartas = function (G, ctx, cartas) {
    if (!ctx.playerID) {
        console.warn("ctx.playerID = " + ctx.playerID + " - esto no puede suceder");
        console.log(ctx);
        return core_1.INVALID_MOVE;
    }
    var jug = G.jugadores[ctx.playerID];
    if (cartas === null)
        cartas = [];
    //cartas es un array
    //deben ser todos numeros validos
    //debe y la cantidad de cartas correcta
    if (cartas.length === undefined || cartas.some(function (cada) { return cada === undefined; }))
        return core_1.INVALID_MOVE;
    //debe tenerla en la mano
    if (cartas.some(function (cada) { return !jug.mano.includes(cada); }))
        return core_1.INVALID_MOVE;
    //no debe haber duplicadas (esto es asi, filtro las cartas iguales, deberia filtrarse solo una, si misma)
    if (cartas.some(function (cada) { return cartas.length !== cartas.filter(function (filtrada) { return filtrada !== cada; }).length + 1; }))
        return core_1.INVALID_MOVE;
    jug.cartasElegidas = cartas.slice(0, G.reglas.cartasElegidasPorTurno);
    jug.terminado = cartas.length === G.reglas.cartasElegidasPorTurno;
    G.jugadores[ctx.playerID] = jug;
};
var accionUbicar = function (G, ctx, idItem, indTerritorio) {
    if (!ctx.playerID) {
        console.warn("ctx.playerID = " + ctx.playerID + " - esto no puede suceder");
        console.log(ctx);
        return core_1.INVALID_MOVE;
    }
    var territorios = indTerritorio.map(function (ind) { return G.mapaIndexado[ind]; }).map(function (_a) {
        var y = _a.y, x = _a.x;
        return G.mapa[y][x];
    });
    var pj = G.jugadores[ctx.playerID];
    var ficha = pj.itemsEnMano.find(function (item) { return item.indice === idItem; });
    //chequear si el item esta en al mano
    if (!ficha)
        return core_1.INVALID_MOVE;
    var pid = ctx.playerID; // esto es para que typescript no me joda aca abajo
    if (territorios.some(function (terr) { return validacion_1.fichaValidaParaTerritorio(G, pid, ficha, terr) === false; }))
        return core_1.INVALID_MOVE;
    if (ficha.tipo === tipos_1.TipoItem.TorreCelestial) {
        //dos territorios elegidos para la torre celestial
        if (territorios.length < 2)
            return core_1.INVALID_MOVE;
        territorios.forEach(function (terr) {
            var _a;
            var agregar = territorios.filter(function (este) { return este.indice !== terr.indice && !terr.vecindad.includes(este.indice); });
            (_a = terr.vecindad).push.apply(_a, agregar.map(function (este) { return este.indice; }));
        });
    }
    else if (ficha.tipo === tipos_1.TipoItem.Campamento) {
        territorios.forEach(function (terr) { return terr.dueño = pid; });
    }
    territorios.forEach(function (terr) { return terr.ficha = ficha; });
    G.jugadores[ctx.playerID].itemsEnMano = pj.itemsEnMano.filter(function (itm) { return itm.indice !== idItem; });
    actualizarFeudos(G);
};
var finDeTurnoRevelar = function (G, ctx) {
    var newJugState = ctx.playOrder.map(function (cada) {
        var jug = G.jugadores[cada];
        jug.mano = jug.mano.filter(function (carta) { return !jug.cartasElegidas.includes(carta); });
        jug.cartasElegidas.forEach(function (elegida) { return realizarRevelarCarta(G, jug, G.cartas[elegida]); });
        jug.cartasApropiadas = __spreadArrays(jug.cartasApropiadas, jug.cartasElegidas);
        jug.cartasElegidas = [];
        jug.terminado = false;
        return jug;
    });
    var manos = newJugState.map(function (jug) { return jug.mano; });
    newJugState.forEach(function (jug, indice) {
        jug.mano = manos[(indice + 1) % manos.length];
        G.jugadores[jug.id] = jug;
    });
    actualizarFeudos(G);
};
var floodIndiceFeudo = function (G, territorio, indice) {
    if (territorio.indiceFeudo !== undefined)
        return;
    territorio.indiceFeudo = indice;
    territorio.vecindad.filter(function (vecId) { return G.mapaIndexado[vecId]; }) //vecinos existen?
        .map(function (vecId) { return G.mapaIndexado[vecId]; }) //convertir vecino index a {y,x}
        .map(function (_a) {
        var y = _a.y, x = _a.x;
        return G.mapa[y][x];
    }) //convertir vecino{y,x} a vecino ITerritorio
        .filter(function (vecino) { var _a; return (((_a = vecino) === null || _a === void 0 ? void 0 : _a.dueño) === territorio.dueño); }) //vecino comparte dueño
        .forEach(function (vecino) { return floodIndiceFeudo(G, vecino, indice); });
};
var actualizarFeudos = function (G) {
    var feudos = [];
    G.mapaIndexado.forEach(function (_a) {
        var y = _a.y, x = _a.x;
        return G.mapa[y][x].indiceFeudo = undefined;
    });
    G.mapaIndexado.forEach(function (_a) {
        var y = _a.y, x = _a.x;
        var _b, _c;
        var territorio = G.mapa[y][x];
        if (territorio.dueño) {
            if (territorio.indiceFeudo === undefined) {
                floodIndiceFeudo(G, territorio, feudos.length);
                if (territorio.indiceFeudo === undefined)
                    return; //innecesario pero para que no joda el error
            }
            var indice = territorio.indiceFeudo;
            if (feudos[indice] === undefined) {
                territorio.indiceFeudo = feudos.length;
                feudos[indice] = ({ territorios: [], dueño: territorio.dueño, torres: 0, recursos: [] });
            }
            feudos[indice].territorios.push(territorio.indice);
            feudos[indice].torres += ((_b = territorio.ficha) === null || _b === void 0 ? void 0 : _b.torres) || 0;
            if (territorio.recurso)
                feudos[indice].recursos.push(territorio.recurso);
            if ((_c = territorio.ficha) === null || _c === void 0 ? void 0 : _c.recurso)
                feudos[indice].recursos.push(territorio.ficha.recurso);
        }
    });
    G.feudos = feudos;
};
var realizarRevelarCarta = function (G, jug, carta) {
    if (carta.territorio !== undefined)
        realizarRevelarTerritorio(G, jug, G.mapa[G.mapaIndexado[carta.territorio].y][G.mapaIndexado[carta.territorio].x]);
    else if (carta.item) {
        if (carta.item.tipo === tipos_1.TipoItem.Provisiones) {
            // PROVISIONES!
        }
        else {
            jug.itemsEnMano = __spreadArrays(jug.itemsEnMano, [carta.item]);
        }
    }
};
var realizarRevelarTerritorio = function (G, jug, territorio) {
    territorio.dueño = jug.id;
    if (territorio.ficha && territorio.ficha.tipo === tipos_1.TipoItem.Campamento)
        territorio.ficha = undefined;
};
var RabbitEmpire = {
    name: 'rabbit-empire',
    plugins: [plugins_1.PluginPlayer({ setup: playerSetup })],
    setup: function (ctx, setupData) {
        var trimpremapa = premapa;
        var indiceT = 0;
        var mapa = trimpremapa.map(function (fila, y) { return fila.split('').map(function (letra, x) { return letraTerritorio(indiceT++, x, y, letra); }); });
        var flatMap = [];
        mapa.forEach(function (subMapa) { return flatMap.push.apply(flatMap, subMapa); });
        var mapaIndexado = flatMap.map(function (terr) { return ({ y: terr.y, x: terr.x }); });
        var cartas = crearCartas(flatMap);
        var mazo = ctx.random.Shuffle(cartas.map(function (carta) { return carta.indice; }));
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
            endIf: function () { return true; },
            onEnd: function (G, ctx) {
                var pdata = G.jugadores;
                var mazo = G.mazo;
                ctx.playOrder.forEach(function (jug, index) {
                    var jugState = pdata[jug];
                    jugState.mano = mazo.splice(0, cartasPorRonda);
                    jugState.terminado = false;
                    pdata[jug] = jugState;
                });
            }
        },
        draftear: {
            turn: {
                activePlayers: { all: 'draftear' },
                stages: {
                    draftear: {
                        moves: { accionElegirCartas: accionElegirCartas, accionTerminar: accionTerminar }
                    }
                },
                endIf: function (G, ctx) { return (ctx.playOrder.every(function (cadaJug) { return G.jugadores[cadaJug].terminado
                    && G.jugadores[cadaJug].cartasElegidas.length === G.reglas.cartasElegidasPorTurno; })); },
                onEnd: finDeTurnoRevelar
            },
            endIf: function (G, ctx) { return ctx.playOrder.some(function (pid) { return G.jugadores[pid].mano.length === 0; }); },
            next: 'ubicar'
        },
        ubicar: {
            turn: {
                activePlayers: { all: 'ubicar' },
                stages: {
                    ubicar: {
                        moves: { accionUbicar: accionUbicar, accionTerminar: accionTerminar }
                    }
                }
            },
            endIf: function (G, ctx) { return ctx.playOrder.every(function (pid) { return G.jugadores[pid].terminado; }); },
            next: 'robar'
        },
        puntuar: {}
    }
};
exports.RabbitEmpire = RabbitEmpire;
