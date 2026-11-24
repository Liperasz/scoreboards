import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createMatch, defaultSettings } from '../engine/match';
import type { Entry, GameDef, Match, Settings } from '../engine/types';
import { bestOfLabel } from '../games/describe';
import Chips from '../ui/Chips';
import ColorPicker from '../ui/ColorPicker';
import GameBackground from '../ui/GameBackground';
import Header from '../ui/Header';
import Stepper from '../ui/Stepper';
import { colors, common, PLAYER_COLORS, radius } from '../ui/theme';

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
        <GameBackground gameId={def.id} dim={0.65}>
            <View style={[common.flex, { paddingTop: insets.top }]}>
                <Header title={def.title} onBack={onBack} />
                <KeyboardAvoidingView behavior="padding" style={common.flex}>
                    <ScrollView
                        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={[common.hint, styles.hint]}>{def.hint}</Text>

                        {!fixedCount && (
                            <View style={styles.section}>
                                <Text style={common.label}>{def.teams ? 'Times' : 'Jogadores'}</Text>
                                <Stepper
                                    value={entries.length}
                                    min={def.minPlayers}
                                    max={def.maxPlayers}
                                    onChange={changeCount}
                                />
                            </View>
                        )}

                        {entries.map((entry, i) => (
                            <View key={i} style={[common.glassCard, styles.entry]}>
                                <TextInput
                                    style={[styles.input, { borderLeftColor: entry.color }]}
                                    value={entry.name}
                                    onChangeText={name => updateEntry(i, { name })}
                                    placeholder={defaultName(def, i)}
                                    placeholderTextColor={colors.textFaint}
                                    maxLength={18}
                                    selectTextOnFocus
                                />
                                <ColorPicker selected={entry.color} onSelect={color => updateEntry(i, { color })} />
                            </View>
                        ))}

                        {fields.bestOf && (
                            <View style={styles.section}>
                                <Text style={common.label}>Partida</Text>
                                <Chips
                                    options={BEST_OF.map(n => ({ value: n, label: bestOfLabel(n) }))}
                                    selected={bestOf}
                                    onSelect={setBestOf}
                                    accent={def.accent}
                                />
                            </View>
                        )}

                        {fields.target && (
                            <View style={styles.section}>
                                <Text style={common.label}>{targetLabel(def, bestOf)}</Text>
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
                            <View style={styles.section}>
                                <Text style={common.label}>{def.mode === 'lives' ? 'Vidas' : 'Pontos iniciais'}</Text>
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

                        <TouchableOpacity
                            style={[common.primaryBtn, styles.startBtn, { backgroundColor: def.accent }]}
                            onPress={start}
                        >
                            <Text style={common.primaryText}>Começar</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </GameBackground>
    );

}

const styles = StyleSheet.create({
    body: { paddingHorizontal: 16, gap: 12 },
    hint: { textAlign: 'center', marginBottom: 4 },
    section: { gap: 8, marginTop: 4 },
    entry: { padding: 12 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: radius.sm,
        borderLeftWidth: 6,
        borderLeftColor: 'transparent',
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
    },
    number: { width: 120, textAlign: 'center' },
    startBtn: { marginTop: 12 },
});
