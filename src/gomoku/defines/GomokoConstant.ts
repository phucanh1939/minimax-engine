export const WinningCount = 5;

export const FourDirections = [
    {x:  1, y:  0}, // horizontal
    {x:  0, y:  1}, // vertical
    {x:  1, y:  1}, // top-right
    {x: -1, y:  1}, // top-left
];

export const EightDirections = [
    {x:  1, y:  0}, // right
    {x: -1, y:  0}, // left
    {x:  0, y:  1}, // top
    {x:  0, y: -1}, // bot
    {x:  1, y:  1}, // top-right
    {x: -1, y: -1}, // bot-left
    {x: -1, y:  1}, // top-left
    {x:  1, y: -1}, // bot-left
];
