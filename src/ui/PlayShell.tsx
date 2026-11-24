import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { rematch, undo } from '../engine/match';
import { alertOf, winnerOf } from '../engine/score';
import type { GameDef, Match } from '../engine/types';
import { describeRules, setNote } from '../games/describe';
import GameBackground from './GameBackground';
import Header from './Header';
import { colors, radius } from './theme';
import WinnerBanner from './WinnerBanner';

export interface PlayProps {

    def: GameDef;
    match: Match;
    onChange: (match: Match) => void;
    onBack: () => void;
    onNewGame: () => void;

}

// moldura comum das telas de placar: fundo, cabeçalho, regra, avisos e vencedor
export default function PlayShell({ def, match, onChange, onBack, onNewGame, children }: PlayProps & {
    children: ReactNode;
}) {

    // a tela não apaga durante a partida
    useKeepAwake();

    const insets = useSafeAreaInsets();
    const winner = winnerOf(def, match);
    const alert = alertOf(def, match);
    const note = setNote(def, match);
    const showSets = match.settings.bestOf > 1 && match.setScores.length > 0;

    useEffect(() => {

        if (winner !== null) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

    }, [winner?.id]);

    return (
        <GameBackground gameId={def.id}>
            <View style={[styles.flex, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <Header
                    title={def.title}
                    onBack={onBack}
                    onUndo={() => onChange(undo(match))}
                    canUndo={match.history.length > 0}
                />

                <View style={styles.top}>
                    <Text style={styles.meta}>{describeRules(def, match.settings)}</Text>

                    {showSets && (
                        <Text style={styles.sets}>
                            Sets: {match.setScores.map(set => set.join('–')).join('   ')}
                        </Text>
                    )}

                    {note !== null && winner === null && <Text style={styles.sets}>{note}</Text>}

                    {alert !== null && (
                        <View style={styles.alert}>
                            <Text style={styles.alertText}>{alert}</Text>
                        </View>
                    )}

                    {winner !== null && (
                        <WinnerBanner
                            winner={winner}
                            onRematch={() => onChange(rematch(def, match))}
                            onNewGame={onNewGame}
                        />
                    )}
                </View>

                {children}
            </View>
        </GameBackground>
    );

}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    top: { paddingHorizontal: 16 },
    meta: { textAlign: 'center', color: colors.textSoft, fontSize: 14, marginBottom: 8 },
    sets: { textAlign: 'center', color: colors.text, fontWeight: '700', fontSize: 14, marginBottom: 8 },
    alert: {
        alignSelf: 'center',
        backgroundColor: colors.gold,
        borderRadius: radius.sm,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 10,
    },
    alertText: { color: '#3a2a00', fontWeight: '900', fontSize: 15 },
});
