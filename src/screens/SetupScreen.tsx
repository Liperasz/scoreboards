import { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createMatch, defaultSettings } from '../engine/match';
import type { Entry, GameDef, Match, Settings } from '../engine/types';
import { backgroundOf } from '../games/backgrounds';
import { bestOfLabel } from '../games/describe';
import Chips from '../ui/Chips';
import ColorPicker from '../ui/ColorPicker';
import Header from '../ui/Header';
import Stepper from '../ui/Stepper';
import { colors, common, PLAYER_COLORS, radius, textOn } from '../ui/theme';

const BEST_OF = [1, 3, 5, 7];
const TEAM_NAMES = ['Nós', 'Eles'];

interface Props {

    def: GameDef;
    // partida anterior, usada para reaproveitar nomes, cores e regras
    previous?: Match;
    onStart: (match: Match) => void;
    onBack: () => void;

}

function defaultName(def: GameDef, index: number): string {

    if (def.teams) {
        return TEAM_NAMES[index] ?? `Time ${index + 1}`;
    }

    return `Jogador ${index + 1}`;

}

function makeEntry(def: GameDef, index: number): Entry {

    return { name: defaultName(def, index), color: PLAYER_COLORS[index % PLAYER_COLORS.length] };

}

// o que dá para ajustar depende da regra de vitória do jogo
function editableFields(def: GameDef) {

    return {
        target: def.mode !== 'tennis' && def.target !== null && def.direction === 'up',
        start: def.direction === 'down',
        bestOf: def.bestOf !== null && def.win === 'reach',
    };

}

function targetLabel(def: GameDef, bestOf: number): string {

    if (def.win === 'reach') {
        return bestOf > 1 ? 'Pontos por set' : 'Pontos para vencer';
    }

    return 'Limite de pontos';

}

export default function SetupScreen({ def, previous, onStart, onBack }: Props) {

    const insets = useSafeAreaInsets();
    const fields = editableFields(def);
    const initial = previous?.settings ?? defaultSettings(def);
    const [editing, setEditing] = useState<number | null>(null);

    const [entries, setEntries] = useState<Entry[]>(() => {

        if (previous !== undefined) {
            return previous.players.map(p => ({ name: p.name, color: p.color }));
        }

        return Array.from({ length: def.defaultPlayers }, (_, i) => makeEntry(def, i));

    });
    const [targetText, setTargetText] = useState(String(initial.target ?? ''));
    const [startText, setStartText] = useState(String(initial.startScore));
    const [bestOf, setBestOf] = useState(initial.bestOf);

    const changeCount = (count: number) => {

        setEntries(prev => {

            if (count <= prev.length) {
                return prev.slice(0, count);
            }

            const extra = Array.from({ length: count - prev.length }, (_, i) => makeEntry(def, prev.length + i));

            return [...prev, ...extra];

        });

    };

    const updateEntry = (index: number, changes: Partial<Entry>) => {
        setEntries(prev => prev.map((entry, i) => (i === index ? { ...entry, ...changes } : entry)));
    };

    const start = () => {

        // campo vazio ou inválido volta para o padrão do jogo
        const target = parseInt(targetText, 10);
        const startScore = parseInt(startText, 10);

        const settings: Settings = {
            target: fields.target && target > 0 ? target : def.target,
            startScore: fields.start && startScore > 0 ? startScore : def.startScore,
            bestOf: fields.bestOf ? bestOf : 1,
        };

        onStart(createMatch(def, entries, settings));

    };

    const fixedCount = def.minPlayers === def.maxPlayers;

    return (
        <View style={styles.screen}>
            <ImageBackground
                source={backgroundOf(def.id)}
                style={[styles.hero, { paddingTop: insets.top }]}
                imageStyle={styles.heroImage}
                resizeMethod="resize"
            >
                <View style={[StyleSheet.absoluteFill, styles.heroShade]} />
                <Header title="" onBack={onBack} />
                <View style={styles.heroText}>
                    <Text style={styles.title}>{def.title}</Text>
                    <Text style={styles.hint}>{def.hint}</Text>
                </View>
            </ImageBackground>

            <KeyboardAvoidingView behavior="padding" style={common.flex}>
                <ScrollView
                    contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.sectionHead}>
                        <Text style={common.sectionTitle}>{def.teams ? 'Times' : 'Jogadores'}</Text>
                        {!fixedCount && (
                            <Stepper value={entries.length} min={def.minPlayers} max={def.maxPlayers} onChange={changeCount} />
                        )}
                    </View>

                    {entries.map((entry, i) => (
                        <View key={i} style={styles.entry}>
                            <View style={styles.entryRow}>
                                <TouchableOpacity
                                    style={[styles.swatch, { backgroundColor: entry.color }]}
                                    onPress={() => setEditing(editing === i ? null : i)}
                                    accessibilityLabel="Trocar cor"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={entry.name}
                                    onChangeText={name => updateEntry(i, { name })}
                                    placeholder={defaultName(def, i)}
                                    placeholderTextColor={colors.chalkFaint}
                                    maxLength={18}
                                    selectTextOnFocus
                                />
                            </View>
                            {editing === i && (
                                <ColorPicker
                                    selected={entry.color}
                                    onSelect={color => {

                                        updateEntry(i, { color });
                                        setEditing(null);

                                    }}
                                />
                            )}
                        </View>
                    ))}

                    {fields.bestOf && (
                        <View style={styles.section}>
                            <Text style={common.sectionTitle}>Partida</Text>
                            <Chips
                                options={BEST_OF.map(n => ({ value: n, label: bestOfLabel(n) }))}
                                selected={bestOf}
                                onSelect={setBestOf}
                                accent={colors.gold}
                            />
                        </View>
                    )}

                    {(fields.target || fields.start) && (
                        <View style={styles.numbers}>
                            {fields.target && (
                                <View style={styles.numberField}>
                                    <Text style={common.sectionTitle}>{targetLabel(def, bestOf)}</Text>
                                    <TextInput
                                        style={[styles.input, styles.number]}
                                        value={targetText}
                                        onChangeText={setTargetText}
                                        keyboardType="number-pad"
                                        maxLength={5}
                                        selectTextOnFocus
                                    />
                                </View>
                            )}
                            {fields.start && (
                                <View style={styles.numberField}>
                                    <Text style={common.sectionTitle}>{def.mode === 'lives' ? 'Vidas' : 'Pontos iniciais'}</Text>
                                    <TextInput
                                        style={[styles.input, styles.number]}
                                        value={startText}
                                        onChangeText={setStartText}
                                        keyboardType="number-pad"
                                        maxLength={4}
                                        selectTextOnFocus
                                    />
                                </View>
                            )}
                        </View>
                    )}

                    <TouchableOpacity style={[common.primaryBtn, styles.startBtn]} onPress={start}>
                        <Text style={[common.primaryText, { color: textOn(colors.gold) }]}>Começar a partida</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );

}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.felt },
    hero: { minHeight: 210, justifyContent: 'space-between', backgroundColor: colors.feltDeep, overflow: 'hidden' },
    heroImage: { width: '100%', height: '100%' },
    heroShade: { backgroundColor: 'rgba(11,42,33,0.62)' },
    heroText: { paddingHorizontal: 18, paddingBottom: 18, gap: 6 },
    title: { color: colors.chalk, fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
    hint: { color: colors.chalkSoft, fontSize: 15, lineHeight: 21 },
    body: { paddingHorizontal: 16, paddingTop: 18, gap: 12 },
    sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
    section: { gap: 10, marginTop: 8 },
    entry: { gap: 4 },
    entryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: 'rgba(244,239,228,0.25)' },
    input: {
        flex: 1,
        backgroundColor: colors.feltDeep,
        borderRadius: radius.sm,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 17,
        fontWeight: '700',
        color: colors.chalk,
    },
    numbers: { flexDirection: 'row', gap: 12, marginTop: 8 },
    numberField: { flex: 1, gap: 8 },
    number: { flex: 0, textAlign: 'center' },
    startBtn: { marginTop: 18, backgroundColor: colors.gold },
});
