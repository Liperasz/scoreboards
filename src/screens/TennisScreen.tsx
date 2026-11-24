import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { winnerOf } from '../engine/score';
import { pointLabel, pointTo } from '../engine/tennis';
import PlayShell from '../ui/PlayShell';
import type { PlayProps } from '../ui/PlayShell';
import { colors, radius, textOn } from '../ui/theme';

// tênis, beach tennis e padel: toque no lado de quem fez o ponto
export default function TennisScreen(props: PlayProps) {

    const { def, match, onChange } = props;
    const tennis = match.tennis;
    const rules = def.tennis;

    if (tennis === null || rules === null) {
        return null;
    }

    const finished = winnerOf(def, match) !== null;

    const point = (index: number) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(pointTo(def, match, index));

    };

    return (
        <PlayShell {...props}>
            <View style={styles.duo}>
                {match.players.map((p, i) => {

                    const fg = textOn(p.color);

                    return (
                        <Pressable
                            key={p.id}
                            disabled={finished}
                            onPress={() => point(i)}
                            style={({ pressed }) => [styles.panel, { backgroundColor: `${p.color}e6` }, pressed && styles.pressed]}
                        >
                            <Text style={[styles.name, { color: fg }]} numberOfLines={1}>
                                {p.name}
                            </Text>
                            <Text style={[styles.point, { color: fg }]}>{pointLabel(tennis, i, rules)}</Text>
                            <View style={styles.stats}>
                                <Text style={[styles.stat, { color: fg }]}>Games {tennis.games[i]}</Text>
                                {match.settings.bestOf > 1 && (
                                    <Text style={[styles.stat, { color: fg }]}>Sets {p.sets}</Text>
                                )}
                            </View>
                        </Pressable>
                    );

                })}
            </View>
            <Text style={styles.tip}>{tennis.tiebreak ? 'Tie-break' : def.hint}</Text>
        </PlayShell>
    );

}

const styles = StyleSheet.create({
    duo: { flex: 1, paddingHorizontal: 16, gap: 12 },
    panel: { flex: 1, borderRadius: radius.lg, padding: 16, justifyContent: 'space-between' },
    pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
    name: { fontSize: 22, fontWeight: '800' },
    point: { fontSize: 110, lineHeight: 120, fontWeight: '900', textAlign: 'center', fontVariant: ['tabular-nums'] },
    stats: { flexDirection: 'row', justifyContent: 'space-between' },
    stat: { fontSize: 18, fontWeight: '800' },
    tip: { textAlign: 'center', color: colors.textSoft, fontSize: 13, paddingVertical: 8, paddingHorizontal: 16 },
});
