import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addPoints } from '../engine/match';
import { winnerOf } from '../engine/score';
import PlayShell from '../ui/PlayShell';
import type { PlayProps } from '../ui/PlayShell';
import { colors, radius } from '../ui/theme';

const TABLE = '#0f6a3c';
const RAIL = '#5a3416';
const BALL = 54;

// sinuca: escolhe quem está na vez e toca na bola que caiu
export default function SnookerScreen(props: PlayProps) {

    const { def, match, onChange } = props;
    const finished = winnerOf(def, match) !== null;
    const [turn, setTurn] = useState(0);
    const active = Math.min(turn, match.players.length - 1);

    const pot = (pts: number) => {

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(addPoints(def, match, active, pts));

    };

    const pass = () => {

        Haptics.selectionAsync();
        setTurn((active + 1) % match.players.length);

    };

    return (
        <PlayShell {...props} surface={TABLE}>
            <View style={styles.players}>
                {match.players.map((p, i) => (
                    <Pressable key={p.id} style={[styles.player, i === active && styles.playerActive]} onPress={() => setTurn(i)}>
                        <View style={[styles.dot, { backgroundColor: p.color }]} />
                        <Text style={styles.name} numberOfLines={1}>
                            {p.name}
                        </Text>
                        <Text style={styles.score}>{p.score}</Text>
                        <Text style={[styles.turn, i !== active && styles.hidden]}>na vez</Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.rail}>
                <View style={styles.cloth}>
                    <Text style={styles.prompt}>Bola encaçapada por {match.players[active].name}</Text>
                    <View style={styles.balls}>
                        {def.buttons.map(button => (
                            <TouchableOpacity
                                key={button.label}
                                style={[styles.ball, { backgroundColor: button.color ?? '#c62828' }, finished && styles.off]}
                                onPress={() => pot(button.pts)}
                                disabled={finished}
                                accessibilityLabel={`Bola de ${button.pts}`}
                            >
                                <View style={styles.ballShine} />
                                <View style={styles.ballBadge}>
                                    <Text style={styles.ballText}>{button.label}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.pass} onPress={pass} disabled={finished}>
                <Text style={styles.passText}>Errou · passar a vez</Text>
            </TouchableOpacity>
        </PlayShell>
    );

}

const styles = StyleSheet.create({
    players: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
    player: {
        flexGrow: 1,
        flexBasis: '45%',
        borderRadius: radius.lg,
        padding: 14,
        backgroundColor: 'rgba(0,0,0,0.22)',
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
        gap: 2,
    },
    playerActive: { borderColor: colors.gold, backgroundColor: 'rgba(0,0,0,0.32)' },
    dot: { width: 12, height: 12, borderRadius: 6 },
    name: { color: colors.chalk, fontSize: 17, fontWeight: '800' },
    score: { color: '#fff', fontSize: 52, fontWeight: '900', fontVariant: ['tabular-nums'], lineHeight: 58 },
    turn: { color: colors.gold, fontSize: 13, fontWeight: '800' },
    hidden: { opacity: 0 },
    rail: { flex: 1, margin: 16, borderRadius: 26, backgroundColor: RAIL, padding: 12 },
    cloth: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: '#13804a',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        padding: 12,
    },
    prompt: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '700', textAlign: 'center' },
    balls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, maxWidth: 300 },
    ball: {
        width: BALL,
        height: BALL,
        borderRadius: BALL / 2,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.45,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 3 },
    },
    ballShine: {
        position: 'absolute',
        top: 7,
        left: 11,
        width: 14,
        height: 9,
        borderRadius: 7,
        backgroundColor: 'rgba(255,255,255,0.45)',
        transform: [{ rotate: '-30deg' }],
    },
    ballBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fffdf6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ballText: { color: '#1a1a1a', fontSize: 14, fontWeight: '900' },
    pass: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: radius.md,
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.28)',
    },
    passText: { color: colors.chalk, fontSize: 16, fontWeight: '800' },
    off: { opacity: 0.4 },
});
