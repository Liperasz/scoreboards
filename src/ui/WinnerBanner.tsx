import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Player } from '../engine/types';
import { colors, common, radius, textOn } from './theme';

interface Props {

    winner: Player;
    onRematch: () => void;
    onNewGame: () => void;

}

export default function WinnerBanner({ winner, onRematch, onNewGame }: Props) {

    const fg = textOn(winner.color);

    return (
        <View style={[styles.banner, { backgroundColor: winner.color }]}>
            <Text style={[styles.title, { color: fg }]} numberOfLines={2}>
                🏆 {winner.name} venceu!
            </Text>
            <View style={styles.row}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: fg }]} onPress={onRematch}>
                    <Text style={[styles.btnText, { color: winner.color }]}>Revanche</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.outline, { borderColor: fg }]} onPress={onNewGame}>
                    <Text style={[styles.btnText, { color: fg }]}>Novo jogo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    banner: { borderRadius: radius.lg, padding: 16, marginBottom: 12, gap: 12 },
    title: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
    row: { flexDirection: 'row', gap: 10 },
    btn: { ...common.primaryBtn, flex: 1, paddingVertical: 12 },
    outline: { backgroundColor: 'transparent', borderWidth: 2 },
    btnText: { fontSize: 16, fontWeight: '800', color: colors.text },
});
