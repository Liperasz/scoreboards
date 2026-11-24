import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { winnerOf } from '../engine/score';
import { pointLabel, pointTo } from '../engine/tennis';
import PlayShell from '../ui/PlayShell';
import type { PlayProps } from '../ui/PlayShell';
import { radius, textOn } from '../ui/theme';

// piso de cada quadra (a areia é clara, então o texto em volta fica escuro)
const COURTS: Record<string, { floor: string; tone: 'light' | 'dark' }> = {
    'tenis': { floor: '#b0502b', tone: 'dark' },
    'beach-tennis': { floor: '#d8bb84', tone: 'light' },
    'padel': { floor: '#2c5a96', tone: 'dark' },
};

const BOARD = '#14213d';
const BOARD_SOFT = 'rgba(255,255,255,0.55)';
const POINT_BOX = '#f2d24b';

// placar de transmissão: sets fechados, games do set e o ponto do game atual
export default function CourtScreen(props: PlayProps) {

    const { def, match, onChange } = props;
    const tennis = match.tennis;
    const rules = def.tennis;

    if (tennis === null || rules === null) {
        return null;
    }

    const finished = winnerOf(def, match) !== null;
    const court = COURTS[def.id] ?? { floor: def.accent, tone: 'dark' as const };
    const golden = rules.noAd && !tennis.tiebreak && tennis.points[0] === 3 && tennis.points[1] === 3;

    const point = (index: number) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(pointTo(def, match, index));

    };

    let status: string | null = null;

    if (tennis.tiebreak) {
        status = 'Tie-break';
    } else if (golden) {
        status = 'Ponto de ouro';
    }

    return (
        <PlayShell {...props} surface={court.floor} tone={court.tone}>
            <View style={styles.board}>
                {match.players.map((p, i) => (
                    <View key={p.id} style={[styles.boardRow, i > 0 && styles.boardDivider]}>
                        <View style={[styles.bar, { backgroundColor: p.color }]} />
                        <Text style={styles.boardName} numberOfLines={1}>
                            {p.name}
                        </Text>
                        {match.setScores.map((set, s) => (
                            <Text key={s} style={[styles.setCell, set[i] > set[1 - i] && styles.setWon]}>
                                {set[i]}
                            </Text>
                        ))}
                        {!finished && <Text style={styles.games}>{tennis.games[i]}</Text>}
                        {!finished && (
                            <View style={styles.pointBox}>
                                <Text style={styles.point}>{pointLabel(tennis, i, rules)}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            <Text style={[styles.status, court.tone === 'light' && styles.statusDark]}>{status ?? ' '}</Text>

            <View style={styles.zones}>
                {match.players.map((p, i) => {

                    const fg = textOn(p.color);

                    return (
                        <Pressable
                            key={p.id}
                            style={({ pressed }) => [styles.zone, { backgroundColor: p.color }, pressed && styles.pressed, finished && styles.off]}
                            onPress={() => point(i)}
                            disabled={finished}
                        >
                            <Text style={[styles.zoneLabel, { color: fg }]}>Ponto de</Text>
                            <Text style={[styles.zoneName, { color: fg }]} numberOfLines={2}>
                                {p.name}
                            </Text>
                        </Pressable>
                    );

                })}
            </View>
        </PlayShell>
    );

}

const styles = StyleSheet.create({
    board: {
        marginHorizontal: 16,
        backgroundColor: BOARD,
        borderRadius: radius.md,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    boardRow: { flexDirection: 'row', alignItems: 'center', height: 54, paddingRight: 6 },
    boardDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
    bar: { width: 6, alignSelf: 'stretch' },
    boardName: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '800', paddingHorizontal: 12 },
    setCell: { width: 28, textAlign: 'center', color: BOARD_SOFT, fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
    setWon: { color: '#fff' },
    games: { width: 34, textAlign: 'center', color: '#fff', fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },
    pointBox: {
        width: 56,
        height: 40,
        marginLeft: 6,
        borderRadius: 8,
        backgroundColor: POINT_BOX,
        alignItems: 'center',
        justifyContent: 'center',
    },
    point: { color: BOARD, fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },
    status: { textAlign: 'center', color: '#fff', fontSize: 15, fontWeight: '800', marginVertical: 10 },
    statusDark: { color: '#14213d' },
    zones: { flex: 1, flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
    zone: { flex: 1, borderRadius: radius.lg, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 4 },
    pressed: { opacity: 0.85 },
    off: { opacity: 0.45 },
    zoneLabel: { fontSize: 15, fontWeight: '700', opacity: 0.8 },
    zoneName: { fontSize: 26, fontWeight: '900', textAlign: 'center' },
});
