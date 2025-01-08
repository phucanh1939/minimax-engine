import { MinimaxEngine } from "./MinimaxEngine";

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        var hash = this.getStateHash(state);
        this.evaluateValues.push(Math.abs(hash));
        return Math.abs(hash);
        if (this.evaluateCache.has(hash)) {
            var value = this.evaluateCache.get(hash) || 1939;
            this.evaluateValues.push(value);
        }
        var value = getRandomInt(-1000, 1000);
        this.evaluateCache.set(hash, value);
        this.evaluateValues.push(value);
        return value;
    }

    public getStateHash(state: TestGameState): number {
        var board = state.board;
        let binaryString = "";
        for (let i = 0; i < board.length; i++) {
            binaryString += board[i].toString();
        }
        return parseInt(binaryString, 2) * state.player;
    }

    public isTerminal(state: TestGameState): boolean {
        return false;
    }

    public getPossibleMoves(state: TestGameState): number[] {
        return [0, 1];
    }
    public makeMove(state: TestGameState, move: number): void {
        state.board.push(move);
        game.player = -game.player;
    }
    public undoMove(state: TestGameState, move: number): void {
        state.board.pop();
        game.player = -game.player;
    }
}

const lookAhead = 3;
var game: TestGameState = {board: [0], player: 1};
var engine = new TestEngine(lookAhead);

// Find best move for player 1
console.log(`*--------------------------------------*`);
var bestMove = engine.findBestMove(game, game.player);
console.log(`|   bestMove for player ${game.player} = ${bestMove}`);
console.log(`|   evaluateValues: ${JSON.stringify(engine.evaluateValues)}`);
console.log(`*--------------------------------------*`);

// Find best move for player 2
engine.evaluateValues = [];
console.log(`*--------------------------------------*`);
game.player = -1;
var bestMove = engine.findBestMove(game, game.player);
console.log(`|   bestMove for player ${game.player} = ${bestMove}`);
console.log(`|   evaluateValues: ${JSON.stringify(engine.evaluateValues)}`);
console.log(`*--------------------------------------*`);
