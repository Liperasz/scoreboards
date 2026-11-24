import type { GameDef, Match, Player } from './types.ts';

export function setsNeeded(match: Match): number {

    return Math.floor(match.settings.bestOf / 2) + 1;

}

// lastStanding: na contagem regressiva sai quem zera, na crescente sai quem estoura o alvo
export function isOut(def: GameDef, match: Match, player: Player): boolean {

    if (def.win !== 'lastStanding') {
        return false;
    }

    if (def.direction === 'down') {
        return player.score <= 0;
    }

    return match.settings.target !== null && player.score >= match.settings.target;

}

// alvo do set atual (o set decisivo pode ter alvo menor, como o 5º set do vôlei)
export function currentTarget(def: GameDef, match: Match): number | null {

    const target = match.settings.target;

    if (target === null) {
        return null;
    }

    const played = match.players.reduce((sum, p) => sum + p.sets, 0);
    const decisive = match.settings.bestOf > 1 && played === match.settings.bestOf - 1;

    if (decisive && def.lastSetTarget !== null) {
        return def.lastSetTarget;
    }

    return target;

}

// índice de quem fechou o set, ou -1 se ninguém fechou ainda
function setWinnerIndex(def: GameDef, match: Match): number {

    const target = currentTarget(def, match);

    if (target === null || def.win !== 'reach') {
        return -1;
    }

    for (let i = 0; i < match.players.length; i++) {

        const score = match.players[i].score;

        if (def.direction === 'down') {

            if (score <= target) {
                return i;
            }

            continue;
        }

        if (score < target) {
            continue;
        }

        if (def.cap !== null && score >= def.cap) {
            return i;
        }

        const best = Math.max(...match.players.filter((_, j) => j !== i).map(p => p.score));

        if (score - best >= def.winBy) {
            return i;
        }

    }

    return -1;

}

export function winnerOf(def: GameDef, match: Match): Player | null {

    const { players } = match;

    if (def.win === 'reach' || def.mode === 'tennis') {
        return players.find(p => p.sets >= setsNeeded(match)) ?? null;
    }

    if (def.win === 'lowest') {

        const target = match.settings.target;

        if (target === null || !players.some(p => p.score >= target)) {
            return null;
        }

        return players.reduce((best, p) => (p.score < best.score ? p : best));

    }

    if (def.win === 'lastStanding' && players.length > 1) {

        const active = players.filter(p => !isOut(def, match, p));

        if (active.length === 1) {
            return active[0];
        }

        // todos saíram na mesma rodada, vence quem ficou mais longe do limite
        if (active.length === 0) {

            if (def.direction === 'down') {
                return players.reduce((best, p) => (p.score > best.score ? p : best));
            }

            return players.reduce((best, p) => (p.score < best.score ? p : best));

        }

    }

    return null;

}

// aplica os pontos de cada jogador (já com sinal) e fecha o set se for o caso
export function applyDeltas(def: GameDef, match: Match, deltas: number[]): Match {

    if (winnerOf(def, match) !== null) {
        return match;
    }

    const target = match.settings.target;

    const players = match.players.map((p, i) => {

        const delta = deltas[i] ?? 0;

        if (delta === 0 || isOut(def, match, p)) {
            return p;
        }

        let score = p.score + delta;

        // estourou o zero no dardo, a rodada não vale
        if (def.bust && score < 0) {
            return p;
        }

        if (def.clamp && target !== null) {
            score = Math.min(score, target);
        }

        if (!def.negative) {
            score = Math.max(score, 0);
        }

        return { ...p, score };

    });

    const next: Match = {
        ...match,
        players,
        log: def.mode === 'rounds' ? [...match.log, deltas] : match.log,
        history: pushHistory(match),
        updatedAt: Date.now(),
    };

    return closeSet(def, next);

}

function closeSet(def: GameDef, match: Match): Match {

    const index = setWinnerIndex(def, match);

    if (index < 0) {
        return match;
    }

    const players = match.players.map((p, i) => (i === index ? { ...p, sets: p.sets + 1 } : p));
    const setScores = [...match.setScores, match.players.map(p => p.score)];

    // acabou a partida, o placar final fica na tela
    if (players[index].sets >= setsNeeded(match)) {
        return { ...match, players, setScores };
    }

    return {
        ...match,
        setScores,
        players: players.map(p => ({ ...p, score: match.settings.startScore })),
    };

}

// guarda só os 50 últimos estados para o salvamento não crescer sem limite
export function pushHistory(match: Match) {

    const snapshot = {
        players: match.players,
        setScores: match.setScores,
        log: match.log,
        tennis: match.tennis,
    };

    return [...match.history, snapshot].slice(-50);

}

// jogadores que estão a N pontos do alvo (mão de onze, mão de dez)
export function alertOf(def: GameDef, match: Match): string | null {

    const target = currentTarget(def, match);

    if (def.alert === null || target === null || winnerOf(def, match) !== null) {
        return null;
    }

    const names = match.players.filter(p => p.score === target - def.alert!.below).map(p => p.name);

    if (names.length === 0) {
        return null;
    }

    return `${def.alert.text}: ${names.join(' e ')}`;

}
