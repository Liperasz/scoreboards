import type { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Mode } from './src/engine/types';
import { getGame } from './src/games/catalog';
import HomeScreen from './src/screens/HomeScreen';
import LivesScreen from './src/screens/LivesScreen';
import RoundsScreen from './src/screens/RoundsScreen';
import SetupScreen from './src/screens/SetupScreen';
import TapScreen from './src/screens/TapScreen';
import TennisScreen from './src/screens/TennisScreen';
import { useMatches } from './src/state/useMatches';
import { useRouter } from './src/state/useRouter';
import type { PlayProps } from './src/ui/PlayShell';
import { colors } from './src/ui/theme';

const PLAY_SCREENS: Record<Mode, (props: PlayProps) => ReactNode> = {
    tap: TapScreen,
    rounds: RoundsScreen,
    lives: LivesScreen,
    tennis: TennisScreen,
};

function Main() {

    const { matches, setMatch, removeMatch } = useMatches();
    const { route, setRoute } = useRouter();

    if (matches === null) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fff" />
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

        const Play = PLAY_SCREENS[def.mode];

        return (
            <Play
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
    root: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
