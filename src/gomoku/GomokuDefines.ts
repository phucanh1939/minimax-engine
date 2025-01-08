export interface GomokuState {
    board: number[];
    boardSize: number;
    currentPlayer: number;
};

export type GomokuMove = number;

export class GomokuConstant {
    public static readonly WINING_LENGTH = 5;
    public static readonly NEIGHBOR_RANGE = 2;

    public static readonly DIRECTION_LEFT = { x: -1, y: 0 };
    public static readonly DIRECTION_RIGHT = { x: 1, y: 0 };
    public static readonly DIRECTION_TOP = { x: 0, y: 1 };
    public static readonly DIRECTION_BOT = { x: 0, y: -1 };
    public static readonly DIRECTION_BOT_LEFT = { x: -1, y: -1 };
    public static readonly DIRECTION_BOT_RIGHT = { x: 1, y: -1 };
    public static readonly DIRECTION_TOP_LEFT = { x: -1, y: 1 };
    public static readonly DIRECTION_TOP_RIGHT = { x: 1, y: 1 };

    public static readonly DIRECTIONS_8 = [
        GomokuConstant.DIRECTION_LEFT,
        GomokuConstant.DIRECTION_RIGHT,
        GomokuConstant.DIRECTION_TOP,
        GomokuConstant.DIRECTION_BOT,
        GomokuConstant.DIRECTION_BOT_LEFT,
        GomokuConstant.DIRECTION_BOT_RIGHT,
        GomokuConstant.DIRECTION_TOP_LEFT,
        GomokuConstant.DIRECTION_TOP_RIGHT
    ];

    public static readonly DIRECTIONS_4 = [
        GomokuConstant.DIRECTION_RIGHT,
        GomokuConstant.DIRECTION_TOP,
        GomokuConstant.DIRECTION_TOP_LEFT,
        GomokuConstant.DIRECTION_TOP_RIGHT
    ];
}