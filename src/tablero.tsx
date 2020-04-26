import React from 'react';
import { Territorio, TipoTerritorio, Ficha, TipoFicha } from './tipos';

const imgCasilleros = {
    [TipoTerritorio.Bosque]: require('./imagenes/terrenos/bosque.png'),
    [TipoTerritorio.Granja]: require('./imagenes/terrenos/granja.png'),
    [TipoTerritorio.Lago]: require('./imagenes/terrenos/lago.png'),
    [TipoTerritorio.Montaña]: require('./imagenes/terrenos/montania.png'),
    [TipoTerritorio.Pradera]: require('./imagenes/terrenos/pradera.png'),
    [TipoTerritorio.PuebloInicial]: require('./imagenes/terrenos/pueblo.png'),
};
const imgCastillos = [null,require('./imagenes/terrenos/castillo1.png')
    ,require('./imagenes/terrenos/castillo2.png'),require('./imagenes/terrenos/castillo3.png')];

const FichaEnTablero = ({territorio}) => {
    let ficha : Ficha = territorio.ficha;
    let imagen = null;
    if (ficha.tipo === TipoFicha.Ciudad && ficha.torres) {
        imagen = imgCastillos[ficha.torres];
    }
    return (<img src={imagen} alt={ficha.tipo}/>);
}

const Tablero = ({G,moves}) =>{
    let mapa : Territorio[][] = G.mapa;
    // console.log(moves);

    let grillaMapa = mapa.map(
        (fila,y) => {
            let filaCasilleros = fila.map(
                casillero => {
                    return (<div key={casillero.x} className='casillero'>
                            <img alt={casillero.tipo} src={imgCasilleros[casillero.tipo]} />
                            {casillero.ficha && <FichaEnTablero territorio={casillero} />}
                        </div>);
                }
            )
            return (<div className='fila-casilleros' key={y}>{filaCasilleros}</div>);
        }
    );

    return (
        <div className='mapa' onClick={moves.accionSignal}>
            {grillaMapa}
        </div>
    );
};

export default Tablero;