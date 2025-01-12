export interface GomokuState {
    board: number[];
    boardSize: number;
    currentPlayer: number;
    lastMove: number;
};
export type GomokuMove = number;
export type GomokuHash = number;
export type Vec2 = {x: number, y: number};

