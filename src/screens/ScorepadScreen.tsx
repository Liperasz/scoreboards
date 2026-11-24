import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { addRound } from '../engine/match';
import { isOut, winnerOf } from '../engine/score';
import PlayShell from '../ui/PlayShell';
import type { PlayProps } from '../ui/PlayShell';
import { colors, radius } from '../ui/theme';

// acima disso as colunas ficam com largura fixa e a folha rola de lado
const FIT_PLAYERS = 4;
const COLUMN = 80;
const MARGIN = 34;

// papel do bloquinho e a versão lousa dos dardos
const SHEETS = {
    paper: {
        surface: colors.paper,
        ink: colors.ink,
        soft: colors.inkSoft,
        rule: colors.rule,
        margin: colors.margin,
        field: '#ffffff',
        tone: 'light' as const,
    },
    chalk: {
        surface: '#25352e',
        ink: colors.chalk,
        soft: colors.chalkSoft,
        rule: 'rgba(244,239,228,0.14)',
        margin: 'rgba(242,182,50,0.5)',
        field: 'rgba(244,239,228,0.08)',
        tone: 'dark' as const,
    },
};

function parse(text: string): number | null {

    const value = parseInt(text, 10);

    return Number.isFinite(value) ? value : null;

}

// folha de anotação: uma coluna por jogador, uma linha por rodada e o total embaixo
export default function ScorepadScreen(props: PlayProps) {

    const { def, match, onChange } = props;
    const sheet = def.chalk ? SHEETS.chalk : SHEETS.paper;
    const finished = winnerOf(def, match) !== null;
    const losing = def.direction === 'down';
    const fits = match.players.length <= FIT_PLAYERS;
    const cell = fits ? styles.flexCell : { width: COLUMN };

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const rows = useRef<ScrollViewInstance>(null);

    const hasValues = match.players.some(p => parse(inputs[p.id] ?? '') !== null);

    const setInput = (id: string, text: string) => {

        // só números, com o sinal de menos no começo quando o jogo aceita negativo
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
        setTimeout(() => rows.current?.scrollToEnd({ animated: true }), 50);

    };

    const table = (
        <View style={[styles.table, fits && styles.flex]}>
            <View style={[styles.row, styles.headRow, { borderBottomColor: sheet.ink }]}>
                <View style={[styles.marginCell, { borderRightColor: sheet.margin }]} />
                {match.players.map(p => {

                    const out = isOut(def, match, p);

                    return (
                        <View key={p.id} style={[styles.cell, cell]}>
                            <Text
                                style={[styles.headName, { color: sheet.ink }, out && styles.outName]}
                                numberOfLines={1}
                            >
                                {p.name}
                            </Text>
                            <View style={[styles.underline, { backgroundColor: p.color }]} />
                        </View>
                    );

                })}
            </View>

            <ScrollView ref={rows} style={styles.flex} contentContainerStyle={styles.rowsContent}>
                {match.log.length === 0 && (
                    <Text style={[styles.empty, { color: sheet.soft }]}>
                        {losing ? 'Anote embaixo quanto cada um perdeu.' : 'Anote embaixo os pontos da primeira rodada.'}
                    </Text>
                )}
                {match.log.map((values, r) => (
                    <View key={r} style={[styles.row, styles.roundRow, { borderBottomColor: sheet.rule }]}>
                        <View style={[styles.marginCell, { borderRightColor: sheet.margin }]}>
                            <Text style={[styles.roundNo, { color: sheet.soft }]}>{r + 1}</Text>
                        </View>
                        {values.map((v, i) => (
                            <View key={i} style={[styles.cell, cell]}>
                                <Text style={[styles.value, { color: v === 0 ? sheet.soft : sheet.ink }]}>
                                    {v === 0 ? '–' : losing ? Math.abs(v) : v > 0 ? `+${v}` : v}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>

            <View style={[styles.row, styles.totalRow, { borderTopColor: sheet.ink }]}>
                <View style={[styles.marginCell, { borderRightColor: sheet.margin }]}>
                    <Text style={[styles.roundNo, { color: sheet.soft }]}>Σ</Text>
                </View>
                {match.players.map(p => (
                    <View key={p.id} style={[styles.cell, cell]}>
                        <Text style={[styles.total, { color: isOut(def, match, p) ? sheet.soft : sheet.ink }]}>
                            {p.score}
                        </Text>
                    </View>
                ))}
            </View>

            {!finished && (
                <View style={[styles.row, styles.entryRow]}>
                    <View style={[styles.marginCell, { borderRightColor: sheet.margin }]}>
                        <Text style={[styles.roundNo, { color: sheet.soft }]}>{losing ? '−' : '+'}</Text>
                    </View>
                    {match.players.map(p => {

                        const out = isOut(def, match, p);

                        return (
                            <View key={p.id} style={[styles.cell, cell, styles.entryCell]}>
                                {out ? (
                                    <Text style={[styles.outTag, { color: sheet.soft }]}>fora</Text>
                                ) : (
                                    <>
                                        {def.negative && (
                                            <TouchableOpacity onPress={() => toggleSign(p.id)} hitSlop={6}>
                                                <Text style={[styles.sign, { color: sheet.soft }]}>±</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TextInput
                                            style={[styles.input, { backgroundColor: sheet.field, color: sheet.ink, borderColor: sheet.rule }]}
                                            value={inputs[p.id] ?? ''}
                                            onChangeText={text => setInput(p.id, text)}
                                            keyboardType="number-pad"
                                            placeholder="0"
                                            placeholderTextColor={sheet.soft}
                                            maxLength={6}
                                            selectTextOnFocus
                                        />
                                    </>
                                )}
                            </View>
                        );

                    })}
                </View>
            )}
        </View>
    );

    return (
        <PlayShell {...props} surface={sheet.surface} tone={sheet.tone}>
            <KeyboardAvoidingView behavior="padding" style={styles.flex}>
                {fits ? (
                    table
                ) : (
                    <ScrollView horizontal contentContainerStyle={styles.wide} keyboardShouldPersistTaps="handled">
                        {table}
                    </ScrollView>
                )}

                {!finished && (
                    <TouchableOpacity
                        style={[styles.submit, { backgroundColor: def.chalk ? colors.gold : colors.ink }, !hasValues && styles.off]}
                        onPress={submit}
                        disabled={!hasValues}
                    >
                        <Text style={[styles.submitText, def.chalk && { color: '#3a2a00' }]}>
                            {losing ? 'Descontar rodada' : 'Anotar rodada'}
                        </Text>
                    </TouchableOpacity>
                )}
            </KeyboardAvoidingView>
        </PlayShell>
    );

}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    wide: { flexGrow: 1 },
    table: { paddingHorizontal: 10 },
    row: { flexDirection: 'row', alignItems: 'center' },
    headRow: { paddingBottom: 8, borderBottomWidth: 2 },
    marginCell: {
        width: MARGIN,
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRightWidth: 1.5,
    },
    cell: { alignItems: 'center', paddingHorizontal: 4 },
    flexCell: { flex: 1 },
    headName: { fontSize: 15, fontWeight: '800', maxWidth: '100%' },
    outName: { textDecorationLine: 'line-through', opacity: 0.5 },
    underline: { height: 3, width: 28, borderRadius: 2, marginTop: 4 },
    rowsContent: { paddingBottom: 4 },
    roundRow: { height: 40, borderBottomWidth: 1 },
    roundNo: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
    value: { fontSize: 18, fontWeight: '600', fontVariant: ['tabular-nums'] },
    empty: { paddingVertical: 24, paddingHorizontal: 18, fontSize: 15 },
    totalRow: { height: 52, borderTopWidth: 2 },
    total: { fontSize: 26, fontWeight: '900', fontVariant: ['tabular-nums'] },
    entryRow: { paddingVertical: 8 },
    entryCell: { flexDirection: 'row', justifyContent: 'center', gap: 2 },
    sign: { fontSize: 18, fontWeight: '800', paddingHorizontal: 2 },
    input: {
        flex: 1,
        minWidth: 0,
        maxWidth: 76,
        height: 44,
        borderRadius: radius.sm,
        borderWidth: 1.5,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    outTag: { fontSize: 14, fontStyle: 'italic', paddingVertical: 12 },
    submit: { marginHorizontal: 16, marginTop: 4, marginBottom: 10, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 17, fontWeight: '800' },
    off: { opacity: 0.35 },
});
