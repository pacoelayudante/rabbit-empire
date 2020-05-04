import { IFicha, ITerritorio, IState, TipoItem, TipoTerritorio, TipoRecurso, IFeudo } from "./tipos";
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
    else if (ficha.tipo === TipoItem.Campamento) {
        if (terr.dueño === undefined) { // chequear si hay otros con mas prioridad
            const estaFicha = ficha.indice;
            if (Object.keys(G.jugadores).some(jugid => !G.jugadores[jugid].terminado &&//jugador  decide pasar
                    G.jugadores[jugid].itemsEnMano.some(item=>item.tipo===TipoItem.Campamento&&item.indice<estaFicha)
                )) return false;//se encontro alguno que cumple
            else return true;//nadie mas cumple esta situacion
        }
        else return false;// <-- territorio con dueño
    }
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

export const recursoMercadoActivo = (recursos:TipoRecurso[])
    :boolean => ![TipoRecurso.Zanahoria,TipoRecurso.Madera,TipoRecurso.Pescado]
        .every(rec=>recursos.includes(rec));

export const puntosPorFeudo = (feudo:IFeudo) => {
    if (feudo.torres === 0) return 0; // ni nos gastamos en filtrar cosas
    const recursosFiltrados = feudo.recursos.filter((rec,i)=>feudo.recursos.indexOf(rec)===i);
    const recursosContados = recursosFiltrados.length + // menos uno si el mercado no funciona
        (recursosFiltrados.includes(TipoRecurso.Mercado)&&!recursoMercadoActivo(recursosFiltrados)? -1 : 0);
                //hay un mercado, y ese mercado no esta activo, le restamos uno
    return recursosContados * feudo.torres;
};

export const territoriosElegibles = (G:IState, player:PlayerID, ficha:IFicha):boolean[] => {
    return G.mapaIndexado.map(({y,x})=>fichaValidaParaTerritorio(G,player,ficha,G.mapa[y][x]));
}