import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Match } from '../engine/types.ts';

export type Matches = Record<string, Match>;

const KEY = 'placar.matches.v3';
const OLD_KEY = 'placar.games.v2';

// nomes dos jogos na versão anterior do app
const OLD_IDS: Record<string, string> = {
    truco: 'truco-paulista',
    cacheta: 'cacheta',
    pife: 'pife',
    livre: 'livre',
};

interface OldGame {

    kind: string;
    players: { id: string; name: string; color: string; score: number }[];
    limit: number | null;
    startScore: number;

}

// converte as partidas salvas na v2 (o histórico de desfazer não é aproveitado)
function migrate(raw: string): Matches {

    const old = JSON.parse(raw) as Record<string, OldGame>;
    const matches: Matches = {};

    for (const [kind, game] of Object.entries(old)) {

        const id = OLD_IDS[kind];

        if (id === undefined || game === undefined) {
            continue;
        }

        matches[id] = {
            gameId: id,
            settings: { target: game.limit, startScore: game.startScore, bestOf: 1 },
            players: game.players.map(p => ({ ...p, sets: 0 })),
            setScores: [],
            log: [],
            tennis: null,
            history: [],
            updatedAt: Date.now(),
        };

    }

    return matches;

}

export async function loadMatches(): Promise<Matches> {

    try {

        const raw = await AsyncStorage.getItem(KEY);

        if (raw !== null) {
            return JSON.parse(raw) as Matches;
        }

        const old = await AsyncStorage.getItem(OLD_KEY);

        if (old !== null) {

            const matches = migrate(old);

            await AsyncStorage.setItem(KEY, JSON.stringify(matches));
            await AsyncStorage.removeItem(OLD_KEY);

            return matches;

        }

        return {};

    } catch {
        return {};
    }

}

export async function saveMatches(matches: Matches): Promise<void> {

    try {
        await AsyncStorage.setItem(KEY, JSON.stringify(matches));
    } catch {
        // falhar ao salvar não pode travar o app
    }

}
