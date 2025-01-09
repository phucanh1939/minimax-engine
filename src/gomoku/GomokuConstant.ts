import { WINNING_COUNT } from "./GomokuEngine";

export interface GomokuPattern { name: string, mask: number, value: number };

export class GomokuConstant {
    public static readonly PATTERNS = [
        { name: "blocked_2", mask: 1<<0, value: 3 },
        { name: "open_2", mask: 1<<1, value: 5 },
        { name: "blocked_2x", mask: 1<<2, value: 5 },
        { name: "open_2x", mask: 1<<3, value: 10 },

        { name: "blocked_3", mask: 1<<4, value: 5 },
        { name: "open_3", mask: 1<<5, value: 330 },
        { name: "blocked_3x", mask: 1<<6, value: 300 },
        { name: "open_3x", mask: 1<<7, value: 5000 },
        
        { name: "blocked_4", mask: 1<<8, value: 250 },
        { name: "open_4", mask: 1<<9, value: 2500 },
        { name: "blocked_4x", mask: 1<<10, value: 10000 },
        { name: "open_4x", mask: 1<<11, value: 20000 },
        
        { name: "blocked_5", mask: 1<<12, value: Infinity },
        { name: "open_5", mask: 1<<13, value: Infinity },
        { name: "blocked_5x", mask: 1<<14, value: Infinity },
        { name: "open_5x", mask: 1<<15, value: Infinity },
    ];

    public static readonly PATTERN_BLOCKED_3 = 1<<4;
    public static readonly PATTERN_OPEN_3 = 1<<5;
    public static readonly PATTERN_BLOCKED_3X = 1<<6;
    public static readonly PATTERN_OPEN_3X = 1<<7;

    public static readonly PATTERN_BLOCKED_4 = 1<<8;
    public static readonly PATTERN_OPEN_4 = 1<<9;
    public static readonly PATTERN_BLOCKED_4X = 1<<10;
    public static readonly PATTERN_OPEN_4X = 1<<11;

    public static readonly PATTERN_OPEN_3_X_BLOCKED_4 = this.PATTERN_OPEN_3 | this.PATTERN_BLOCKED_4;

    public static getMaskValue(mask: number): number {
        // READ the PARTTERNS, find masks that this mask matched, calculate sum of value of these masks
        // Ex. mask = 6 = 110 => matched match is 010 (open 4) and 100 (open 3) => sum is  250 + 35
        var sign = 1;
        if (mask < 0) {
            sign = -1;
            mask = -mask;
        }

        var totalValue = 0;
        for (const pattern of GomokuConstant.PATTERNS) {
            if ((mask & pattern.mask) !== 0) {
                totalValue += pattern.value;
            }
        }

        return totalValue * sign;
    }

    public static getPattern(count: number, isLeftBlocked: boolean, isRightBlocked: boolean, isLeftBounded: boolean, isRightBounded: boolean): GomokuPattern | null {
        var bothBlocked = isLeftBlocked && isRightBlocked;
        var bothBlockedOrBounded = (isLeftBlocked || isLeftBounded) && (isRightBlocked || isRightBounded);
        if (bothBlocked && count < WINNING_COUNT && bothBlockedOrBounded) return null;
        if (bothBlocked && count >= WINNING_COUNT) return null; // For case 5 but block with out ofBounds => still a blocked 5 parttern => still a win
        var isBlocked = isLeftBlocked || isRightBlocked;
        var col = isBlocked ? 0 : 1;
        var row = count - 2;
        var index = row * 4 + col;
        return index >= 0 && index < this.PATTERNS.length ? this.PATTERNS[index] : null;
    }

    public static isWin(pattern: GomokuPattern): boolean {
        return pattern.value === Infinity;
    }

    public static getPatternByMask(mask: number) {
        return this.PATTERNS.find(p => p.mask === mask);
    }

    public static getMultiMaskPattern(mask: number): number {
        var index = this.PATTERNS.findIndex(p => p.mask === mask);
        if (index < 0) return 0;
        var targetIndex = index + 2;
        if (targetIndex >= this.PATTERNS.length) return 0;
        return this.PATTERNS[targetIndex].mask;
    }
};