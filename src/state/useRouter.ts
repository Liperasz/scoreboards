import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

export type Route =
    | { name: 'home' }
    | { name: 'setup' | 'play'; gameId: string };

// navegação mínima sem biblioteca: só três telas e o voltar sempre leva para o início
export function useRouter() {

    const [route, setRoute] = useState<Route>({ name: 'home' });

    // botão voltar do android volta para o início em vez de fechar o app
    useEffect(() => {

        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {

            if (route.name === 'home') {
                return false;
            }

            setRoute({ name: 'home' });

            return true;

        });

        return () => subscription.remove();

    }, [route.name]);

    return { route, setRoute };

}
