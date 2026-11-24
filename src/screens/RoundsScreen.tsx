import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { addRound } from '../engine/match';
import { isOut, winnerOf } from '../engine/score';
import PlayShell from '../ui/PlayShell';
import type { PlayProps } from '../ui/PlayShell';
import { colors, common, radius } from '../ui/theme';

function parse(text: string): number | null {

    const value = parseInt(text, 10);

    return Number.isFinite(value) ? value : null;

}

// tabela com as rodadas já lançadas, a mais recente em cima
function RoundHistory({ props }: { props: PlayProps }) {

    const { match } = props;
    const rounds = match.log.map((values, i) => ({ values, n: i + 1 })).reverse();

    return (
        <View style={[common.glassCard, styles.history]}>
            <View style={styles.histRow}>
                <Text style={[styles.histCell, styles.histRound]}>#</Text>
                {match.players.map(p => (
                    <Text key={p.id} style={[styles.histCell, styles.histHead, { color: p.color }]} numberOfLines={1}>
                        {p.name}
                    </Text>
                ))}
            </View>
            {rounds.map(({ values, n }) => (
                <View key={n} style={styles.histRow}>
                    <Text style={[styles.histCell, styles.histRound]}>{n}</Text>
                    {values.map((v, i) => (
                        <Text key={i} style={styles.histCell}>
                            {v > 0 ? `+${v}` : v}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );

}

// pontos digitados a cada rodada (cacheta, buraco, uno, copas, dardos...)
export default function RoundsScreen(props: PlayProps) {

    const { def, match, onChange } = props;
    const finished = winnerOf(def, match) !== null;
    const losing = def.direction === 'down';

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [showHistory, setShowHistory] = useState(false);

    const hasValues = match.players.some(p => parse(inputs[p.id] ?? '') !== null);

    const setInput = (id: string, text: string) => {

        // aceita só números e um sinal de menos no começo quando o jogo permite negativo
        const clean = def.negative ? text.replace(/(?!^-)[^0-9]/g, '') : text.replace(/[^0-9]/g, '');

        setInputs(prev => ({ ...prev, [id]: clean }));

    };

    const toggleSign = (id: string) => {

        const text = inputs[id] ?? '';

        setInput(id, text.startsWith('-') ? text.slice(1) : `-${text}`);

    };

    const submit = () => {

        const values = match.players.map(p => parse(inputs[p.id] ?? '') ?? 0);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onChange(addRound(def, match, values));
        setInputs({});

    };

    return (
        <PlayShell {...props}>
            <KeyboardAvoidingView behavior="padding" style={common.flex}>
                <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                    <View style={common.glassCard}>
                        <View style={styles.headRow}>
                            <Text style={[common.label, styles.nameCol]}>{def.teams ? 'Time' : 'Jogador'}</Text>
                            <Text style={[common.label, styles.totalCol]}>Total</Text>
                            <Text style={[common.label, styles.inputCol]}>{losing ? 'Perdeu' : 'Rodada'}</Text>
                        </View>

                        {match.players.map(p => {

                            const out = isOut(def, match, p);
                            const locked = out || finished;

                            return (
                                <View key={p.id} style={[styles.row, out && styles.rowOut]}>
                                    <View style={[styles.nameCol, styles.nameWrap]}>
                                        <View style={[styles.colorBar, { backgroundColor: p.color }]} />
                                        <View style={common.flex}>
                                            <Text style={[styles.name, out && styles.strike]} numberOfLines={1}>
                                                {p.name}
                                            </Text>
                                            {out && <Text style={styles.outTag}>FORA</Text>}
                                        </View>
                                    </View>

                                    <Text style={[styles.total, styles.totalCol]}>{p.score}</Text>

                                    <View style={[styles.inputCol, styles.inputWrap]}>
                                        {def.negative && (
                                            <TouchableOpacity
                                                style={styles.sign}
                                                disabled={locked}
                                                onPress={() => toggleSign(p.id)}
                                            >
                                                <Text style={styles.signText}>±</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TextInput
                                            style={[styles.input, locked && styles.inputOff]}
                                            editable={!locked}
                                            value={inputs[p.id] ?? ''}
                                            onChangeText={text => setInput(p.id, text)}
                                            keyboardType="number-pad"
                                            placeholder="0"
                                            placeholderTextColor={colors.textFaint}
                                            maxLength={6}
                                            selectTextOnFocus
                                        />
                                    </View>
                                </View>
                            );

                        })}
                    </View>

                    <TouchableOpacity
                        style={[common.primaryBtn, styles.submit, { backgroundColor: def.accent }, !hasValues && styles.off]}
                        onPress={submit}
                        disabled={!hasValues || finished}
                    >
                        <Text style={common.primaryText}>{losing ? 'Descontar rodada' : 'Somar rodada'}</Text>
                    </TouchableOpacity>

                    <Text style={[common.hint, styles.hint]}>{def.hint}</Text>

                    {match.log.length > 0 && (
                        <>
                            <TouchableOpacity style={common.ghostBtn} onPress={() => setShowHistory(v => !v)}>
                                <Text style={common.ghostText}>
                                    {showHistory ? 'Esconder rodadas' : `Ver rodadas (${match.log.length})`}
                                </Text>
                            </TouchableOpacity>
                            {showHistory && <RoundHistory props={props} />}
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </PlayShell>
    );

}

const styles = StyleSheet.create({
    body: { paddingHorizontal: 16, paddingBottom: 32 },
    headRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    rowOut: { opacity: 0.45 },
    nameCol: { flex: 1.6 },
    totalCol: { flex: 1, textAlign: 'center' },
    inputCol: { flex: 1.3 },
    nameWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    colorBar: { width: 6, height: 34, borderRadius: 3 },
    name: { fontSize: 17, fontWeight: '700', color: colors.text },
    strike: { textDecorationLine: 'line-through' },
    outTag: { fontSize: 11, color: colors.danger, fontWeight: '800', marginTop: 2 },
    total: { fontSize: 26, fontWeight: '900', color: colors.text, fontVariant: ['tabular-nums'] },
    inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
    sign: {
        width: 30,
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.glassLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signText: { color: colors.text, fontSize: 18, fontWeight: '800' },
    input: {
        flex: 1,
        minWidth: 0,
        width: '100%',
        height: 42,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    inputOff: { opacity: 0.4 },
    submit: { marginTop: 14 },
    off: { opacity: 0.45 },
    hint: { textAlign: 'center', marginVertical: 14 },
    history: { marginTop: 12, paddingVertical: 8, borderRadius: radius.md },
    histRow: { flexDirection: 'row', paddingVertical: 5 },
    histCell: { flex: 1, textAlign: 'center', color: colors.text, fontVariant: ['tabular-nums'] },
    histRound: { flex: 0.5, color: colors.textFaint },
    histHead: { fontWeight: '800' },
});
