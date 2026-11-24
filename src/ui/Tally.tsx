import { StyleSheet, View } from 'react-native';
import { colors } from './theme';

interface Props {

    count: number;
    color?: string;
    strike?: string;
    height?: number;

}

const TILTS = ['-2deg', '1deg', '-1deg', '2deg'];

// risquinhos de giz em grupos de 5: quatro traços e o quinto atravessado
export default function Tally({ count, color = colors.chalk, strike = colors.gold, height = 34 }: Props) {

    const groups = Math.floor(count / 5);
    const rest = count % 5;
    const thick = Math.max(3, height * 0.13);
    const gap = height * 0.24;

    const group = (bars: number, closed: boolean, key: number) => (
        <View key={key} style={[styles.group, { height, gap }]}>
            {Array.from({ length: bars }, (_, i) => (
                <View
                    key={i}
                    style={{
                        width: thick,
                        height,
                        borderRadius: thick,
                        backgroundColor: color,
                        transform: [{ rotate: TILTS[i] }],
                    }}
                />
            ))}
            {closed && (
                <View
                    style={[
                        styles.strike,
                        {
                            height: thick,
                            borderRadius: thick,
                            backgroundColor: strike,
                            left: -height * 0.18,
                            right: -height * 0.18,
                            top: height / 2 - thick / 2,
                        },
                    ]}
                />
            )}
        </View>
    );

    return (
        <View style={[styles.wrap, { rowGap: height * 0.4, columnGap: height * 0.7 }]}>
            {Array.from({ length: groups }, (_, i) => group(4, true, i))}
            {rest > 0 && group(rest, false, groups)}
        </View>
    );

}

const styles = StyleSheet.create({
    wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
    group: { flexDirection: 'row' },
    strike: { position: 'absolute', transform: [{ rotate: '-28deg' }] },
});
