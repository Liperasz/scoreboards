import { useMemo, useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { winnerOf } from '../engine/score';
import type { Category, GameDef, Match } from '../engine/types';
import { backgroundOf } from '../games/backgrounds';
import { CATEGORIES, GAMES, getGame } from '../games/catalog';
import type { Matches } from '../state/storage';
import Chips from '../ui/Chips';
import Logo from '../ui/Logo';
import { colors, radius } from '../ui/theme';

type Filter = Category | 'todos';

const FILTERS: { value: Filter; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    ...CATEGORIES.map(c => ({ value: c.id, label: c.label })),
];

// lembra a categoria escolhida ao voltar de um jogo
let lastFilter: Filter = 'todos';

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

    return `${best.name} na frente com ${best.score}`;

}

function GameRow({ def, playing, onPress }: { def: GameDef; playing: boolean; onPress: () => void }) {

    return (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
            <Image source={backgroundOf(def.id)} style={styles.thumb} resizeMethod="resize" />
            <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                    {def.title}
                </Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                    {def.subtitle}
                </Text>
            </View>
            {playing ? <View style={styles.playing} /> : <Text style={styles.chevron}>›</Text>}
        </TouchableOpacity>
    );

}

export default function HomeScreen({ matches, onOpen, onDiscard }: Props) {

    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const [filter, setFilterState] = useState<Filter>(lastFilter);
    const columns = width > 700 ? 2 : 1;

    const setFilter = (value: Filter) => {

        lastFilter = value;
        setFilterState(value);

    };

    const games = useMemo(() => {
        return filter === 'todos' ? GAMES : GAMES.filter(g => g.category === filter);
    }, [filter]);

    const ongoing = Object.values(matches)
        .filter(m => getGame(m.gameId) !== undefined)
        .sort((a, b) => b.updatedAt - a.updatedAt);

    const confirmDiscard = (def: GameDef) => {

        Alert.alert('Apagar partida?', `O placar de ${def.title} será perdido.`, [
            { text: 'Manter', style: 'cancel' },
            { text: 'Apagar', style: 'destructive', onPress: () => onDiscard(def.id) },
        ]);

    };

    const header = (
        <View style={styles.header}>
            <View style={styles.brand}>
                <Logo size={44} />
                <Text style={styles.wordmark}>Scoreboards</Text>
            </View>

            {ongoing.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Continuar</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ongoingRow}>
                        {ongoing.map(match => {

                            const def = getGame(match.gameId)!;

                            return (
                                <TouchableOpacity
                                    key={def.id}
                                    style={styles.ongoing}
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
                numColumns={columns}
                keyExtractor={def => def.id}
                ListHeaderComponent={header}
                columnWrapperStyle={columns > 1 ? styles.columns : undefined}
                contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
                initialNumToRender={12}
                renderItem={({ item }) => (
                    <View style={columns > 1 ? styles.flex : undefined}>
                        <GameRow def={item} playing={matches[item.id] !== undefined} onPress={() => onOpen(item.id)} />
                    </View>
                )}
            />
        </View>
    );

}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    screen: { flex: 1, backgroundColor: colors.felt },
    list: { paddingHorizontal: 16 },
    columns: { gap: 16 },
    header: { gap: 18, paddingTop: 14, paddingBottom: 10 },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    wordmark: { color: colors.chalk, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    section: { gap: 10 },
    sectionTitle: { color: colors.chalkSoft, fontSize: 15, fontWeight: '700' },
    ongoingRow: { gap: 10 },
    ongoing: {
        backgroundColor: colors.chalk,
        borderRadius: radius.md,
        paddingHorizontal: 14,
        paddingVertical: 12,
        minWidth: 170,
        maxWidth: 260,
    },
    ongoingTitle: { color: colors.felt, fontWeight: '900', fontSize: 16 },
    ongoingScore: { color: '#3d5a4f', fontSize: 14, marginTop: 2 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.feltLine,
    },
    thumb: { width: 58, height: 58, borderRadius: 14, backgroundColor: colors.feltDeep },
    rowText: { flex: 1 },
    rowTitle: { color: colors.chalk, fontSize: 18, fontWeight: '800' },
    rowSub: { color: colors.chalkSoft, fontSize: 14, marginTop: 2 },
    chevron: { color: colors.chalkFaint, fontSize: 28, fontWeight: '300', paddingHorizontal: 4 },
    playing: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold, marginHorizontal: 8 },
});
