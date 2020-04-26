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

export interface Jugador {
    id:string;
    nombre:string;
    mano:number[],
    cartasApropiadas:number[],
    cartasElegidas:number[],
    items:Ficha[],
    ptsPorTurno:number[];
    ptsPorPegaminos:number;
}

export interface Carta {
    indice:number;
    tipo:TipoCarta;
    nombre:string;
    territorio?:Territorio;
    pergamino?:string;
    item?:Ficha;
    dueño?:Jugador;
}

export interface Ficha {
    tipo:TipoFicha;
    prioridad?:number;
    color?:number;
    torres?:number;
    recurso?:TipoRecurso;
    dueño?:Jugador;
}

export interface Territorio {
    indice:number;
    x:number;
    y:number;
    tipo:TipoTerritorio;
    ficha?:Ficha;
    dueño?:Jugador;
}