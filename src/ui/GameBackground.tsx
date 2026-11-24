import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { backgroundOf } from '../games/backgrounds';
import { colors } from './theme';

interface Props {

    gameId: string;
    children: ReactNode;
    // escurecimento extra nas telas com muito texto
    dim?: number;

}

// a foto já vem desfocada e comprimida do script, aqui só escurece para o texto aparecer
export default function GameBackground({ gameId, children, dim = 0.6 }: Props) {

    return (
        <ImageBackground source={backgroundOf(gameId)} style={styles.bg} resizeMode="cover" resizeMethod="resize">
            <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${dim})` }]} />
            {children}
        </ImageBackground>
    );

}

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: colors.bg },
});
