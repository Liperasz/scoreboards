import { StyleSheet } from 'react-native';

// cores dos jogadores, escolhidas para ler bem tanto no feltro quanto no papel
export const PLAYER_COLORS = [
    '#2f9e62',
    '#d94a4a',
    '#3a78d6',
    '#e8a020',
    '#8a62d0',
    '#159aa6',
    '#d6508f',
    '#7a7f86',
    '#6f9e2f',
    '#e2703a',
    '#4c5bbf',
    '#9c7b62',
];

// a mesa de jogo: feltro, giz, madeira e o bloquinho de papel
export const colors = {
    felt: '#123b2f',
    feltDeep: '#0b2a21',
    feltLine: '#1f5242',
    chalk: '#f4efe4',
    chalkSoft: 'rgba(244,239,228,0.72)',
    chalkFaint: 'rgba(244,239,228,0.42)',
    gold: '#f2b632',
    danger: '#e2574c',
    wood: '#7a4a24',
    woodDark: '#4e2d14',
    woodLight: '#a26a38',
    paper: '#f7f4ec',
    ink: '#22304d',
    inkSoft: '#5d6984',
    rule: '#cad6e8',
    margin: '#e4a3a3',
};

export const radius = { sm: 10, md: 14, lg: 20 };

export const common = StyleSheet.create({
    flex: { flex: 1 },
    hint: { fontSize: 14, color: colors.chalkSoft, lineHeight: 20 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.chalkSoft },
    primaryBtn: { borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
    primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
    quietBtn: {
        borderRadius: radius.md,
        paddingVertical: 13,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.feltLine,
    },
    quietText: { color: colors.chalk, fontSize: 16, fontWeight: '700' },
});

// texto legível sobre qualquer cor de jogador
export function textOn(hex: string): string {

    const value = parseInt(hex.slice(1), 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? '#1a1a1a' : '#ffffff';

}
