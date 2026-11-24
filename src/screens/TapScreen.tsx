import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addPoints } from '../engine/match';
import { setsNeeded, winnerOf } from '../engine/score';
import type { Player } from '../engine/types';
import PlayShell from '../ui/PlayShell';
import type { PlayProps } from '../ui/PlayShell';
import { colors, radius, textOn } from '../ui/theme';

interface PanelProps {

    player: Player;
    big: boolean;
    disabled: boolean;
    showButtons: boolean;
    props: PlayProps;
    index: number;
    tapPts: number;

}

function SetDots({ player, total, color }: { player: Player; total: number; color: string }) {

    return (
        <View style={styles.dots}>
            {Array.from({ length: total }, (_, i) => (
                <View key={i} style={[styles.dot, { borderColor: color }, i < player.sets && { backgroundColor: color }]} />
            ))}
        </View>
    );

}

function Panel({ player, big, disabled, showButtons, props, index, tapPts }: PanelProps) {

    const { def, match, onChange } = props;
    const fg = textOn(player.color);

    const add = (pts: number) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(addPoints(def, match, index, pts));

    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.panel,
                big && styles.panelBig,
                { backgroundColor: `${player.color}e6` },
                pressed && styles.pressed,
            ]}
            disabled={disabled}
            onPress={() => add(tapPts)}
            onLongPress={() => add(-tapPts)}
        >
            <View style={styles.panelTop}>
                <Text style={[styles.name, { color: fg }]} numberOfLines={1}>
                    {player.name}
                </Text>
                {match.settings.bestOf > 1 && <SetDots player={player} total={setsNeeded(match)} color={fg} />}
            </View>

            <Text
                style={[styles.score, big && styles.scoreBig, { color: fg }]}
                adjustsFontSizeToFit
                numberOfLines={1}
            >
                {player.score}
            </Text>

            {showButtons && (
                <View style={styles.btnRow}>
                    {def.buttons.map(button => (
                        <TouchableOpacity
                            key={button.label}
                            disabled={disabled}
                            onPress={() => add(button.pts)}
                            style={[styles.btn, button.color !== undefined && { backgroundColor: button.color }]}
                        >
                            <Text style={styles.btnText}>{button.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </Pressable>
    );

}

// placar por toque: a área do jogador soma o menor ponto e segurar desconta
export default function TapScreen(props: PlayProps) {

    const { def, match } = props;
    const finished = winnerOf(def, match) !== null;
    const positives = def.buttons.filter(b => b.pts > 0).map(b => b.pts);
    const tapPts = positives.length > 0 ? Math.min(...positives) : 1;
    const showButtons = def.buttons.length > 1;
    const big = match.players.length === 2;

    const panels = match.players.map((player, i) => (
        <Panel
            key={player.id}
            player={player}
            big={big}
            disabled={finished}
            showButtons={showButtons}
            props={props}
            index={i}
            tapPts={tapPts}
        />
    ));

    return (
        <PlayShell {...props}>
            {big ? (
                <View style={styles.duo}>{panels}</View>
            ) : (
                <ScrollView contentContainerStyle={styles.list}>{panels}</ScrollView>
            )}
            <Text style={styles.tip}>
                Toque no placar para +{tapPts} · segure para −{tapPts}
            </Text>
        </PlayShell>
    );

}

const styles = StyleSheet.create({
    duo: { flex: 1, paddingHorizontal: 16, gap: 12 },
    list: { paddingHorizontal: 16, gap: 10, paddingBottom: 12 },
    panel: { borderRadius: radius.lg, padding: 14 },
    panelBig: { flex: 1, justifyContent: 'space-between' },
    pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
    panelTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    name: { flex: 1, fontSize: 22, fontWeight: '800' },
    score: { fontSize: 56, fontWeight: '900', textAlign: 'center', fontVariant: ['tabular-nums'] },
    scoreBig: { fontSize: 120, lineHeight: 130 },
    dots: { flexDirection: 'row', gap: 5 },
    dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
    btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    btn: {
        minWidth: 54,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: radius.sm,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
    },
    btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    tip: { textAlign: 'center', color: colors.textFaint, fontSize: 12, paddingVertical: 8 },
});
