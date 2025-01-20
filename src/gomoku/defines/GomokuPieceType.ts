export enum GomokuPieceType {
    EMPTY = 0,      // Empty cell
    MIN = -1,       // Second player
    MAX = 1,        // First player
    BLOCKER = 3     // Block cell (skill objects, init blocker, etc.) --> Cell that player can not place anything
}
