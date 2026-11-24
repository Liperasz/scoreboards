import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PLAYER_COLORS } from './theme';

interface Props {

    selected: string;
    onSelect: (color: string) => void;

}

export default function ColorPicker({ selected, onSelect }: Props) {

    return (
        <View style={styles.row}>
            {PLAYER_COLORS.map(color => (
                <TouchableOpacity
                    key={color}
                    onPress={() => onSelect(color)}
                    hitSlop={4}
                    style={[styles.dot, { backgroundColor: color }, color === selected && styles.active]}
                />
            ))}
        </View>
    );

}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 8 },
    dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 3, borderColor: 'transparent' },
    active: { borderColor: '#fff', transform: [{ scale: 1.15 }] },
});
