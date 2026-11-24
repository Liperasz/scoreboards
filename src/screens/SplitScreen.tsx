import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addPoints } from '../engine/match';
import { setsNeeded, winnerOf } from '../engine/score';
import type { Player } from '../engine/types';
import PlayShell from '../ui/PlayShell';
import type { PlayProps } from '../ui/PlayShell';
import { colors, radius, textOn } from '../ui/theme';

interface HalfProps {

    player: Player;
    index: number;
    props: PlayProps;
    tapPts: number;
    showButtons: boolean;
    disabled: boolean;
    big: boolean;

}

function Half({ player, index, props, tapPts, showButtons, disabled, big }: HalfProps) {

    const { def, match, onChange } = props;
    const fg = textOn(player.color);
    const sets = match.settings.bestOf > 1 ? setsNeeded(match) : 0;

    const add = (pts: number) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(addPoints(def, match, index, pts));

    };

    return (
        <Pressable
            style={({ pressed }) => [styles.half, big ? styles.halfBig : styles.halfRow, { backgroundColor: player.color }, pressed && styles.pressed]}
            onPress={() => add(tapPts)}
            onLongPress={() => add(-tapPts)}
            disabled={disabled}
        >
            <View style={styles.top}>
                <Text style={[styles.name, { color: fg }]} numberOfLines={1}>
                    {player.name}
                </Text>
                {sets > 0 && (
                    <View style={styles.dots}>
                        {Array.from({ length: sets }, (_, i) => (
                            <View key={i} style={[styles.dot, { borderColor: fg }, i < player.sets && { backgroundColor: fg }]} />
                        ))}
                    </View>
                )}
            </View>

            <Text style={[styles.score, big && styles.scoreBig, { color: fg }]} numberOfLines={1} adjustsFontSizeToFit>
                {player.score}
            </Text>

            {showButtons && (
                <View style={styles.buttons}>
                    {def.buttons.map(button => (
                        <TouchableOpacity
                            key={button.label}
                            style={styles.btn}
                            onPress={() => add(button.pts)}
                            disabled={disabled}
                        >
                            <Text style={styles.btnText}>{button.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </Pressable>
    );

}

// placar dividido em cores: esportes, pebolim, bocha, contador
export default function SplitScreen(props: PlayProps) {

    const { def, match } = props;
    const finished = winnerOf(def, match) !== null;
    const positives = def.buttons.filter(b => b.pts > 0).map(b => b.pts);
    const tapPts = positives.length > 0 ? Math.min(...positives) : 1;
    const showButtons = def.buttons.length > 1 && !(def.buttons.length === 2 && positives.length === 1);
    const big = match.players.length === 2;

    const halves = match.players.map((player, i) => (
        <Half
            key={player.id}
            player={player}
            index={i}
            props={props}
            tapPts={tapPts}
            showButtons={showButtons}
            disabled={finished}
            big={big}
        />
    ));

    return (
        <PlayShell {...props}>
            {big ? <View style={styles.duo}>{halves}</View> : <ScrollView contentContainerStyle={styles.list}>{halves}</ScrollView>}
            <Text style={styles.tip}>Toque para +{tapPts} · segure para tirar</Text>
        </PlayShell>
    );

}

const styles = StyleSheet.create({
    duo: { flex: 1, gap: 3 },
    list: { gap: 3 },
    half: { paddingHorizontal: 20, paddingVertical: 16 },
    halfBig: { flex: 1, justifyContent: 'space-between' },
    halfRow: { minHeight: 150, justifyContent: 'space-between' },
    pressed: { opacity: 0.88 },
    top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    name: { flex: 1, fontSize: 22, fontWeight: '800' },
    dots: { flexDirection: 'row', gap: 6 },
    dot: { width: 13, height: 13, borderRadius: 7, borderWidth: 2 },
    score: { fontSize: 72, fontWeight: '900', textAlign: 'center', fontVariant: ['tabular-nums'] },
    scoreBig: { fontSize: 140, lineHeight: 150 },
    buttons: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
    btn: {
        minWidth: 64,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: radius.sm,
        backgroundColor: 'rgba(0,0,0,0.22)',
    },
    btnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
    tip: { textAlign: 'center', color: colors.chalkFaint, fontSize: 13, paddingVertical: 8 },
});
