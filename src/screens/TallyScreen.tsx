import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addPoints } from '../engine/match';
import { winnerOf } from '../engine/score';
import type { Player } from '../engine/types';
import PlayShell from '../ui/PlayShell';
import type { PlayProps } from '../ui/PlayShell';
import Tally from '../ui/Tally';
import { colors, radius } from '../ui/theme';

interface CardProps {

    player: Player;
    index: number;
    props: PlayProps;
    tapPts: number;
    showButtons: boolean;
    disabled: boolean;
    big: boolean;

}

function Card({ player, index, props, tapPts, showButtons, disabled, big }: CardProps) {

    const { def, match, onChange } = props;
    const target = match.settings.target;

    const add = (pts: number) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(addPoints(def, match, index, pts));

    };

    return (
        <Pressable
            style={({ pressed }) => [styles.card, big && styles.cardBig, pressed && styles.pressed]}
            onPress={() => add(tapPts)}
            onLongPress={() => add(-tapPts)}
            disabled={disabled}
        >
            <View style={styles.top}>
                <View style={[styles.dot, { backgroundColor: player.color }]} />
                <Text style={styles.name} numberOfLines={1}>
                    {player.name}
                </Text>
                <Text style={styles.count}>{player.score}</Text>
            </View>

            <View style={styles.tally}>
                {player.score === 0 ? (
                    <Text style={styles.empty}>Nenhum ponto ainda</Text>
                ) : (
                    <Tally count={player.score} height={big ? 44 : 30} />
                )}
            </View>

            {target !== null && player.score < target && (
                <Text style={styles.left}>
                    {target - player.score === 1 ? 'falta 1' : `faltam ${target - player.score}`}
                </Text>
            )}

            {showButtons && (
                <View style={styles.buttons}>
                    {def.buttons.map(button => (
                        <TouchableOpacity
                            key={button.label}
                            style={[styles.btn, disabled && styles.off]}
                            disabled={disabled}
                            onPress={() => add(button.pts)}
                        >
                            <Text style={styles.btnLabel}>{button.label}</Text>
                            <Text style={styles.btnPts}>+{button.pts}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </Pressable>
    );

}

// contagem em risquinhos (dominó, porrinha, bilhar, sueca, vitórias)
export default function TallyScreen(props: PlayProps) {

    const { def, match } = props;
    const finished = winnerOf(def, match) !== null;
    const positives = def.buttons.filter(b => b.pts > 0).map(b => b.pts);
    const tapPts = positives.length > 0 ? Math.min(...positives) : 1;
    const showButtons = positives.length > 1;
    const big = match.players.length === 2;

    return (
        <PlayShell {...props}>
            <ScrollView contentContainerStyle={[styles.list, big && styles.listBig]}>
                {match.players.map((player, i) => (
                    <Card
                        key={player.id}
                        player={player}
                        index={i}
                        props={props}
                        tapPts={tapPts}
                        showButtons={showButtons}
                        disabled={finished}
                        big={big}
                    />
                ))}
                <Text style={styles.tip}>
                    {showButtons ? `Toque no cartão para +${tapPts}, ou escolha o tipo de ponto` : 'Toque no cartão para marcar, segure para tirar'}
                </Text>
            </ScrollView>
        </PlayShell>
    );

}

const styles = StyleSheet.create({
    list: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
    listBig: { flexGrow: 1 },
    card: {
        backgroundColor: colors.feltDeep,
        borderRadius: radius.lg,
        padding: 16,
        gap: 12,
        borderWidth: 1.5,
        borderColor: colors.feltLine,
    },
    cardBig: { flex: 1, minHeight: 200 },
    pressed: { backgroundColor: '#0f3328' },
    top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dot: { width: 14, height: 14, borderRadius: 7 },
    name: { flex: 1, color: colors.chalk, fontSize: 20, fontWeight: '800' },
    count: { color: colors.chalk, fontSize: 30, fontWeight: '900', fontVariant: ['tabular-nums'] },
    tally: { flex: 1, justifyContent: 'center', paddingHorizontal: 6, minHeight: 50 },
    empty: { color: colors.chalkFaint, fontSize: 15 },
    left: { color: colors.chalkSoft, fontSize: 14, fontWeight: '600' },
    buttons: { flexDirection: 'row', gap: 8 },
    btn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: radius.sm,
        backgroundColor: 'rgba(244,239,228,0.08)',
    },
    btnLabel: { color: colors.chalkSoft, fontSize: 12, fontWeight: '700' },
    btnPts: { color: colors.chalk, fontSize: 17, fontWeight: '900' },
    tip: { textAlign: 'center', color: colors.chalkFaint, fontSize: 13 },
    off: { opacity: 0.4 },
});
