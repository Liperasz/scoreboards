import type { ImageSourcePropType } from 'react-native';

// require precisa de caminho fixo, por isso o mapa é escrito à mão (um por jogo)
const BACKGROUNDS: Record<string, ImageSourcePropType> = {
    'badminton': require('../../assets/bg/badminton.webp'),
    'basquete': require('../../assets/bg/basquete.webp'),
    'beach-tennis': require('../../assets/bg/beach-tennis.webp'),
    'bilhar': require('../../assets/bg/bilhar.webp'),
    'bisca': require('../../assets/bg/bisca.webp'),
    'bocha': require('../../assets/bg/bocha.webp'),
    'buraco': require('../../assets/bg/buraco.webp'),
    'cacheta': require('../../assets/bg/cacheta.webp'),
    'canastra': require('../../assets/bg/canastra.webp'),
    'contador': require('../../assets/bg/contador.webp'),
    'copas': require('../../assets/bg/copas.webp'),
    'dados': require('../../assets/bg/dados.webp'),
    'dardos': require('../../assets/bg/dardos.webp'),
    'domino': require('../../assets/bg/domino.webp'),
    'escopa': require('../../assets/bg/escopa.webp'),
    'fodinha': require('../../assets/bg/fodinha.webp'),
    'futebol': require('../../assets/bg/futebol.webp'),
    'futevolei': require('../../assets/bg/futevolei.webp'),
    'livre': require('../../assets/bg/livre.webp'),
    'padel': require('../../assets/bg/padel.webp'),
    'pebolim': require('../../assets/bg/pebolim.webp'),
    'peteca': require('../../assets/bg/peteca.webp'),
    'pife': require('../../assets/bg/pife.webp'),
    'ping-pong': require('../../assets/bg/ping-pong.webp'),
    'pontinho': require('../../assets/bg/pontinho.webp'),
    'porrinha': require('../../assets/bg/porrinha.webp'),
    'rouba-monte': require('../../assets/bg/rouba-monte.webp'),
    'sinuca': require('../../assets/bg/sinuca.webp'),
    'stop': require('../../assets/bg/stop.webp'),
    'sueca': require('../../assets/bg/sueca.webp'),
    'tenis': require('../../assets/bg/tenis.webp'),
    'tranca': require('../../assets/bg/tranca.webp'),
    'truco-gaucho': require('../../assets/bg/truco-gaucho.webp'),
    'truco-mineiro': require('../../assets/bg/truco-mineiro.webp'),
    'truco-paulista': require('../../assets/bg/truco-paulista.webp'),
    'uno': require('../../assets/bg/uno.webp'),
    'vitorias': require('../../assets/bg/vitorias.webp'),
    'volei': require('../../assets/bg/volei.webp'),
};

const FALLBACK = BACKGROUNDS.livre;

export function backgroundOf(gameId: string): ImageSourcePropType {

    return BACKGROUNDS[gameId] ?? FALLBACK;

}
