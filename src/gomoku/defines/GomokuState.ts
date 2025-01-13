export interface GomokuState {
    board: number[];            // 1D array board, each cell contains GomokoPieceType
    boardSize: number;          // If n x n board, boardSize = n
    currentPlayer: number;      // Player who move next
    lastMove: number;           // Last index (last move)
};
export type GomokuMove = number;
export type GomokuHash = number;
export type Vec2 = {x: number, y: number};

