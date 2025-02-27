const fs = require('fs');
const middle_patterns = [
    "xxxxx", 
    "_xxxx", 
    "x_xxx", 
    "xx_xx", 
    "xxx_x", 
    "xxxx_",

    "xxxx",
    "_xxx",
    "x_xx",
    "xx_x",
    "xxx_",

    "xxx",
    "_xx",
    "x_x",
    "xx_",

    "xx",
    "_x",
    "x_",
];

const pattern_formats = [
    "_<middle>_", "_<middle>x", "_<middle>o", "_<middle>#",
    "x<middle>_", "x<middle>x", "x<middle>o", "x<middle>#",
    "o<middle>_", "o<middle>x", "o<middle>o", "o<middle>#",
    "#<middle>_", "#<middle>x", "#<middle>o", "#<middle>#",
];

const max_middle_length = 5;

const charToHex = { '_': 0, 'x': 1, 'o': 2, '#': 3 };

const generatePatterns = (middlePatterns, formats) => {
    let allPatterns = [];
    
    for (let format of formats) {
        for (let middle of middlePatterns) {
            let pattern = format.replace("<middle>", middle);
            let hexValue = '0x' + pattern.split('').map(char => charToHex[char]).join('');
            let padding = middle.length >= max_middle_length ? '' : ' '.repeat(max_middle_length - middle.length);
            allPatterns.push(`/* ${pattern} */${padding} [${hexValue}, PatternType.TEMPLATE]`);
        }
    }
    
    return allPatterns;
};

const patterns = generatePatterns(middle_patterns, pattern_formats);
const resultText = "export const PatternMap = new Map<number, PatternType>([\n" + patterns.join(',\n') + "\n]);";
console.log(resultText);

fs.writeFileSync('patterns.js', resultText);
console.log("Patterns saved to patterns.js");
