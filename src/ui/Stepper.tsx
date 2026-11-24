import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from './theme';

interface Props {

    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;

}

export default function Stepper({ value, min, max, step = 1, onChange }: Props) {

    const canDown = value - step >= min;
    const canUp = value + step <= max;

    return (
        <View style={styles.row}>
            <TouchableOpacity
                style={[styles.btn, !canDown && styles.off]}
                disabled={!canDown}
                onPress={() => onChange(value - step)}
            >
                <Text style={styles.sign}>−</Text>
            </TouchableOpacity>
            <Text style={styles.value}>{value}</Text>
            <TouchableOpacity
                style={[styles.btn, !canUp && styles.off]}
                disabled={!canUp}
                onPress={() => onChange(value + step)}
            >
                <Text style={styles.sign}>+</Text>
            </TouchableOpacity>
        </View>
    );

}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    btn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.glassLight,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    off: { opacity: 0.3 },
    sign: { color: colors.text, fontSize: 24, fontWeight: '700', marginTop: -2 },
    value: { color: colors.text, fontSize: 24, fontWeight: '800', minWidth: 36, textAlign: 'center' },
});
