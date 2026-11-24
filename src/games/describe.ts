import { currentTarget } from '../engine/score.ts';
import type { GameDef, Match, Settings } from '../engine/types.ts';

// frase curta com a regra da partida, mostrada embaixo do título
export function describeRules(def: GameDef, settings: Settings): string {

    const { target, startScore, bestOf } = settings;
    const series = bestOf > 1 ? ` · melhor de ${bestOf}` : '';

    if (def.mode === 'tennis') {
        return bestOf > 1 ? `Melhor de ${bestOf} sets` : 'Set único';
    }

    if (def.win === 'reach' && def.direction === 'down') {
        return `Começa em ${startScore} · zere para vencer`;
    }

    if (def.win === 'reach' && target !== null) {

        const lead = def.winBy > 1 ? ' · 2 de vantagem' : '';

        return `Vai até ${target}${lead}${series}`;

    }

    if (def.win === 'lowest') {
        return `Chegou a ${target}, vence quem tiver menos`;
    }

    if (def.win === 'lastStanding' && def.direction === 'down') {
        return def.mode === 'lives' ? `${startScore} vidas · zerou, saiu` : `Começa com ${startScore} · zerou, saiu`;
    }

    if (def.win === 'lastStanding') {
        return `Chegou a ${target}, saiu`;
    }

    return def.subtitle;

}

// alvo do set atual quando muda no decisivo (vôlei)
export function setNote(def: GameDef, match: Match): string | null {

    const target = currentTarget(def, match);

    if (def.lastSetTarget === null || target !== def.lastSetTarget) {
        return null;
    }

    return `Set decisivo até ${target}`;

}

export function bestOfLabel(n: number): string {

    return n === 1 ? 'Jogo único' : `Melhor de ${n}`;

}
