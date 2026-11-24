import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from './theme';

interface Props {

    title: string;
    onBack: () => void;
    onUndo?: () => void;
    canUndo?: boolean;
    // light: texto escuro (bloquinho de papel), dark: texto de giz
    tone?: 'light' | 'dark';

}

export default function Header({ title, onBack, onUndo, canUndo = false, tone = 'dark' }: Props) {

    const fg = tone === 'light' ? colors.ink : colors.chalk;
    const line = tone === 'light' ? 'rgba(34,48,77,0.18)' : 'rgba(244,239,228,0.22)';

    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={onBack}
                hitSlop={10}
                style={[styles.round, { borderColor: line }]}
                accessibilityLabel="Voltar"
            >
                <Text style={[styles.chevron, { color: fg }]}>‹</Text>
            </TouchableOpacity>

            <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
                {title}
            </Text>

            {onUndo !== undefined ? (
                <TouchableOpacity
                    onPress={onUndo}
                    disabled={!canUndo}
                    hitSlop={10}
                    style={[styles.undo, { borderColor: line }, !canUndo && styles.off]}
                    accessibilityLabel="Desfazer"
                >
                    <Text style={[styles.undoText, { color: fg }]}>↶ Desfazer</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.round} />
            )}
        </View>
    );

}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 56 },
    round: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chevron: { fontSize: 30, lineHeight: 32, fontWeight: '400', marginTop: -2, marginLeft: -2 },
    title: { flex: 1, fontSize: 19, fontWeight: '800' },
    undo: { height: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, justifyContent: 'center' },
    undoText: { fontWeight: '700', fontSize: 15 },
    off: { opacity: 0.3 },
});
