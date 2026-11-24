import { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { winnerOf } from '../engine/score';
import type { Category, GameDef, Match } from '../engine/types';
import { backgroundOf } from '../games/backgrounds';
import { CATEGORIES, GAMES, getGame } from '../games/catalog';
import type { Matches } from '../state/storage';
import Chips from '../ui/Chips';
import { colors, common, radius, textOn } from '../ui/theme';

type Filter = Category | 'todos';

const FILTERS: { value: Filter; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    ...CATEGORIES.map(c => ({ value: c.id, label: c.label })),
];

// lembra a categoria escolhida ao voltar de um jogo
let lastFilter: Filter = 'todos';

const GAP = 12;
const PADDING = 16;

interface Props {

    matches: Matches;
    onOpen: (gameId: string) => void;
    onDiscard: (gameId: string) => void;

}

// resumo do placar no cartão de partida em andamento
function summary(def: GameDef, match: Match): string {

    const winner = winnerOf(def, match);

    if (winner !== null) {
        return `${winner.name} venceu`;
    }

    if (match.players.length === 2) {

        const [a, b] = match.players;

        return `${a.name} ${a.score} × ${b.score} ${b.name}`;

    }

    const best = match.players.reduce((top, p) => (p.score > top.score ? p : top));

    return `${match.players.length} jogadores · ${best.name} ${best.score}`;

}

function Cover({ def, width, playing, onPress }: { def: GameDef; width: number; playing: boolean; onPress: () => void }) {

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ width }}>
            <ImageBackground
                source={backgroundOf(def.id)}
                style={[styles.cover, { height: width * 1.15 }]}
                imageStyle={styles.coverImage}
                resizeMethod="resize"
            >
                <View style={[StyleSheet.absoluteFill, styles.coverShade]} />
                {playing && (
                    <View style={[styles.badge, { backgroundColor: def.accent }]}>
                        <Text style={[styles.badgeText, { color: textOn(def.accent) }]}>Em andamento</Text>
                    </View>
                )}
                <View style={styles.coverText}>
                    <Text style={styles.coverTitle} numberOfLines={1}>
                        {def.title}
                    </Text>
                    <Text style={styles.coverSub} numberOfLines={2}>
                        {def.subtitle}
                    </Text>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );

}

export default function HomeScreen({ matches, onOpen, onDiscard }: Props) {

    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const [filter, setFilterState] = useState<Filter>(lastFilter);

    const setFilter = (value: Filter) => {

        lastFilter = value;
        setFilterState(value);

    };

    // em telas largas (tablet, paisagem) cabem mais colunas
    const columns = width > 700 ? 4 : 2;
    const itemWidth = (width - PADDING * 2 - GAP * (columns - 1)) / columns;

    const games = useMemo(() => {
        return filter === 'todos' ? GAMES : GAMES.filter(g => g.category === filter);
    }, [filter]);

    const ongoing = Object.values(matches)
        .filter(m => getGame(m.gameId) !== undefined)
        .sort((a, b) => b.updatedAt - a.updatedAt);

    const confirmDiscard = (def: GameDef) => {

        Alert.alert('Descartar partida?', `O placar de ${def.title} será apagado.`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Descartar', style: 'destructive', onPress: () => onDiscard(def.id) },
        ]);

    };

    const header = (
        <View style={styles.header}>
            <Text style={styles.title}>Placar</Text>
            <Text style={styles.subtitle}>Escolha o jogo e marque os pontos</Text>

            {ongoing.length > 0 && (
                <View style={styles.ongoing}>
                    <Text style={common.label}>Em andamento</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ongoingRow}>
                        {ongoing.map(match => {

                            const def = getGame(match.gameId)!;

                            return (
                                <TouchableOpacity
                                    key={def.id}
                                    style={[styles.ongoingCard, { borderLeftColor: def.accent }]}
                                    onPress={() => onOpen(def.id)}
                                    onLongPress={() => confirmDiscard(def)}
                                >
                                    <Text style={styles.ongoingTitle}>{def.title}</Text>
                                    <Text style={styles.ongoingScore} numberOfLines={1}>
                                        {summary(def, match)}
                                    </Text>
                                </TouchableOpacity>
                            );

                        })}
                    </ScrollView>
                    <Text style={styles.tip}>Segure um cartão para descartar a partida</Text>
                </View>
            )}

            <Chips options={FILTERS} selected={filter} onSelect={setFilter} />
        </View>
    );

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <FlatList
                key={columns}
                data={games}
                keyExtractor={def => def.id}
                numColumns={columns}
                ListHeaderComponent={header}
                columnWrapperStyle={styles.column}
                contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
                initialNumToRender={8}
                windowSize={5}
                renderItem={({ item }) => (
                    <Cover
                        def={item}
                        width={itemWidth}
                        playing={matches[item.id] !== undefined}
                        onPress={() => onOpen(item.id)}
                    />
                )}
            />
        </View>
    );

}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    list: { paddingHorizontal: PADDING, gap: GAP },
    column: { gap: GAP },
    header: { gap: 12, marginBottom: 4 },
    title: { fontSize: 34, fontWeight: '900', color: colors.text, marginTop: 12 },
    subtitle: { fontSize: 15, color: colors.textSoft, marginTop: -8 },
    ongoing: { gap: 8 },
    ongoingRow: { gap: 10 },
    ongoingCard: {
        backgroundColor: '#1d1d22',
        borderRadius: radius.md,
        borderLeftWidth: 5,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minWidth: 170,
        maxWidth: 260,
    },
    ongoingTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
    ongoingScore: { color: colors.textSoft, fontSize: 13, marginTop: 2 },
    tip: { color: colors.textFaint, fontSize: 12 },
    cover: { justifyContent: 'flex-end', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#222' },
    coverImage: { borderRadius: radius.lg },
    coverShade: { backgroundColor: 'rgba(0,0,0,0.35)' },
    coverText: { padding: 12, backgroundColor: 'rgba(0,0,0,0.35)' },
    coverTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
    coverSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
    badge: {
        position: 'absolute',
        top: 10,
        left: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
