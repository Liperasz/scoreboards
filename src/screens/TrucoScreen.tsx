import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addPoints } from '../engine/match';
import { alertOf, winnerOf } from '../engine/score';
import type { Player } from '../engine/types';
import PlayShell from '../ui/PlayShell';
import type { PlayProps } from '../ui/PlayShell';
import { colors, radius, textOn } from '../ui/theme';

const WOOD = require('../../assets/textures/wood.webp');

// furos por coluna da tábua (acima disso, a tábua ganha mais uma coluna por time)
const HOLES_PER_COLUMN = 12;

function Hole({ filled, color }: { filled: boolean; color: string }) {

    return (
        <View style={styles.hole}>
            {filled && (
                <View style={[styles.peg, { backgroundColor: color }]}>
                    <View style={styles.pegShine} />
                </View>
            )}
        </View>
    );

}

// uma raia da tábua: os furos sobem de baixo pra cima, separados de 3 em 3
function Lane({ player, target, onPress, disabled }: { player: Player; target: number; onPress: () => void; disabled: boolean }) {

    const columns = Math.ceil(target / HOLES_PER_COLUMN);

    return (
        <Pressable style={({ pressed }) => [styles.lane, pressed && styles.lanePressed]} onPress={onPress} disabled={disabled}>
            <Text style={styles.laneName} numberOfLines={1}>
                {player.name}
            </Text>
            <Text style={styles.laneScore}>
                {player.score}
                <Text style={styles.laneTarget}>/{target}</Text>
            </Text>

            <View style={styles.columns}>
                {Array.from({ length: columns }, (_, c) => {

                    const first = c * HOLES_PER_COLUMN;
                    const count = Math.min(HOLES_PER_COLUMN, target - first);

                    return (
                        <View key={c} style={styles.column}>
                            {Array.from({ length: count }, (_, i) => {

                                // de baixo pra cima: o último item da coluna é o primeiro ponto
                                const point = first + count - i;

                                return (
                                    <View key={point} style={[styles.holeSlot, point % 3 === 0 && point !== first + count && styles.groupGap]}>
                                        <Hole filled={point <= player.score} color={player.color} />
                                    </View>
                                );

                            })}
                        </View>
                    );

                })}
            </View>
        </Pressable>
    );

}

// tábua de truco: escolhe quanto a mão vale e toca no time que ganhou
export default function TrucoScreen(props: PlayProps) {

    const { def, match, onChange } = props;
    const finished = winnerOf(def, match) !== null;
    const target = match.settings.target ?? 12;

    // mão de onze/dez já vale truco, então a mão começa no segundo valor
    const defaultStake = alertOf(def, match) !== null && def.buttons.length > 1 ? 1 : 0;
    const [chosen, setChosen] = useState<number | null>(null);
    const stakeIndex = chosen ?? defaultStake;
    const stake = def.buttons[stakeIndex];

    const score = (index: number, pts: number, resetStake: boolean) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onChange(addPoints(def, match, index, pts));

        if (resetStake) {
            setChosen(null);
        }

    };

    return (
        <PlayShell {...props} hideRules>
            <ImageBackground source={WOOD} style={styles.board} imageStyle={styles.boardImage} resizeMode="cover">
                {match.players.map((player, i) => (
                    <View key={player.id} style={styles.laneWrap}>
                        {i > 0 && <View style={styles.groove} />}
                        <Lane player={player} target={target} disabled={finished} onPress={() => score(i, stake.pts, true)} />
                    </View>
                ))}
            </ImageBackground>

            <View style={styles.controls}>
                <View style={styles.stakeRow}>
                    {def.buttons.map((button, i) => {

                        const active = i === stakeIndex;

                        return (
                            <TouchableOpacity
                                key={button.label}
                                style={[styles.stake, active && styles.stakeActive]}
                                onPress={() => setChosen(i)}
                                disabled={finished}
                            >
                                <Text style={[styles.stakeLabel, active && styles.stakeLabelActive]}>{button.label}</Text>
                                <Text style={[styles.stakePts, active && styles.stakeLabelActive]}>{button.pts}</Text>
                            </TouchableOpacity>
                        );

                    })}
                </View>

                <View style={styles.winRow}>
                    {match.players.map((player, i) => {

                        const fg = textOn(player.color);

                        return (
                            <View key={player.id} style={styles.winCol}>
                                <TouchableOpacity
                                    style={[styles.winBtn, { backgroundColor: player.color }, finished && styles.off]}
                                    onPress={() => score(i, stake.pts, true)}
                                    disabled={finished}
                                >
                                    <Text style={[styles.winPts, { color: fg }]}>+{stake.pts}</Text>
                                    <Text style={[styles.winName, { color: fg }]} numberOfLines={1}>
                                        {player.name}
                                    </Text>
                                </TouchableOpacity>

                                {def.extras.length > 0 && (
                                    <View style={styles.extraRow}>
                                        {def.extras.map(extra => (
                                            <TouchableOpacity
                                                key={extra.label}
                                                style={[styles.extra, finished && styles.off]}
                                                onPress={() => score(i, extra.pts, false)}
                                                disabled={finished}
                                            >
                                                <Text style={styles.extraText}>
                                                    {extra.label} +{extra.pts}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );

                    })}
                </View>

            </View>
        </PlayShell>
    );

}

const HOLE = 22;

const styles = StyleSheet.create({
    board: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 16,
        borderRadius: radius.lg,
        borderWidth: 3,
        borderColor: colors.woodDark,
        overflow: 'hidden',
    },
    boardImage: { borderRadius: radius.lg - 3, width: '100%', height: '100%' },
    laneWrap: { flex: 1, flexDirection: 'row' },
    groove: { width: 4, marginVertical: 18, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.28)' },
    lane: { flex: 1, alignItems: 'center', paddingTop: 12, paddingBottom: 14 },
    lanePressed: { backgroundColor: 'rgba(255,255,255,0.06)' },
    laneName: { color: '#fbe9d0', fontSize: 17, fontWeight: '800', maxWidth: '90%' },
    laneScore: { color: '#fff7ea', fontSize: 44, fontWeight: '900', fontVariant: ['tabular-nums'], lineHeight: 50 },
    laneTarget: { fontSize: 18, color: 'rgba(255,247,234,0.55)', fontWeight: '700' },
    columns: { flex: 1, flexDirection: 'row', gap: 14, marginTop: 6 },
    column: { justifyContent: 'space-between' },
    holeSlot: { flex: 1, justifyContent: 'center', minHeight: HOLE + 2 },
    groupGap: { marginTop: 10 },
    hole: {
        width: HOLE,
        height: HOLE,
        borderRadius: HOLE / 2,
        backgroundColor: '#2b170a',
        borderTopWidth: 2,
        borderTopColor: '#1a0d04',
        alignItems: 'center',
        justifyContent: 'center',
    },
    peg: {
        width: HOLE - 2,
        height: HOLE - 2,
        borderRadius: (HOLE - 2) / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.35)',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 2 },
    },
    pegShine: {
        position: 'absolute',
        top: 3,
        left: 4,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.55)',
    },
    controls: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 12 },
    stakeRow: { flexDirection: 'row', gap: 6 },
    stake: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 7,
        borderRadius: radius.sm,
        borderWidth: 1.5,
        borderColor: colors.feltLine,
    },
    stakeActive: { backgroundColor: colors.gold, borderColor: colors.gold },
    stakeLabel: { color: colors.chalkSoft, fontSize: 12, fontWeight: '700' },
    stakePts: { color: colors.chalk, fontSize: 18, fontWeight: '900' },
    stakeLabelActive: { color: '#3a2a00' },
    winRow: { flexDirection: 'row', gap: 10 },
    winCol: { flex: 1, gap: 6 },
    winBtn: { borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
    winPts: { fontSize: 26, fontWeight: '900', lineHeight: 30 },
    winName: { fontSize: 14, fontWeight: '700' },
    extraRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    extra: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 6,
        borderRadius: radius.sm,
        borderWidth: 1.5,
        borderColor: colors.feltLine,
    },
    extraText: { color: colors.chalk, fontSize: 12, fontWeight: '700' },
    off: { opacity: 0.4 },
});
