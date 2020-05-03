import { Ctx, PlayerID } from 'boardgame.io';
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
    Perla = 'perla',
    Hongo = 'hongo',
    Especia = 'especia',
    Diamante = 'diamante',
    Cobre = 'cobre',
    Oro = 'oro',
    Metal = 'metal',
    Mercado = 'mercado',//comodin
}

export enum TipoCarta {
    Territorio = 'territorio',
    Tesoro = 'tesoro',
    Pergamino = 'pergamino',
    Item = 'item',
}

export enum TipoItem {
    Castillo = 'castillo',
    Recurso = 'recurso',
    TorreCelestial = 'torre-celestial',
    Campamento = 'campamento',
    Provisiones = 'provisiones'
}

export interface IJugador {
    id:PlayerID,
    nombre:string,
    mano:number[],
    cartasApropiadas:number[],
    cartasElegidas:number[],
    itemsEnMano:IFicha[],
    ptsPorTurno:number[],
    ptsPorPegaminos:number,
    ptsPorTesoros:number,
    terminado:boolean,
}

export interface ICarta {
    indice:number,
    tipo:TipoCarta,
    nombre:string,
    territorio?:number,
    pergamino?:string,
    item?:IFicha,
    dueño?:IJugador,
}

export interface IFicha {
    indice:number,
    tipo:TipoItem,
    prioridad?:number,
    color?:number,
    torres?:number,
    recurso?:TipoRecurso,
    dueño?:IJugador,
}

export interface ITerritorio {
    indice:number,
    x:number,
    y:number,
    vecindad:number[],
    tipo:TipoTerritorio,
    ficha?:IFicha,
    dueño?:PlayerID,
    recurso?:TipoRecurso,
    indiceFeudo?:number,
}

export interface IFeudo {
    territorios:number[],
    dueño:PlayerID,
    torres:number,
    recursos:TipoRecurso[],
}

export interface IReglas {
    cartasPorRonda:number,
    cartasElegidasPorTurno : number,
}

export interface IState {
    mapa:ITerritorio[][],
    mapaIndexado:{y:number,x:number}[],
    feudos:IFeudo[],
    mazo:number[],
    cartas:ICarta[],
    jugadores:Record<string,IJugador>,
    extra?:any,
    reglas:IReglas,
}

export interface ICtx extends Ctx{
    playerID?: PlayerID,
    events:EventsAPI,
    random:RandomAPI,
    player:PlayerAPI<IJugador>,
}