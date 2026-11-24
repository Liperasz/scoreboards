import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { rematch, undo } from '../engine/match';
import { alertOf, winnerOf } from '../engine/score';
import type { GameDef, Match } from '../engine/types';
import { describeRules, setNote } from '../games/describe';
import Header from './Header';
import { colors } from './theme';
import WinnerBanner from './WinnerBanner';

export interface PlayProps {

    def: GameDef;
    match: Match;
    onChange: (match: Match) => void;
    onBack: () => void;
    onNewGame: () => void;

}

interface ShellProps extends PlayProps {

    children: ReactNode;
    // cor de fundo da tela (feltro, madeira, papel, quadra)
    surface?: string;
    tone?: 'light' | 'dark';
    // esconde a linha com a regra quando o próprio layout já mostra o alvo
    hideRules?: boolean;

}

// moldura comum das telas de placar: cabeçalho, regra, aviso e vencedor
export default function PlayShell(props: ShellProps) {

    const { def, match, onChange, onBack, onNewGame, children, surface = colors.felt, tone = 'dark', hideRules = false } = props;

    // a tela não apaga durante a partida
    useKeepAwake();

    const insets = useSafeAreaInsets();
    const winner = winnerOf(def, match);
    const alert = alertOf(def, match);
    const note = setNote(def, match);
    const fg = tone === 'light' ? colors.inkSoft : colors.chalkSoft;

    useEffect(() => {

        if (winner !== null) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

    }, [winner?.id]);

    return (
        <View style={[styles.flex, { backgroundColor: surface, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar style={tone === 'light' ? 'dark' : 'light'} />
            <Header
                title={def.title}
                onBack={onBack}
                onUndo={() => onChange(undo(match))}
                canUndo={match.history.length > 0}
                tone={tone}
            />

            {!hideRules && winner === null && (
                <Text style={[styles.rules, { color: fg }]}>{note ?? describeRules(def, match.settings)}</Text>
            )}

            {alert !== null && (
                <View style={styles.alert}>
                    <Text style={styles.alertText}>{alert}</Text>
                </View>
            )}

            {winner !== null && (
                <WinnerBanner winner={winner} onRematch={() => onChange(rematch(def, match))} onNewGame={onNewGame} />
            )}

            {children}
        </View>
    );

}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    rules: { fontSize: 14, paddingHorizontal: 18, marginBottom: 10 },
    alert: {
        alignSelf: 'flex-start',
        marginLeft: 16,
        marginBottom: 10,
        backgroundColor: colors.gold,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    alertText: { color: '#3a2a00', fontWeight: '800', fontSize: 14 },
});
