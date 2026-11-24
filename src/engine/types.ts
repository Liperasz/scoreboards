// como o motor conta os pontos (o desenho da tela é o layout)
export type Mode = 'tap' | 'rounds' | 'lives' | 'tennis';

export type Category = 'cartas' | 'mesa' | 'esporte' | 'outros';

// desenho da tela de placar (vários jogos dividem o mesmo)
export type Layout = 'truco' | 'tally' | 'scorepad' | 'court' | 'split' | 'snooker' | 'lives';

// none: só conta | reach: vence quem chega ao alvo | lowest: alguém chegou ao alvo, vence o menor
// lastStanding: quem passa do limite sai, vence o último
export type WinRule = 'none' | 'reach' | 'lowest' | 'lastStanding';

export interface ScoreButton {

    label: string;
    pts: number;
    // cor própria do botão (bolas da sinuca), senão usa a cor do jogador
    color?: string;

}

export interface TennisRules {

    gamesPerSet: number;
    // no-ad: no 40-40 o próximo ponto decide (beach tennis)
    noAd: boolean;
    tiebreakTo: number;

}

export interface GameDef {

    id: string;
    title: string;
    subtitle: string;
    category: Category;
    mode: Mode;
    layout: Layout;
    // true usa "Time 1", "Nós/Eles" nos nomes padrão
    teams: boolean;
    minPlayers: number;
    maxPlayers: number;
    defaultPlayers: number;
    win: WinRule;
    // up soma os pontos, down desconta a partir de startScore
    direction: 'up' | 'down';
    target: number | null;
    startScore: number;
    // vantagem mínima para fechar o set (ping-pong, vôlei)
    winBy: number;
    // pontuação que fecha o set mesmo sem vantagem (badminton 30)
    cap: number | null;
    // partidas em "melhor de N"; null não deixa escolher
    bestOf: number | null;
    // alvo do set decisivo (vôlei vai a 15 no 5º)
    lastSetTarget: number | null;
    // trava o placar no alvo (truco não passa de 12)
    clamp: boolean;
    // dardos: rodada que passaria do zero não conta
    bust: boolean;
    // aceita pontos negativos digitados (buraco)
    negative: boolean;
    // no truco são os valores da mão (normal, truco, seis...), nos outros os botões de ponto
    buttons: ScoreButton[];
    // pontos avulsos fora da mão (envido e flor no truco gaúcho)
    extras: ScoreButton[];
    // bloquinho em versão lousa (dardos)
    chalk: boolean;
    // aviso quando alguém está a N pontos do alvo (mão de onze)
    alert: { below: number; text: string } | null;
    tennis: TennisRules | null;
    hint: string;
    accent: string;

}

export interface Settings {

    target: number | null;
    startScore: number;
    bestOf: number;

}

export interface Player {

    id: string;
    name: string;
    color: string;
    score: number;
    // sets ou partidas vencidas
    sets: number;

}

export interface TennisState {

    points: number[];
    games: number[];
    tiebreak: boolean;

}

export interface Snapshot {

    players: Player[];
    setScores: number[][];
    log: number[][];
    tennis: TennisState | null;

}

export interface Match extends Snapshot {

    gameId: string;
    settings: Settings;
    // estados anteriores, usados para desfazer
    history: Snapshot[];
    updatedAt: number;

}

export interface Entry {

    name: string;
    color: string;

}
