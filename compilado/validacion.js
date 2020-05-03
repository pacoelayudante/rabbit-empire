"use strict";
var _a;
exports.__esModule = true;
var tipos_1 = require("./tipos");
var requerimentosDeLujo = (_a = {},
    _a[tipos_1.TipoRecurso.Perla] = tipos_1.TipoTerritorio.Lago,
    _a[tipos_1.TipoRecurso.Hongo] = tipos_1.TipoTerritorio.Bosque,
    _a[tipos_1.TipoRecurso.Especia] = tipos_1.TipoTerritorio.Granja,
    _a[tipos_1.TipoRecurso.Diamante] = tipos_1.TipoTerritorio.Montaña,
    _a[tipos_1.TipoRecurso.Oro] = tipos_1.TipoTerritorio.Montaña,
    _a[tipos_1.TipoRecurso.Cobre] = tipos_1.TipoTerritorio.Montaña,
    _a[tipos_1.TipoRecurso.Metal] = tipos_1.TipoTerritorio.Montaña,
    _a[tipos_1.TipoRecurso.Zanahoria] = null,
    _a[tipos_1.TipoRecurso.Pescado] = null,
    _a[tipos_1.TipoRecurso.Madera] = null,
    _a[tipos_1.TipoRecurso.Vacio] = null,
    _a[tipos_1.TipoRecurso.Mercado] = null,
    _a);
exports.fichaValidaParaTerritorio = function (G, player, ficha, terr) {
    //ya tiene ficha
    if (terr.ficha)
        return false;
    // campamento
    else if (ficha.tipo === tipos_1.TipoItem.Campamento)
        return terr.dueño === undefined;
    else if (terr.dueño === player) {
        // castillo
        if (ficha.torres !== undefined)
            return (ficha.torres < 3 || terr.tipo === tipos_1.TipoTerritorio.Montaña);
        // recurso
        else if (ficha.recurso)
            return (requerimentosDeLujo[ficha.recurso] === null || requerimentosDeLujo[ficha.recurso] === terr.tipo);
        // torre celestial?
        else if (ficha.tipo === tipos_1.TipoItem.TorreCelestial) {
            return G.mapaIndexado.some(function (_a) {
                var y = _a.y, x = _a.x;
                return G.mapa[y][x].indice !== terr.indice &&
                    !(G.mapa[y][x].ficha) &&
                    G.mapa[y][x].dueño === player;
            });
        }
    }
    return false;
};
exports["default"] = (function (G, player, ficha) {
    return G.mapaIndexado.map(function (_a) {
        var y = _a.y, x = _a.x;
        return exports.fichaValidaParaTerritorio(G, player, ficha, G.mapa[y][x]);
    });
});
