interface TranspositionEntry {
    depth: number,
    value: number,
    flag: number,
}

const FLAG_EXACT =  0;
const FLAG_LOWER = -1;
const FLAG_UPPER =  1;

/**
 * Used to find best move from a game state
 * Valid game: 2 players, zero-sum, perfect information
 */
export abstract class MinimaxEngine<TGameState, TGameMove, TStateHash> {
    protected lookAhead = 1;
    protected transTable: Map<TStateHash, TranspositionEntry> = new Map();

    public abstract evaluate(state: TGameState): number;
    public abstract getStateHash(state: TGameState): TStateHash;
    public abstract isTerminal(state: TGameState): boolean;
    public abstract getPossibleMoves(state: TGameState): TGameMove[];
    public abstract makeMove(state: TGameState, move: TGameMove): boolean;
    public abstract undoMove(state: TGameState, move: TGameMove): boolean;

    public setLookAhead(lookAhead: number) {
        this.lookAhead = lookAhead;
    }

    public clearCache() {
        this.transTable.clear();
    }

    public negamax(state: TGameState, depth: number, alpha: number, beta: number, color: number): number {
        // Save alpha
        const alphaOrigin = alpha;

        // Check cache
        var hash = this.getStateHash(state);
        var entry = this.transTable.get(hash);
        if (entry && entry.depth >= depth) {
            if (entry.flag == FLAG_EXACT) return entry.value;
            else if (entry.flag == FLAG_LOWER && entry.value > alpha) alpha = entry.value;
            else if (entry.flag == FLAG_UPPER && entry.value < beta) beta = entry.value
            if (alpha >= beta) return entry.value;
        }

        // Check for leaf
        if (depth == 0 || this.isTerminal(state))
            return color * this.evaluate(state);

        // Calculate for child nodes
        const moves = this.getPossibleMoves(state);
        var maxValue = -Infinity;
        for (const move of moves) {
            this.makeMove(state, move);
            const value = -this.negamax(state, depth - 1, -beta, -alpha, -color);
            this.undoMove(state, move);
            if (value > maxValue) {
                maxValue = value;
                if (maxValue > alpha) alpha = maxValue;
            }
            if (alpha >= beta) break;
        }

        // Update trans table
        const flag = maxValue <= alphaOrigin ? FLAG_UPPER : maxValue >= beta ? FLAG_LOWER : FLAG_EXACT;
        // const flag = maxValue <= alpha ? FLAG_UPPER : maxValue >= beta ? FLAG_LOWER : FLAG_EXACT;
        this.transTable.set(hash, {value: maxValue, depth: depth, flag: flag});
        return maxValue;
    }

    public findBestMove(state: TGameState, player: number): TGameMove | null {
        var bestMove = null;
        var bestValue = -Infinity;
        var moves = this.getPossibleMoves(state);
        for (const move of moves) {
            this.makeMove(state, move);
            if (this.isTerminal(state)) {
                this.undoMove(state, move);
                return move;
            }
            const value = -this.negamax(state, this.lookAhead - 1, -Infinity, Infinity, -player);
            this.undoMove(state, move);
            if (value >= bestValue) {
                bestMove = move;
                bestValue = value;
            }
            // console.log(`|   move ${move}'s value = ` + value);
        }
        // console.log(`|   bestMove: ` + bestMove);

        return bestMove;
    }
}
