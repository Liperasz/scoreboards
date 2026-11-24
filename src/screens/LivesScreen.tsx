import * as Haptics from 'expo-haptics';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addPoints } from '../engine/match';
import { isOut, winnerOf } from '../engine/score';
import PlayShell from '../ui/PlayShell';
import type { PlayProps } from '../ui/PlayShell';
import { colors, common, radius } from '../ui/theme';

// acima disso os corações viram número para o cartão não crescer
const MAX_HEARTS = 10;

function Hearts({ lives, total }: { lives: number; total: number }) {

    if (Math.max(lives, total) > MAX_HEARTS) {
        return <Text style={styles.heartsText}>♥ × {lives}</Text>;
    }

    const full = '♥'.repeat(lives);
    const empty = '♡'.repeat(Math.max(total - lives, 0));

    return (
        <Text style={styles.heartsText}>
            {full}
            <Text style={styles.empty}>{empty}</Text>
        </Text>
    );

}

// vidas por jogador (fodinha): perdeu todas, está fora
export default function LivesScreen(props: PlayProps) {

    const { def, match, onChange } = props;
    const finished = winnerOf(def, match) !== null;

    const change = (index: number, pts: number) => {

        Haptics.impactAsync(pts < 0 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
        onChange(addPoints(def, match, index, pts));

    };

    return (
        <PlayShell {...props}>
            <ScrollView contentContainerStyle={styles.grid}>
                {match.players.map((p, i) => {

                    const out = isOut(def, match, p);
                    const locked = out || finished;

                    return (
                        <View key={p.id} style={[common.glassCard, styles.card, { borderColor: p.color }, out && styles.out]}>
                            <Text style={styles.name} numberOfLines={1}>
                                {p.name}
                            </Text>
                            {out ? (
                                <Text style={styles.outTag}>FORA</Text>
                            ) : (
                                <Hearts lives={p.score} total={match.settings.startScore} />
                            )}
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[styles.btn, styles.minus, locked && styles.off]}
                                    disabled={locked}
                                    onPress={() => change(i, -1)}
                                >
                                    <Text style={styles.btnText}>−1</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, locked && styles.off]}
                                    disabled={locked}
                                    onPress={() => change(i, 1)}
                                >
                                    <Text style={styles.btnText}>+1</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );

                })}
                <Text style={[common.hint, styles.hint]}>{def.hint}</Text>
            </ScrollView>
        </PlayShell>
    );

}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, paddingBottom: 24 },
    card: { width: '47.5%', borderWidth: 2, alignItems: 'center', gap: 10 },
    out: { opacity: 0.4 },
    name: { color: colors.text, fontSize: 18, fontWeight: '800' },
    heartsText: { color: '#ff5468', fontSize: 22, letterSpacing: 2, textAlign: 'center' },
    empty: { color: colors.textFaint },
    outTag: { color: colors.danger, fontSize: 20, fontWeight: '900' },
    row: { flexDirection: 'row', gap: 8, alignSelf: 'stretch' },
    btn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: radius.sm,
        backgroundColor: colors.glassLight,
        alignItems: 'center',
    },
    minus: { backgroundColor: 'rgba(255,84,104,0.35)' },
    btnText: { color: colors.text, fontSize: 17, fontWeight: '800' },
    off: { opacity: 0.4 },
    hint: { width: '100%', textAlign: 'center', marginTop: 4 },
});
