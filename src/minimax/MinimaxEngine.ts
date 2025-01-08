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
    public abstract makeMove(state: TGameState, move: TGameMove): void;
    public abstract undoMove(state: TGameState, move: TGameMove): void;

    public negamax(state: TGameState, depth: number, alpha: number, beta: number, color: number): number {
        // Save alpha
        const alphaOrigin = alpha;

        // Check cache
        var hash = this.getStateHash(state);
        var entry = this.transTable.get(hash);
        if (entry && entry.depth >= depth) {
            if (entry.flag == FLAG_EXACT)
                return entry.value;
            else if (entry.flag == FLAG_LOWER)
                alpha = Math.max(alpha, entry.value);
            else if (entry.flag == FLAG_UPPER)
                beta = Math.min(beta, entry.value);
            
            if (alpha >= beta)
                return entry.value;
        }

        // Check for leaf
        if (depth == 0 || this.isTerminal(state))
            return color * this.evaluate(state);

        // Calculate for child nodes
        const moves = this.getPossibleMoves(state);
        var value = -Infinity;
        for (const move of moves) {
            this.makeMove(state, move);
            value = Math.max(value, -this.negamax(state, depth - 1, -beta, -alpha, -color));
            this.undoMove(state, move);
            alpha = Math.max(alpha, value);
            if (alpha >= beta) break;
        }

        // Update cache table
        var flag = FLAG_EXACT;
        if (value <= alphaOrigin)
            flag = FLAG_UPPER;
        else if (value >= beta)
            flag = FLAG_LOWER;
        this.transTable.set(hash, {
            value: value,
            flag: flag,
            depth: depth
        });

        return value;
    }

    public findBestMove(state: TGameState, color: number): TGameMove | null {
        var bestMove = null;
        var bestValue = -Infinity;
        var moves = this.getPossibleMoves(state);
        for (const move of moves) {
            this.makeMove(state, move);
            const value = -this.negamax(state, this.lookAhead - 1, -Infinity, Infinity, -color);
            this.undoMove(state, move);
            if (value > bestValue) {
                bestMove = move;
                bestValue = value;
            }
            console.log(`|   move ${move}'s value = ` + value);
        }
        return bestMove;
    }
}
