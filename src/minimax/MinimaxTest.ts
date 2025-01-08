import { MinimaxEngine } from "./MinimaxEngine";

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hashStringToNumber(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char; // (hash * 31 + char) equivalent
      hash |= 0; // Convert to 32-bit integer
    }
    return hash;
  }

interface TestGameState {
    board: number[];
    player: number;
}
type TestGameMove = number;
type TestGameHash = number;

export class TestEngine extends MinimaxEngine<TestGameState, TestGameMove, TestGameHash> {
    evaluateCache: Map<TestGameHash, number> = new Map();
    evaluateValues: number[] = [];

    constructor(lookAhead: number) {
        super();
        this.lookAhead = lookAhead;
    }

    public evaluate(state: TestGameState): number {
        var board = state.board;
        let str = "";
        for (let i = 0; i < board.length; i++) {
            str += board[i].toString();
        }
        var value = hashStringToNumber(str);
        this.evaluateValues.push(value);
        return value;

        var hash = this.getStateHash(state);
        if (this.evaluateCache.has(hash)) {
            var value = this.evaluateCache.get(hash) || 1939;
            this.evaluateValues.push(value);
        }
        var value = getRandomInt(-1000, 1000);
        this.evaluateCache.set(hash, value);
        this.evaluateValues.push(value);
        return value;
    }

    public getStateHash(state: TestGameState): TestGameHash {
        var board = state.board;
        let str = "";
        for (let i = 0; i < board.length; i++) {
            str += board[i].toString();
        }
        str = state.player > 0 ? str + "w" : str + "b";
        return hashStringToNumber(str);
    }

    public isTerminal(state: TestGameState): boolean {
        return false;
    }

    public getPossibleMoves(state: TestGameState): number[] {
        return [0, 1];
    }

    public makeMove(state: TestGameState, move: number): boolean {
        state.board.push(move);
        game.player = -game.player;
        return true;
    }

    public undoMove(state: TestGameState, move: number): boolean {
        state.board.pop();
        game.player = -game.player;
        return true;
    }
}

const lookAhead = 3;
var game: TestGameState = {board: [0], player: 1};
var engine = new TestEngine(lookAhead);

// Find best move for player 1
var moveCount = 1;
console.log(`*--------------------------------------*`);
var bestMove = engine.findBestMove(game, game.player);
console.log(`|   bestMove ${moveCount} for player ${game.player} = ${bestMove}`);
console.log(`|   evaluateValues: ${JSON.stringify(engine.evaluateValues)}`);
console.log(`*--------------------------------------*`);

// player 1 make move
if (bestMove !== null) engine.makeMove(game, bestMove);
// player -1 make move
engine.makeMove(game, 0);

// Find best for for player 1
moveCount++;
engine.evaluateValues = [];
console.log(`*--------------------------------------*`);
var bestMove = engine.findBestMove(game, game.player);
console.log(`|   bestMove ${moveCount} for player ${game.player} = ${bestMove}`);
console.log(`|   evaluateValues: ${JSON.stringify(engine.evaluateValues)}`);
console.log(`*--------------------------------------*`);


// Find best move for player 2
// engine.evaluateValues = [];
// console.log(`*--------------------------------------*`);
// game.player = -1;
// var bestMove = engine.findBestMove(game, game.player);
// console.log(`|   bestMove for player ${game.player} = ${bestMove}`);
// console.log(`|   evaluateValues: ${JSON.stringify(engine.evaluateValues)}`);
// console.log(`*--------------------------------------*`);
