import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from './theme';

interface Props {

    title: string;
    onBack: () => void;
    onUndo?: () => void;
    canUndo?: boolean;

}

export default function Header({ title, onBack, onUndo, canUndo = false }: Props) {

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.side}>
                <Text style={styles.back}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>
            <View style={[styles.side, styles.right]}>
                {onUndo !== undefined && (
                    <TouchableOpacity
                        onPress={onUndo}
                        disabled={!canUndo}
                        hitSlop={12}
                        style={[styles.undo, !canUndo && styles.off]}
                    >
                        <Text style={styles.undoText}>↶ Desfazer</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 52 },
    side: { width: 110 },
    right: { alignItems: 'flex-end' },
    back: { fontSize: 38, lineHeight: 40, color: colors.text, fontWeight: '300', paddingHorizontal: 6 },
    title: { flex: 1, textAlign: 'center', fontSize: 19, fontWeight: '800', color: colors.text },
    undo: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: colors.glassLight,
        borderWidth: 1,
        borderColor: colors.border,
    },
    undoText: { color: colors.text, fontWeight: '700', fontSize: 14 },
    off: { opacity: 0.35 },
});
