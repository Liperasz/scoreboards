import { pushHistory, setsNeeded, winnerOf } from './score.ts';
import type { GameDef, Match, TennisRules, TennisState } from './types.ts';

const LABELS = ['0', '15', '30', '40'];

export function emptyTennis(): TennisState {

    return { points: [0, 0], games: [0, 0], tiebreak: false };

}

// texto do ponto no game atual (0, 15, 30, 40, AD ou o número no tie-break)
export function pointLabel(state: TennisState, index: number, rules: TennisRules): string {

    const mine = state.points[index];
    const other = state.points[1 - index];

    if (state.tiebreak) {
        return String(mine);
    }

    if (!rules.noAd && mine >= 3 && other >= 3) {
        return mine > other ? 'AD' : '40';
    }

    return LABELS[Math.min(mine, 3)];

}

function isGameWon(state: TennisState, index: number, rules: TennisRules): boolean {

    const mine = state.points[index];
    const lead = mine - state.points[1 - index];

    if (state.tiebreak) {
        return mine >= rules.tiebreakTo && lead >= 2;
    }

    // no-ad: no 40-40 quem fizer o próximo ponto leva
    if (rules.noAd) {
        return mine >= 4;
    }

    return mine >= 4 && lead >= 2;

}

export function pointTo(def: GameDef, match: Match, index: number): Match {

    const rules = def.tennis;

    if (rules === null || match.tennis === null || winnerOf(def, match) !== null) {
        return match;
    }

    const other = 1 - index;
    const tennis: TennisState = {
        points: [...match.tennis.points],
        games: [...match.tennis.games],
        tiebreak: match.tennis.tiebreak,
    };
    let players = match.players;
    let setScores = match.setScores;

    tennis.points[index] += 1;

    if (isGameWon(tennis, index, rules)) {

        const wasTiebreak = tennis.tiebreak;

        tennis.games[index] += 1;
        tennis.points = [0, 0];

        const games = tennis.games[index];
        const setWon = wasTiebreak || (games >= rules.gamesPerSet && games - tennis.games[other] >= 2);

        if (setWon) {

            setScores = [...setScores, [...tennis.games]];
            players = players.map((p, i) => (i === index ? { ...p, sets: p.sets + 1 } : p));

            // a partida acabou, mantém os games do último set na tela
            if (players[index].sets < setsNeeded(match)) {
                tennis.games = [0, 0];
                tennis.tiebreak = false;
            }

        } else if (tennis.games[0] === rules.gamesPerSet && tennis.games[1] === rules.gamesPerSet) {
            tennis.tiebreak = true;
        }

    }

    return {
        ...match,
        players,
        setScores,
        tennis,
        history: pushHistory(match),
        updatedAt: Date.now(),
    };

}
