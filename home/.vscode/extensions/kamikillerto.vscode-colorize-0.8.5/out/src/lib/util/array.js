"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function flatten(arr) {
    return Array.prototype.concat.apply([], arr);
}
exports.flatten = flatten;
function unique(arr, f) {
    let vArr = arr;
    if (f) {
        vArr = arr.map(f);
    }
    return arr.filter((_, i) => vArr.indexOf(vArr[i]) === i);
}
exports.unique = unique;
//# sourceMappingURL=array.js.map