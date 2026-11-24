import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, textOn } from './theme';

interface Props<T> {

    options: { value: T; label: string }[];
    selected: T;
    onSelect: (value: T) => void;
    accent?: string;

}

// lista horizontal de opções (categorias da home, melhor de N no setup)
export default function Chips<T extends string | number>({ options, selected, onSelect, accent = '#ffffff' }: Props<T>) {

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {options.map(option => {

                const active = option.value === selected;

                return (
                    <TouchableOpacity
                        key={String(option.value)}
                        onPress={() => onSelect(option.value)}
                        style={[styles.chip, active && { backgroundColor: accent, borderColor: accent }]}
                    >
                        <Text style={[styles.text, active && { color: textOn(accent) }]}>{option.label}</Text>
                    </TouchableOpacity>
                );

            })}
        </ScrollView>
    );

}

const styles = StyleSheet.create({
    row: { gap: 8, paddingVertical: 2 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.glassLight,
    },
    text: { color: colors.text, fontWeight: '700', fontSize: 14 },
});
