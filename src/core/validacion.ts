import { IFicha, ITerritorio, IState, TipoItem, TipoTerritorio, TipoRecurso } from "./tipos";
import { PlayerID } from "boardgame.io";

const requerimentosDeLujo = {
    [TipoRecurso.Perla]: TipoTerritorio.Lago,
    [TipoRecurso.Hongo]: TipoTerritorio.Bosque,
    [TipoRecurso.Especia]: TipoTerritorio.Granja,
    [TipoRecurso.Diamante]: TipoTerritorio.Montaña,
    [TipoRecurso.Oro]: TipoTerritorio.Montaña,
    [TipoRecurso.Cobre]: TipoTerritorio.Montaña,
    [TipoRecurso.Metal]: TipoTerritorio.Montaña,
    [TipoRecurso.Zanahoria]: null,
    [TipoRecurso.Pescado]: null,
    [TipoRecurso.Madera]: null,
    [TipoRecurso.Vacio]: null,
    [TipoRecurso.Mercado]: null,
}

export const fichaValidaParaTerritorio = (G:IState, player:PlayerID, ficha:IFicha, terr:ITerritorio):boolean=>{
    //ya tiene ficha
    if (terr.ficha) return false;
    // campamento
    else if (ficha.tipo === TipoItem.Campamento) return terr.dueño === undefined;
    else if (terr.dueño === player) {
        // castillo
        if (ficha.torres !== undefined) return (ficha.torres < 3 || terr.tipo===TipoTerritorio.Montaña);
        // recurso
        else if (ficha.recurso) return (requerimentosDeLujo[ficha.recurso]===null||requerimentosDeLujo[ficha.recurso]===terr.tipo);
        // torre celestial?
        else if (ficha.tipo === TipoItem.TorreCelestial) {
            return G.mapaIndexado.some(({y,x})=>
                G.mapa[y][x].indice!==terr.indice &&
                !(G.mapa[y][x].ficha) &&
                G.mapa[y][x].dueño===player );
        }
    }
    return false;
};

export default (G:IState, player:PlayerID, ficha:IFicha):boolean[] => {
    return G.mapaIndexado.map(({y,x})=>fichaValidaParaTerritorio(G,player,ficha,G.mapa[y][x]));
}