export interface GomokuPattern {
    type: PatternType,
    piece: number,
    indeces: number[]
}

export enum PatternType {
    NONE = 0,
    OPEN_5,
    OPEN_4,
    OPEN_3,
    OPEN_2,
    BLOCKED_5,
    BLOCKED_4,
    BLOCKED_3,
    BLOCKED_2,
    OPEN_BROKEN_5,
    OPEN_BROKEN_4,
    OPEN_BROKEN_3,
    OPEN_BROKEN_2,
    BLOCKED_BROKEN_5,
    BLOCKED_BROKEN_4,
    BLOCKED_BROKEN_3,
    BLOCKED_BROKEN_2,
    CLOSED_5,
    CLOSED_4,
    CLOSED_3,
    CLOSED_2,
    OVER_5,
};

export enum PatternValue {
    EMPTY = 0x0,
    PIECE = 0x1,
    BLOCKER = 0x2,
    BOUND = 0x3
}

export const WinValue = 10000000;

// 1: piece, 2: block (enemy piece/bound), 0: empty cell
export const PatternMap = new Map<number, PatternType>([
    [0x1111111, PatternType.OVER_5],                // xxxxxxx
    [0x1111110, PatternType.OVER_5],                // xxxxxx_
    [0x1111112, PatternType.OVER_5],                // xxxxxxo
    [0x1111113, PatternType.OVER_5],                // xxxxxx#
    [0x0111111, PatternType.OVER_5],                // _xxxxxx
    [0x2111111, PatternType.OVER_5],                // oxxxxxx
    [0x3111111, PatternType.OVER_5],                // #xxxxxx

    [0x0111110, PatternType.OPEN_5],                // _xxxxx_
    [0x0111112, PatternType.BLOCKED_5],             // _xxxxxo
    [0x0111113, PatternType.BLOCKED_5],             // _xxxxx#
    [0x2111110, PatternType.BLOCKED_5],             // oxxxxx_
    [0x2111113, PatternType.BLOCKED_5],             // oxxxxx#
    [0x3111110, PatternType.BLOCKED_5],             // #xxxxx_
    [0x3111112, PatternType.BLOCKED_5],             // #xxxxxo
    [0x0111101, PatternType.OPEN_BROKEN_5],         // _xxxx_x
    [0x0111011, PatternType.OPEN_BROKEN_5],         // _xxx_xx
    [0x0110111, PatternType.OPEN_BROKEN_5],         // _xx_xxx
    [0x0101111, PatternType.OPEN_BROKEN_5],         // _x_xxxx
    [0x2111101, PatternType.BLOCKED_BROKEN_5],      // oxxxx_x
    [0x2111011, PatternType.BLOCKED_BROKEN_5],      // oxxx_xx
    [0x2110111, PatternType.BLOCKED_BROKEN_5],      // oxx_xxx
    [0x2101111, PatternType.BLOCKED_BROKEN_5],      // oxx_xxx
    [0x3111101, PatternType.BLOCKED_BROKEN_5],      // #xxxx_x
    [0x3111011, PatternType.BLOCKED_BROKEN_5],      // #xxx_xx
    [0x3110111, PatternType.BLOCKED_BROKEN_5],      // #xx_xxx
    [0x3101111, PatternType.BLOCKED_BROKEN_5],      // #xx_xxx
    [0x2111112, PatternType.CLOSED_5],              // oxxxxxo

    [0x0111100, PatternType.OPEN_4],                // _xxxx__
    [0x0111102, PatternType.OPEN_4],                // _xxxx_o
    [0x0111103, PatternType.OPEN_4],                // _xxxx_#
    [ 0x011112, PatternType.BLOCKED_4],             // _xxxxo
    [ 0x011113, PatternType.BLOCKED_4],             // _xxxx#
    [0x2111100, PatternType.BLOCKED_4],             // oxxxx__
    [0x3111100, PatternType.BLOCKED_4],             // #xxxx__
    [0x0111010, PatternType.OPEN_BROKEN_4],         // _xxx_x_
    [0x0110110, PatternType.OPEN_BROKEN_4],         // _xx_xx_
    [0x0101110, PatternType.OPEN_BROKEN_4],         // _x_xxx_
    [0x0111012, PatternType.BLOCKED_BROKEN_4],      // _xxx_xo
    [0x0111013, PatternType.BLOCKED_BROKEN_4],      // _xxx_x#
    [0x0110112, PatternType.BLOCKED_BROKEN_4],      // _xx_xxo
    [0x0110113, PatternType.BLOCKED_BROKEN_4],      // _xx_xx#
    [0x0101112, PatternType.BLOCKED_BROKEN_4],      // _x_xxxo
    [0x0101113, PatternType.BLOCKED_BROKEN_4],      // _x_xxx#
    [0x2111010, PatternType.BLOCKED_BROKEN_4],      // oxxx_x_
    [0x2110110, PatternType.BLOCKED_BROKEN_4],      // oxx_xx_
    [0x2101110, PatternType.BLOCKED_BROKEN_4],      // ox_xxx_
    [0x3111010, PatternType.BLOCKED_BROKEN_4],      // #xxx_x_
    [0x3110110, PatternType.BLOCKED_BROKEN_4],      // #xx_xx_
    [0x3101110, PatternType.BLOCKED_BROKEN_4],      // #x_xxx_
    [0x3111012, PatternType.BLOCKED_BROKEN_4],      // #xxx_xo
    [0x2111013, PatternType.BLOCKED_BROKEN_4],      // oxxx_x#
    [0x3110112, PatternType.BLOCKED_BROKEN_4],      // #xx_xxo
    [0x2110113, PatternType.BLOCKED_BROKEN_4],      // oxx_xx#
    [0x3101112, PatternType.BLOCKED_BROKEN_4],      // #x_xxxo
    [0x2101113, PatternType.BLOCKED_BROKEN_4],      // ox_xxx#
    [0x3101112, PatternType.BLOCKED_BROKEN_4],      // #x_xxxo
    [0x2101113, PatternType.BLOCKED_BROKEN_4],      // ox_xxx#
    [0x3111102, PatternType.BLOCKED_BROKEN_4],      // #xxxx_o
    [0x2111103, PatternType.BLOCKED_BROKEN_4],      // oxxxx_#
    [0x2011112, PatternType.CLOSED_4],              // o_xxxxo
    [0x2101112, PatternType.CLOSED_4],              // ox_xxxo
    [0x2110112, PatternType.CLOSED_4],              // oxx_xxo
    [0x2111012, PatternType.CLOSED_4],              // oxxx_xo
    [0x2111102, PatternType.CLOSED_4],              // oxxxx_o
    [ 0x211112, PatternType.CLOSED_4],              // oxxxxo
    [ 0x311112, PatternType.CLOSED_4],              // #xxxxo
    [ 0x211113, PatternType.CLOSED_4],              // oxxxx#

    [ 0x011100, PatternType.OPEN_3],                // _xxx__ 
    [ 0x011102, PatternType.BLOCKED_3],             // _xxx_o
    [  0x01112, PatternType.BLOCKED_3],             // _xxxo
    [ 0x011103, PatternType.BLOCKED_3],             // _xxx_#
    [  0x01113, PatternType.BLOCKED_3],             // _xxx#
    [ 0x211100, PatternType.BLOCKED_3],             // oxxx__
    [ 0x311100, PatternType.BLOCKED_3],             // #xxx__
    [ 0x011010, PatternType.OPEN_BROKEN_3],         // _xx_x_
    [ 0x010110, PatternType.OPEN_BROKEN_3],         // _x_xx_
    [ 0x011012, PatternType.BLOCKED_BROKEN_3],      // _xx_xo
    [ 0x010112, PatternType.BLOCKED_BROKEN_3],      // _x_xxo
    [ 0x011013, PatternType.BLOCKED_BROKEN_3],      // _xx_x#
    [ 0x010113, PatternType.BLOCKED_BROKEN_3],      // _x_xx#
    [ 0x211010, PatternType.BLOCKED_BROKEN_3],      // oxx_x_
    [ 0x210110, PatternType.BLOCKED_BROKEN_3],      // ox_xx_
    [ 0x210110, PatternType.BLOCKED_BROKEN_3],      // ox_xx_
    [ 0x311010, PatternType.BLOCKED_BROKEN_3],      // #xx_x_
    [ 0x310110, PatternType.BLOCKED_BROKEN_3],      // #x_xx_
    [ 0x310110, PatternType.BLOCKED_BROKEN_3],      // #x_xx_
    [ 0x201112, PatternType.CLOSED_3],              // o_xxxo
    [ 0x301112, PatternType.CLOSED_3],              // #_xxxo
    [ 0x201113, PatternType.CLOSED_3],              // o_xxx#
    [ 0x210112, PatternType.CLOSED_3],              // ox_xxo
    [ 0x310112, PatternType.CLOSED_3],              // #x_xxo
    [ 0x210113, PatternType.CLOSED_3],              // ox_xx#
    [ 0x210112, PatternType.CLOSED_3],              // oxx_xo
    [ 0x310112, PatternType.CLOSED_3],              // #xx_xo
    [ 0x210113, PatternType.CLOSED_3],              // oxx_x#
    [ 0x211102, PatternType.CLOSED_3],              // oxxx_o
    [ 0x311102, PatternType.CLOSED_3],              // #xxx_o
    [ 0x211103, PatternType.CLOSED_3],              // oxxx_#
    [  0x21112, PatternType.CLOSED_3],              // oxxxo
    [  0x31112, PatternType.CLOSED_3],              // #xxxo
    [  0x21113, PatternType.CLOSED_3],              // oxxx#

    [  0x01100, PatternType.OPEN_2],                // _xx__
    [  0x01102, PatternType.OPEN_2],                // _xx_o
    [  0x01103, PatternType.OPEN_2],                // _xx_#
    [   0x0112, PatternType.BLOCKED_2],             // _xxo
    [   0x0113, PatternType.BLOCKED_2],             // _xx#
    [  0x21100, PatternType.BLOCKED_2],             // oxx__
    [  0x31100, PatternType.BLOCKED_2],             // #xx__
    [  0x01010, PatternType.OPEN_BROKEN_2],         // _x_x_
    [  0x01012, PatternType.BLOCKED_BROKEN_2],      // _x_xo
    [  0x01013, PatternType.BLOCKED_BROKEN_2],      // _x_x#
    [  0x21010, PatternType.BLOCKED_BROKEN_2],      // ox_x_
    [  0x31010, PatternType.BLOCKED_BROKEN_2],      // #x_x_
    [  0x21102, PatternType.CLOSED_2],              // oxx_o
    [  0x31102, PatternType.CLOSED_2],              // #xx_o
    [  0x21103, PatternType.CLOSED_2],              // oxx_#
    [  0x30112, PatternType.CLOSED_2],              // #_xxo
    [  0x20113, PatternType.CLOSED_2],              // o_xx#
    [  0x21012, PatternType.CLOSED_2],              // ox_xo
    [  0x31012, PatternType.CLOSED_2],              // #x_xo
    [  0x21013, PatternType.CLOSED_2],              // ox_x#
    [   0x2112, PatternType.CLOSED_2],              // oxxo
    [   0x3112, PatternType.CLOSED_2],              // #xxo
    [   0x2113, PatternType.CLOSED_2],              // oxx#
]);

export const DefaultPatternValueMap = new Map<PatternType, number>([
    [PatternType.OVER_5,                WinValue],
    [PatternType.OPEN_5,                WinValue],
    [PatternType.BLOCKED_5,             WinValue],
    [PatternType.OPEN_4,                    5000],
    [PatternType.BLOCKED_BROKEN_5,          2000],
    [PatternType.OPEN_BROKEN_5,             2000],
    [PatternType.BLOCKED_4,                  500],
    [PatternType.OPEN_BROKEN_4,              500],
    [PatternType.BLOCKED_BROKEN_4,           500],
    [PatternType.OPEN_BROKEN_3,              500],
    [PatternType.OPEN_3,                     500],
    [PatternType.BLOCKED_3,                   40],
    [PatternType.BLOCKED_BROKEN_3,            40],
    [PatternType.OPEN_2,                      20],
    [PatternType.OPEN_BROKEN_2,               20],
    [PatternType.BLOCKED_2,                    5],
    [PatternType.BLOCKED_BROKEN_2,             5],
    [PatternType.CLOSED_5,                     0],
    [PatternType.CLOSED_4,                     0],
    [PatternType.CLOSED_3,                     0],
    [PatternType.CLOSED_2,                     0],
]);

// Threat level 1 means need only 1 move to win
// Threat level 2 means need 2 move to win
export const PatternToThreatLevel = new Map<PatternType, number>([
    [PatternType.OPEN_4, 1],
    [PatternType.BLOCKED_4, 1],
    [PatternType.OPEN_BROKEN_4, 1],
    [PatternType.BLOCKED_BROKEN_4, 1],
    [PatternType.OPEN_BROKEN_5, 1],
    [PatternType.BLOCKED_BROKEN_5, 1],
    [PatternType.OPEN_3, 2],
    [PatternType.OPEN_BROKEN_3, 2],
]);
