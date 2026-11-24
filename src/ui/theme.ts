import { StyleSheet } from 'react-native';

export const PLAYER_COLORS = [
    '#2e9e5b',
    '#d9434f',
    '#3b7dd8',
    '#f0a020',
    '#8e6bd6',
    '#17a8b5',
    '#e05597',
    '#8d8d8d',
    '#7cb342',
    '#ff7043',
    '#5c6bc0',
    '#a1887f',
];

export const colors = {
    text: '#ffffff',
    textSoft: 'rgba(255,255,255,0.75)',
    textFaint: 'rgba(255,255,255,0.5)',
    glass: 'rgba(16,16,20,0.55)',
    glassStrong: 'rgba(16,16,20,0.75)',
    glassLight: 'rgba(255,255,255,0.12)',
    border: 'rgba(255,255,255,0.16)',
    overlay: 'rgba(0,0,0,0.45)',
    disabled: 'rgba(255,255,255,0.18)',
    danger: '#ff6b6b',
    gold: '#ffd54f',
    bg: '#111114',
};

export const radius = { sm: 10, md: 14, lg: 20 };

// estilos repetidos em várias telas
export const common = StyleSheet.create({
    flex: { flex: 1 },
    glassCard: {
        backgroundColor: colors.glass,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
    },
    label: { fontSize: 13, fontWeight: '700', color: colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.6 },
    hint: { fontSize: 14, color: colors.textSoft, lineHeight: 20 },
    primaryBtn: { borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
    primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
    ghostBtn: {
        borderRadius: radius.md,
        paddingVertical: 13,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.glassLight,
    },
    ghostText: { color: colors.text, fontSize: 16, fontWeight: '700' },
});

// texto legível sobre qualquer cor de jogador
export function textOn(hex: string): string {

    const value = parseInt(hex.slice(1), 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? '#111' : '#fff';

}
