import { Ctx, PlayerID } from 'boardgame.io/src/types';
import { RandomAPI } from 'boardgame.io/dist/types/src/plugins/plugin-random';
import { PlayerAPI } from 'boardgame.io/dist/types/src/plugins/plugin-player';
import { EventsAPI } from 'boardgame.io/dist/types/src/plugins/events/events';

export enum TipoTerritorio {
    PuebloInicial = 'ciudad',
    Pradera = 'pradera',
    Granja = 'granja',
    Bosque = 'bosque',
    Montaña = 'montaña',
    Lago = 'lago',
}

export enum TipoRecurso {
    Vacio = 'vacio',
    Zanahoria = 'zanahoria',
    Madera = 'madera',
    Pescado = 'pescado',
    Comodin = 'comodin',
}

export enum TipoCarta {
    Territorio = 'territorio',
    Tesoro = 'tesoro',
    Pergamino = 'pergamino',
    Item = 'item',
}

export enum TipoFicha {
    Ciudad = 'ciudad',
    Recurso = 'recurso',
    TorreCelestial = 'torre-celestial',
    Campamento = 'campamento',
}

export interface IJugador {
    id:PlayerID;
    nombre:string;
    mano:number[],
    cartasApropiadas:number[],
    cartasElegidas:number[],
    items:IFicha[],
    ptsPorTurno:number[];
    ptsPorPegaminos:number;
}

export interface ICarta {
    indice:number;
    tipo:TipoCarta;
    nombre:string;
    territorio?:ITerritorio;
    pergamino?:string;
    item?:IFicha;
    dueño?:IJugador;
}

export interface IFicha {
    tipo:TipoFicha;
    prioridad?:number;
    color?:number;
    torres?:number;
    recurso?:TipoRecurso;
    dueño?:IJugador;
}

export interface ITerritorio {
    indice:number;
    x:number;
    y:number;
    tipo:TipoTerritorio;
    ficha?:IFicha;
    dueño?:PlayerID;
    recurso?:TipoRecurso;
}

export interface IReglas {
    cartasPorRonda:number,
    cartasElegidasPorTurno : number,
}

export interface IState {
    mapa:ITerritorio[][],
    mazo:number[],
    cartas:ICarta[],
    players:Record<string,IJugador>,
    extra?:any,
    reglas:IReglas,
}

export interface ICtx extends Ctx{
    playerID?: PlayerID,
    events:EventsAPI,
    random:RandomAPI,
    player:PlayerAPI<IJugador>,
}