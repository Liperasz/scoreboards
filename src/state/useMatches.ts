import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { Match } from '../engine/types.ts';
import { loadMatches, saveMatches } from './storage.ts';
import type { Matches } from './storage.ts';

// partidas em andamento, salvas no aparelho
export function useMatches() {

    const [matches, setMatches] = useState<Matches | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latest = useRef<Matches | null>(null);

    useEffect(() => {
        loadMatches().then(setMatches);
    }, []);

    // espera os toques pararem um pouco antes de gravar, pra não escrever a cada ponto
    useEffect(() => {

        if (matches === null) {
            return;
        }

        latest.current = matches;

        if (timer.current !== null) {
            clearTimeout(timer.current);
        }

        timer.current = setTimeout(() => saveMatches(matches), 400);

    }, [matches]);

    // indo para segundo plano grava na hora (o sistema pode matar o app)
    useEffect(() => {

        const subscription = AppState.addEventListener('change', state => {

            if (state !== 'active' && latest.current !== null) {
                saveMatches(latest.current);
            }

        });

        return () => subscription.remove();

    }, []);

    const setMatch = useCallback((id: string, match: Match) => {
        setMatches(prev => ({ ...prev, [id]: match }));
    }, []);

    const removeMatch = useCallback((id: string) => {

        setMatches(prev => {

            const next = { ...prev };

            delete next[id];

            return next;

        });

    }, []);

    return { matches, setMatch, removeMatch };

}
