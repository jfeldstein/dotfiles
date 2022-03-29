"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("./../color");
const color_extractor_1 = require("../color-extractor");
const color_util_1 = require("../../util/color-util");
const regexp_1 = require("../../util/regexp");
const R_HUE = `\\d*${regexp_1.DOT_VALUE}?`;
const R_SATURATION = `(?:\\d{1,3}${regexp_1.DOT_VALUE}?|${regexp_1.DOT_VALUE})%`;
const R_LUMINANCE = R_SATURATION;
exports.REGEXP = new RegExp(`((?:hsl\\(\\s*${R_HUE}\\s*,\\s*${R_SATURATION}\\s*,\\s*${R_LUMINANCE}\\s*\\))|(?:hsla\\(\\s*${R_HUE}\\s*,\\s*${R_SATURATION}\\s*,\\s*${R_LUMINANCE}\\s*,\\s*${regexp_1.ALPHA}\\s*\\)))${regexp_1.EOL}`, 'gi');
exports.REGEXP_ONE = new RegExp(`^((?:hsl\\(\\s*${R_HUE}\\s*,\\s*${R_SATURATION}\\s*,\\s*${R_LUMINANCE}\\s*\\))|(?:hsla\\(\\s*${R_HUE}\\s*,\\s*${R_SATURATION}\\s*,\\s*${R_LUMINANCE}\\s*,\\s*${regexp_1.ALPHA}\\s*\\)))${regexp_1.EOL}`, 'i');
// export const REGEXP_ONE = /^((?:hsl\(\d*\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\))|(?:hsla\(\d*\s*,\s*(?:\d{1,3}%\s*,\s*){2}(?:[0-1]|1\.0|[0](?:\.\d+){0,1}|(?:\.\d+))\)))(?:$|"|'|,| |;|\)|\r|\n)/i;
class HSLColorExtractor {
    constructor() {
        this.name = 'HSL';
    }
    generateColorFromMatch(match) {
        const [h, s, l, a] = this.extractHSLValue(match[0]);
        if (s <= 100 && l <= 100) {
            let [r, g, b] = color_util_1.convertHslaToRgba(h, s, l, a);
            return new color_1.default(match[1], match.index, [r, g, b]);
        }
        return null;
    }
    /**
     * @private
     * @param {any} value An hsl(a) color string (`hsl(10, 1%, 1%)`)
     * @returns {number[]} The colors h,s,l,a values
     *
     * @memberof HSLColorExtractor
     */
    extractHSLValue(value) {
        const [h, s, l, a] = value.replace(/hsl(a){0,1}\(/, '').replace(/\)/, '').replace(/%/g, '').split(/,/gi).map(c => parseFloat(c));
        return [h, s, l, a];
    }
    extractColors(fileLines) {
        return __awaiter(this, void 0, void 0, function* () {
            return fileLines.map(({ line, text }) => {
                let match = null;
                let colors = [];
                while ((match = exports.REGEXP.exec(text)) !== null) {
                    const color = this.generateColorFromMatch(match);
                    if (color !== null) {
                        colors.push(color);
                    }
                }
                return {
                    line,
                    colors
                };
            });
        });
    }
    extractColor(text) {
        let match = text.match(exports.REGEXP_ONE);
        if (match) {
            const color = this.generateColorFromMatch(match);
            if (color !== null) {
                return color;
            }
        }
        return null;
    }
}
color_extractor_1.default.registerStrategy(new HSLColorExtractor());
exports.default = HSLColorExtractor;
//# sourceMappingURL=hsl-strategy.js.map