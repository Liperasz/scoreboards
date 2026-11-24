import { applyDeltas } from './score.ts';
import { emptyTennis } from './tennis.ts';
import type { Entry, GameDef, Match, Settings } from './types.ts';

export function newId(): string {

    return Math.random().toString(36).slice(2, 10);

}

export function defaultSettings(def: GameDef): Settings {

    return {
        target: def.target,
        startScore: def.startScore,
        bestOf: def.bestOf ?? 1,
    };

}

export function createMatch(def: GameDef, entries: Entry[], settings: Settings): Match {

    const players = entries.map((entry, i) => {

        const fallback = def.teams ? `Time ${i + 1}` : `Jogador ${i + 1}`;

        return {
            id: newId(),
            name: entry.name.trim() || fallback,
            color: entry.color,
            score: settings.startScore,
            sets: 0,
        };

    });

    return {
        gameId: def.id,
        settings,
        players,
        setScores: [],
        log: [],
        tennis: def.mode === 'tennis' ? emptyTennis() : null,
        history: [],
        updatedAt: Date.now(),
    };

}

// mesmos jogadores e regras, placar zerado
export function rematch(def: GameDef, match: Match): Match {

    return createMatch(def, match.players, match.settings);

}

export function undo(match: Match): Match {

    const last = match.history[match.history.length - 1];

    if (last === undefined) {
        return match;
    }

    return { ...match, ...last, history: match.history.slice(0, -1), updatedAt: Date.now() };

}

// soma os pontos de um botão para um jogador só
export function addPoints(def: GameDef, match: Match, index: number, pts: number): Match {

    const deltas = match.players.map((_, i) => (i === index ? pts : 0));

    return applyDeltas(def, match, deltas);

}

// rodada digitada: nos jogos regressivos o valor é o que o jogador perdeu
export function addRound(def: GameDef, match: Match, values: number[]): Match {

    const deltas = values.map(v => (def.direction === 'down' ? -v : v));

    return applyDeltas(def, match, deltas);

}
