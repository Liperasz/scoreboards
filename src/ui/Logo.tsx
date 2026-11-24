import { StyleSheet, View } from 'react-native';
import { colors } from './theme';

// os cinco risquinhos do logo, feitos com views (o svg em assets/brand é a mesma figura)
const BARS = [
    { left: 0.29, tilt: '-1.6deg' },
    { left: 0.4, tilt: '0.8deg' },
    { left: 0.515, tilt: '-1.1deg' },
    { left: 0.625, tilt: '1.3deg' },
];

export default function Logo({ size = 96, framed = true }: { size?: number; framed?: boolean }) {

    const thick = size * 0.066;

    return (
        <View style={[{ width: size, height: size }, framed && { backgroundColor: colors.felt, borderRadius: size * 0.227 }]}>
            {BARS.map((bar, i) => (
                <View
                    key={i}
                    style={[
                        styles.bar,
                        {
                            left: size * bar.left,
                            top: size * 0.29,
                            width: thick,
                            height: size * 0.42,
                            borderRadius: thick,
                            transform: [{ rotate: bar.tilt }],
                        },
                    ]}
                />
            ))}
            <View
                style={[
                    styles.strike,
                    {
                        left: size * 0.19,
                        top: size * 0.47,
                        width: size * 0.63,
                        height: thick * 1.05,
                        borderRadius: thick,
                        transform: [{ rotate: '-26deg' }],
                    },
                ]}
            />
        </View>
    );

}

const styles = StyleSheet.create({
    bar: { position: 'absolute', backgroundColor: colors.chalk },
    strike: { position: 'absolute', backgroundColor: colors.gold },
});
