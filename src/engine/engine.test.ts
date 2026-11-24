/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GAMES, getGame } from '../games/catalog.ts';
import { addPoints, addRound, createMatch, defaultSettings, rematch, undo } from './match.ts';
import { alertOf, isOut, winnerOf } from './score.ts';
import { pointLabel, pointTo } from './tennis.ts';
import type { GameDef, Match } from './types.ts';

function def(id: string): GameDef {

    const found = getGame(id);

    assert.ok(found, `jogo ${id} não existe`);

    return found;

}

function start(id: string, count = 2): Match {

    const entries = Array.from({ length: count }, (_, i) => ({ name: `P${i + 1}`, color: '#000' }));

    return createMatch(def(id), entries, defaultSettings(def(id)));

}

function scores(match: Match): number[] {

    return match.players.map(p => p.score);

}

test('catálogo sem ids repetidos e com regras coerentes', () => {

    const ids = new Set(GAMES.map(g => g.id));

    assert.equal(ids.size, GAMES.length);

    for (const g of GAMES) {

        assert.ok(g.minPlayers <= g.defaultPlayers && g.defaultPlayers <= g.maxPlayers, g.id);
        assert.ok(g.buttons.length > 0, g.id);

        if (g.mode === 'tennis') {
            assert.ok(g.tennis !== null, g.id);
        }

    }

});

test('truco paulista trava em 12 e vence', () => {

    const truco = def('truco-paulista');
    let match = start('truco-paulista');

    match = addPoints(truco, match, 0, 9);
    assert.equal(winnerOf(truco, match), null);

    match = addPoints(truco, match, 0, 1);
    match = addPoints(truco, match, 0, 1);
    assert.equal(alertOf(truco, match), 'Mão de onze: P1');

    match = addPoints(truco, match, 0, 3);
    assert.deepEqual(scores(match), [12, 0]);
    assert.equal(winnerOf(truco, match)?.name, 'P1');

    // depois de terminar não soma mais
    assert.equal(addPoints(truco, match, 1, 3), match);

});

test('desfazer volta ao estado anterior', () => {

    const truco = def('truco-paulista');
    let match = start('truco-paulista');

    match = addPoints(truco, match, 1, 3);
    match = addPoints(truco, match, 1, 6);
    match = undo(match);

    assert.deepEqual(scores(match), [0, 3]);
    assert.equal(match.history.length, 1);

    match = undo(undo(match));
    assert.deepEqual(scores(match), [0, 0]);

});

test('ping-pong precisa de 2 de vantagem e fecha sets', () => {

    const pong = def('ping-pong');
    let match = start('ping-pong');

    for (let i = 0; i < 10; i++) {
        match = addPoints(pong, match, 0, 1);
        match = addPoints(pong, match, 1, 1);
    }

    match = addPoints(pong, match, 0, 1);
    assert.deepEqual(scores(match), [11, 10]);
    assert.equal(match.players[0].sets, 0);

    match = addPoints(pong, match, 0, 1);
    assert.equal(match.players[0].sets, 1);
    assert.deepEqual(scores(match), [0, 0]);
    assert.deepEqual(match.setScores, [[12, 10]]);

    // mais dois sets de 11 a 0 fecham o melhor de 5
    for (let i = 0; i < 22; i++) {
        match = addPoints(pong, match, 0, 1);
    }

    assert.equal(winnerOf(pong, match)?.name, 'P1');
    assert.deepEqual(scores(match), [11, 0]);

});

test('vôlei: set decisivo vai a 15', () => {

    const volei = def('volei');
    let match = start('volei');

    // 2 sets para cada
    for (const side of [0, 1, 0, 1]) {
        for (let i = 0; i < 25; i++) {
            match = addPoints(volei, match, side, 1);
        }
    }

    assert.deepEqual(match.players.map(p => p.sets), [2, 2]);

    for (let i = 0; i < 15; i++) {
        match = addPoints(volei, match, 1, 1);
    }

    assert.equal(winnerOf(volei, match)?.name, 'P2');

});

test('badminton fecha em 30 mesmo sem vantagem', () => {

    const bad = def('badminton');
    let match = start('badminton');

    for (let i = 0; i < 29; i++) {
        match = addPoints(bad, match, 0, 1);
        match = addPoints(bad, match, 1, 1);
    }

    match = addPoints(bad, match, 0, 1);
    assert.equal(match.players[0].sets, 1);

});

test('cacheta elimina quem zera e vence o último', () => {

    const cacheta = def('cacheta');
    let match = start('cacheta', 3);

    match = addRound(cacheta, match, [4, 10, 2]);
    assert.deepEqual(scores(match), [6, 0, 8]);
    assert.ok(isOut(cacheta, match, match.players[1]));

    // quem saiu não perde mais
    match = addRound(cacheta, match, [6, 5, 1]);
    assert.deepEqual(scores(match), [0, 0, 7]);
    assert.equal(winnerOf(cacheta, match)?.name, 'P3');
    assert.equal(match.log.length, 2);

});

test('copas: chegou a 100, vence o menor', () => {

    const copas = def('copas');
    let match = start('copas', 3);

    match = addRound(copas, match, [60, 20, 46]);
    assert.equal(winnerOf(copas, match), null);

    match = addRound(copas, match, [45, 10, 0]);
    assert.equal(winnerOf(copas, match)?.name, 'P2');

});

test('pontinho: estourou o limite, saiu', () => {

    const pontinho = def('pontinho');
    let match = start('pontinho', 3);

    match = addRound(pontinho, match, [100, 40, 99]);
    assert.ok(isOut(pontinho, match, match.players[0]));
    assert.equal(winnerOf(pontinho, match), null);

    match = addRound(pontinho, match, [0, 10, 1]);
    assert.equal(winnerOf(pontinho, match)?.name, 'P2');

});

test('dardos: estouro não conta e zerar vence', () => {

    const dardos = def('dardos');
    let match = start('dardos');

    match = addRound(dardos, match, [180, 100]);
    match = addRound(dardos, match, [180, 100]);
    assert.deepEqual(scores(match), [141, 301]);

    match = addRound(dardos, match, [150, 0]);
    assert.deepEqual(scores(match), [141, 301]);

    match = addRound(dardos, match, [141, 0]);
    assert.equal(winnerOf(dardos, match)?.name, 'P1');

});

test('buraco aceita negativo', () => {

    const buraco = def('buraco');
    let match = start('buraco');

    match = addRound(buraco, match, [-150, 800]);
    assert.deepEqual(scores(match), [-150, 800]);

});

test('fodinha perde vidas até sobrar um', () => {

    const fodinha = def('fodinha');
    let match = start('fodinha');

    for (let i = 0; i < 5; i++) {
        match = addPoints(fodinha, match, 1, -1);
    }

    assert.equal(match.players[1].score, 0);
    assert.equal(winnerOf(fodinha, match)?.name, 'P1');

});

test('tênis: vantagem, game, tie-break e set', () => {

    const tenis = def('tenis');
    const rules = tenis.tennis!;
    let match = start('tenis');

    // 40-40, vantagem e volta ao iguais
    for (let i = 0; i < 3; i++) {
        match = pointTo(tenis, match, 0);
        match = pointTo(tenis, match, 1);
    }

    match = pointTo(tenis, match, 0);
    assert.equal(pointLabel(match.tennis!, 0, rules), 'AD');

    match = pointTo(tenis, match, 1);
    assert.equal(pointLabel(match.tennis!, 0, rules), '40');

    match = pointTo(tenis, match, 0);
    match = pointTo(tenis, match, 0);
    assert.deepEqual(match.tennis!.games, [1, 0]);

    // leva os games até 6-6
    const game = (side: number) => {
        for (let i = 0; i < 4; i++) {
            match = pointTo(tenis, match, side);
        }
    };

    for (let i = 0; i < 5; i++) {
        game(1);
    }

    for (let i = 0; i < 5; i++) {
        game(0);
    }

    game(1);

    assert.deepEqual(match.tennis!.games, [6, 6]);
    assert.ok(match.tennis!.tiebreak);

    for (let i = 0; i < 7; i++) {
        match = pointTo(tenis, match, 1);
    }

    assert.equal(match.players[1].sets, 1);
    assert.deepEqual(match.setScores, [[6, 7]]);
    assert.deepEqual(match.tennis!.games, [0, 0]);

});

test('beach tennis: no-ad decide no ponto de ouro', () => {

    const beach = def('beach-tennis');
    let match = start('beach-tennis');

    for (let i = 0; i < 3; i++) {
        match = pointTo(beach, match, 0);
        match = pointTo(beach, match, 1);
    }

    match = pointTo(beach, match, 1);
    assert.deepEqual(match.tennis!.games, [0, 1]);

});

test('revanche zera mantendo os jogadores', () => {

    const truco = def('truco-paulista');
    let match = start('truco-paulista');

    match = addPoints(truco, match, 0, 12);

    const next = rematch(truco, match);

    assert.deepEqual(scores(next), [0, 0]);
    assert.deepEqual(next.players.map(p => p.name), ['P1', 'P2']);
    assert.equal(winnerOf(truco, next), null);

});
