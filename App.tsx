import type { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Layout } from './src/engine/types';
import { getGame } from './src/games/catalog';
import CourtScreen from './src/screens/CourtScreen';
import HomeScreen from './src/screens/HomeScreen';
import LivesScreen from './src/screens/LivesScreen';
import ScorepadScreen from './src/screens/ScorepadScreen';
import SetupScreen from './src/screens/SetupScreen';
import SnookerScreen from './src/screens/SnookerScreen';
import SplitScreen from './src/screens/SplitScreen';
import TallyScreen from './src/screens/TallyScreen';
import TrucoScreen from './src/screens/TrucoScreen';
import { useMatches } from './src/state/useMatches';
import { useRouter } from './src/state/useRouter';
import Logo from './src/ui/Logo';
import type { PlayProps } from './src/ui/PlayShell';
import { colors } from './src/ui/theme';

const PLAY_SCREENS: Record<Layout, (props: PlayProps) => ReactNode> = {
    truco: TrucoScreen,
    tally: TallyScreen,
    scorepad: ScorepadScreen,
    court: CourtScreen,
    split: SplitScreen,
    snooker: SnookerScreen,
    lives: LivesScreen,
};

function Main() {

    const { matches, setMatch, removeMatch } = useMatches();
    const { route, setRoute } = useRouter();

    // mesma cara da splash enquanto lê as partidas salvas
    if (matches === null) {
        return (
            <View style={styles.center}>
                <Logo size={120} framed={false} />
            </View>
        );
    }

    const goHome = () => setRoute({ name: 'home' });

    // sem partida salva vai para a configuração, com partida salva retoma de onde parou
    const open = (gameId: string) => {
        setRoute({ name: matches[gameId] !== undefined ? 'play' : 'setup', gameId });
    };

    const def = route.name === 'home' ? undefined : getGame(route.gameId);

    if (def === undefined) {
        return <HomeScreen matches={matches} onOpen={open} onDiscard={removeMatch} />;
    }

    const match = matches[def.id];

    if (route.name === 'play' && match !== undefined) {

        const Play = PLAY_SCREENS[def.layout];

        return (
            <Play
                key={def.id}
                def={def}
                match={match}
                onChange={next => setMatch(def.id, next)}
                onBack={goHome}
                onNewGame={() => setRoute({ name: 'setup', gameId: def.id })}
            />
        );

    }

    return (
        <SetupScreen
            def={def}
            previous={match}
            onBack={goHome}
            onStart={next => {

                setMatch(def.id, next);
                setRoute({ name: 'play', gameId: def.id });

            }}
        />
    );

}

export default function App() {

    return (
        <SafeAreaProvider style={styles.root}>
            <StatusBar style="light" />
            <Main />
        </SafeAreaProvider>
    );

}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.felt },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.felt },
});
