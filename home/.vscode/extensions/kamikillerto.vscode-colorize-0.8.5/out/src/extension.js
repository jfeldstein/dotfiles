'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
const color_util_1 = require("./lib/util/color-util");
const queue_1 = require("./lib/queue");
const variables_manager_1 = require("./lib/variables/variables-manager");
const cache_manager_1 = require("./lib/cache-manager");
const editor_manager_1 = require("./lib/editor-manager");
const array_1 = require("./lib/util/array");
const globToRegexp = require("glob-to-regexp");
let config = {
    languages: [],
    filesExtensions: [],
    isHideCurrentLineDecorations: true,
    colorizedVariables: [],
    colorizedColors: [],
    filesToExcludes: [],
    filesToIncludes: [],
    inferedFilesToInclude: [],
    searchVariables: false
};
let extension = {
    editor: vscode_1.window.activeTextEditor,
    nbLine: 0,
    deco: new Map(),
    currentSelection: null
};
const q = new queue_1.default();
// Return all map's keys in an array
function mapKeysToArray(map) {
    return Array.from(map.keys());
}
// Generate a TextDocumentContentChangeEvent like object for one line
function generateTextDocumentContentChange(line, text) {
    return {
        rangeLength: 0,
        text: text,
        range: new vscode_1.Range(new vscode_1.Position(line, 0), new vscode_1.Position(line, text.length))
    };
}
// Split the TextDocumentContentChangeEvent into multiple line if the added text contain multiple lines
// example :
//  let editedLine = [{
//  rangeLength: 0,
//  text: 'a\nb\nc\n',
//  range: {start:{line:1}, end:{line:1}}
// }]
// became
//  let editedLine = [{
//  rangeLength: 0,
//  text: 'a',
//  range: {start:{line:1,/*...*/}, end:{line:1,/*...*/}}
// }, {
//  rangeLength: 0,
//  text: 'b',
//  range: {start:{line:2,/*...*/}, end:{line:2,/*...*/}}
// }, {
//  rangeLength: 0,
//  text: 'c',
//  range: {start:{line:3,/*...*/}, end:{line:3,/*...*/}}
// }, {
//  rangeLength: 0,
//  text: '',
//  range: {start:{line:4,/*...*/}, end:{line:4,/*...*/}}
// }]
//
function mutEditedLIne(editedLine) {
    let newEditedLine = [];
    let startLine = 0;
    let before = 0;
    editedLine.reverse();
    editedLine.forEach(line => {
        let a = line.text.match(/\n/g);
        startLine = line.range.start.line + before;
        line.text.split(/\n/).map((text, i, array) => {
            if (i === 0 && text === '' && array.length === 1) {
                startLine++;
            }
            else {
                newEditedLine.push(generateTextDocumentContentChange(startLine++, text));
            }
            before++;
        });
        before--;
    });
    return newEditedLine;
}
function updatePositionsDeletion(range, positions) {
    let rangeLength = range.end.line - range.start.line;
    positions.forEach(position => {
        if (position.newPosition === null) {
            return;
        }
        if (position.oldPosition > range.start.line && position.oldPosition <= range.end.line) {
            position.newPosition = null;
            return;
        }
        if (position.oldPosition >= range.end.line) {
            position.newPosition = position.newPosition - rangeLength;
        }
        if (position.newPosition < 0) {
            position.newPosition = 0;
        }
    });
    return positions;
}
function handleLineRemoved(editedLine, positions, context) {
    editedLine.reverse();
    editedLine.forEach((line) => {
        for (let i = line.range.start.line; i <= line.range.end.line; i++) {
            // ?
            // for (let i = line.range.start.line; i <= context.editor.document.lineCount; i++) {
            variables_manager_1.default.deleteVariableInLine(extension.editor.document.fileName, i);
        }
        positions = updatePositionsDeletion(line.range, positions);
    });
    return editedLine;
}
function handleLineAdded(editedLine, position, context) {
    editedLine = mutEditedLIne(editedLine);
    editedLine.forEach((line) => {
        position.forEach(position => {
            if (position.newPosition >= line.range.start.line) {
                position.newPosition = position.newPosition + 1;
            }
        });
    });
    return editedLine;
}
function filterPositions(position, deco, diffLine) {
    if (position.newPosition === null) {
        deco.get(position.oldPosition).forEach(decoration => decoration.dispose());
        return false;
    }
    if (position.newPosition === 0 && extension.editor.document.lineCount === 1 && extension.editor.document.lineAt(0).text === '') {
        deco.get(position.oldPosition).forEach(decoration => decoration.dispose());
        return false;
    }
    if (Math.abs(position.oldPosition - position.newPosition) > Math.abs(diffLine)) {
        position.newPosition = position.oldPosition + diffLine;
    }
    return true;
}
function handleLineDiff(editedLine, context, diffLine) {
    let positions = mapKeysToArray(context.deco).map(position => Object({
        oldPosition: position,
        newPosition: position
    }));
    if (diffLine < 0) {
        editedLine = handleLineRemoved(editedLine, positions, context);
    }
    else {
        editedLine = handleLineAdded(editedLine, positions, context);
    }
    positions = positions.filter(position => filterPositions(position, context.deco, diffLine));
    context.deco = positions.reduce((decorations, position) => {
        if (decorations.has(position.newPosition)) {
            return decorations.set(position.newPosition, decorations.get(position.newPosition).concat(context.deco.get(position.oldPosition)));
        }
        return decorations.set(position.newPosition, context.deco.get(position.oldPosition));
    }, new Map());
    return editedLine;
}
function updateDecorations(editedLine, context, cb) {
    let diffLine = context.editor.document.lineCount - context.nbLine;
    let positions;
    if (diffLine !== 0) {
        editedLine = handleLineDiff(editedLine, context, diffLine);
        context.nbLine = context.editor.document.lineCount;
    }
    checkDecorationForUpdate(editedLine, context, cb);
}
function updateContextDecorations(decorations, context) {
    let it = decorations.entries();
    let tmp = it.next();
    while (!tmp.done) {
        let line = tmp.value[0];
        if (context.deco.has(line)) {
            context.deco.set(line, context.deco.get(line).concat(decorations.get(line)));
        }
        else {
            context.deco.set(line, decorations.get(line));
        }
        tmp = it.next();
    }
}
function removeDuplicateDecorations(context) {
    let it = context.deco.entries();
    let m = new Map();
    let tmp = it.next();
    while (!tmp.done) {
        let line = tmp.value[0];
        let decorations = tmp.value[1];
        let newDecorations = [];
        decorations.forEach((deco, i) => {
            deco.generateRange(line);
            const exist = newDecorations.findIndex((_) => deco.currentRange.isEqual(_.currentRange));
            if (exist !== -1) {
                newDecorations[exist].dispose();
                newDecorations = newDecorations.filter((_, i) => i === exist);
            }
            newDecorations.push(deco);
        });
        m.set(line, newDecorations);
        tmp = it.next();
    }
    context.deco = m;
}
function checkDecorationForUpdate(editedLine, context, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        const text = context.editor.document.getText().split(/\n/);
        const fileLines = editedLine.map(({ range }) => {
            const line = range.start.line;
            if (context.deco.has(line)) {
                context.deco.get(line).forEach(decoration => {
                    decoration.dispose();
                });
            }
            return { line, text: text[line] };
        });
        try {
            let variables = [];
            const lines = color_util_1.default.textToFileLines(context.editor.document.getText());
            variables_manager_1.default.removeVariablesDeclarations(context.editor.document.fileName);
            yield variables_manager_1.default.findVariablesDeclarations(context.editor.document.fileName, lines);
            variables = yield variables_manager_1.default.findVariables(context.editor.document.fileName, lines);
            const colors = yield color_util_1.default.findColors(fileLines, context.editor.document.fileName);
            const decorations = generateDecorations(colors, variables, new Map());
            removeDuplicateDecorations(context);
            editor_manager_1.default.decorate(context.editor, decorations, context.currentSelection);
            updateContextDecorations(decorations, context);
            removeDuplicateDecorations(context);
        }
        catch (error) {
        }
        return cb();
    });
}
function initDecorations(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!context.editor) {
            return;
        }
        let text = context.editor.document.getText();
        const fileLines = color_util_1.default.textToFileLines(text);
        // removeDuplicateDecorations(context);
        yield variables_manager_1.default.findVariablesDeclarations(context.editor.document.fileName, fileLines);
        let variables = yield variables_manager_1.default.findVariables(context.editor.document.fileName, fileLines);
        const colors = yield color_util_1.default.findColors(fileLines);
        generateDecorations(colors, variables, context.deco);
        return editor_manager_1.default.decorate(context.editor, context.deco, context.currentSelection);
    });
}
function updateDecorationMap(map, line, decoration) {
    if (map.has(line)) {
        map.set(line, map.get(line).concat([decoration]));
    }
    else {
        map.set(line, [decoration]);
    }
}
function generateDecorations(colors, variables, decorations) {
    colors.map(({ line, colors }) => colors.forEach((color) => {
        const decoration = color_util_1.default.generateDecoration(color);
        updateDecorationMap(decorations, line, decoration);
    }));
    variables.map(({ line, colors }) => colors.forEach((variable) => {
        const decoration = variables_manager_1.default.generateDecoration(variable, line);
        updateDecorationMap(decorations, line, decoration);
    }));
    return decorations;
}
/**
 * Check if COLORIZE support a language
 *
 * @param {string} languageId A valid languageId
 * @returns {boolean}
 */
function isLanguageSupported(languageId) {
    return config.languages.indexOf(languageId) !== -1;
}
/**
 * Check if COLORIZE support a file extension
 *
 * @param {string} fileName A valid filename (path to the file)
 * @returns {boolean}
 */
function isFileExtensionSupported(fileName) {
    return config.filesExtensions.some((ext) => ext.test(fileName));
}
/**
 * Check if the file is the `colorize.include` setting
 *
 * @param {string} fileName A valid filename (path to the file)
 * @returns {boolean}
 */
function isIncludedFile(fileName) {
    return config.filesToIncludes.find((globPattern) => globToRegexp(globPattern).test(fileName)) !== undefined;
}
/**
 * Check if a file can be colorized by COLORIZE
 *
 * @param {TextDocument} document The document to test
 * @returns {boolean}
 */
function canColorize(document) {
    return isLanguageSupported(document.languageId) || isFileExtensionSupported(document.fileName) || isIncludedFile(document.fileName);
}
exports.canColorize = canColorize;
function handleTextSelectionChange(event, cb) {
    if (!config.isHideCurrentLineDecorations || event.textEditor !== extension.editor) {
        return cb();
    }
    if (extension.currentSelection.length !== 0) {
        extension.currentSelection.forEach(line => {
            const decorations = extension.deco.get(line);
            if (decorations !== undefined) {
                editor_manager_1.default.decorateOneLine(extension.editor, decorations, line);
            }
        });
    }
    extension.currentSelection = [];
    event.selections.forEach((selection) => {
        let decorations = extension.deco.get(selection.active.line);
        if (decorations) {
            decorations.forEach(_ => _.hide());
        }
    });
    extension.currentSelection = event.selections.map((selection) => selection.active.line);
    return cb();
}
function handleCloseOpen(document) {
    q.push((cb) => {
        if (extension.editor && extension.editor.document.fileName === document.fileName) {
            cache_manager_1.default.saveDecorations(document, extension.deco);
            return cb();
        }
        return cb();
    });
}
function colorize(editor, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        extension.editor = null;
        extension.deco = new Map();
        if (!editor || !canColorize(editor.document)) {
            return cb();
        }
        extension.editor = editor;
        extension.currentSelection = editor.selections.map((selection) => selection.active.line);
        const deco = cache_manager_1.default.getCachedDecorations(editor.document);
        if (deco) {
            extension.deco = deco;
            extension.nbLine = editor.document.lineCount;
            editor_manager_1.default.decorate(extension.editor, extension.deco, extension.currentSelection);
        }
        else {
            extension.nbLine = editor.document.lineCount;
            try {
                yield initDecorations(extension);
            }
            finally {
                cache_manager_1.default.saveDecorations(extension.editor.document, extension.deco);
            }
        }
        return cb();
    });
}
function handleChangeActiveTextEditor(editor) {
    if (extension.editor !== undefined && extension.editor !== null) {
        extension.deco.forEach(decorations => decorations.forEach(deco => deco.hide()));
        cache_manager_1.default.saveDecorations(extension.editor.document, extension.deco);
    }
    vscode_1.window.visibleTextEditors.filter(e => e !== editor).forEach(e => {
        q.push(cb => colorize(e, cb));
    });
    q.push(cb => colorize(editor, cb));
}
function cleanDecorationList(context, cb) {
    let it = context.deco.entries();
    let tmp = it.next();
    while (!tmp.done) {
        let line = tmp.value[0];
        let decorations = tmp.value[1];
        context.deco.set(line, decorations.filter(decoration => !decoration.disposed));
        tmp = it.next();
    }
    return cb();
}
function handleChangeTextDocument(event) {
    if (extension.editor && event.document.fileName === extension.editor.document.fileName) {
        extension.editor = vscode_1.window.activeTextEditor;
        q.push((cb) => updateDecorations(event.contentChanges, extension, cb));
        q.push((cb) => cleanDecorationList(extension, cb));
    }
}
function clearCache() {
    extension.deco.clear();
    extension.deco = new Map();
    cache_manager_1.default.clearCache();
}
function handleConfigurationChanged() {
    const newConfig = readConfiguration();
    clearCache();
    // delete current decorations then regenerate decorations
    color_util_1.default.setupColorsExtractors(newConfig.colorizedColors);
    q.push((cb) => __awaiter(this, void 0, void 0, function* () {
        // remove event listeners?
        variables_manager_1.default.setupVariablesExtractors(newConfig.colorizedVariables);
        if (newConfig.searchVariables) {
            yield variables_manager_1.default.getWorkspaceVariables(newConfig.filesToIncludes.concat(newConfig.inferedFilesToInclude), newConfig.filesToExcludes); // 👍
        }
        return cb();
    }));
    config = newConfig;
    colorizeVisibleTextEditors();
}
function initEventListeners(context) {
    vscode_1.window.onDidChangeTextEditorSelection((event) => q.push((cb) => handleTextSelectionChange(event, cb)), null, context.subscriptions);
    vscode_1.workspace.onDidCloseTextDocument(handleCloseOpen, null, context.subscriptions);
    vscode_1.workspace.onDidSaveTextDocument(handleCloseOpen, null, context.subscriptions);
    vscode_1.window.onDidChangeActiveTextEditor(handleChangeActiveTextEditor, null, context.subscriptions);
    vscode_1.workspace.onDidChangeTextDocument(handleChangeTextDocument, null, context.subscriptions);
    vscode_1.workspace.onDidChangeConfiguration(handleConfigurationChanged, null, context.subscriptions);
}
function inferFilesToInclude(languagesConfig, filesExtensionsConfig) {
    let ext = vscode_1.extensions.all;
    let filesExtensions = [];
    ext.forEach(extension => {
        if (extension.packageJSON && extension.packageJSON.contributes && extension.packageJSON.contributes.languages) {
            extension.packageJSON.contributes.languages.forEach(language => {
                if (languagesConfig.indexOf(language.id) !== -1) {
                    filesExtensions = filesExtensions.concat(language.extensions);
                }
            });
        }
    });
    filesExtensions = array_1.flatten(filesExtensions); // get all languages with their files extensions ^^. Now need to filter with the one set in config
    filesExtensions = filesExtensions.concat(filesExtensionsConfig);
    return array_1.unique(filesExtensions);
}
function displayVariablesSearchMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode_1.workspace.getConfiguration('colorize');
        const ignoreMessage = config.get('ignore_search_variables_info');
        const searchVariables = config.get('enable_search_variables');
        if (ignoreMessage === false && searchVariables === true) {
            // const updateSetting = 'Update setting';
            const neverShowAgain = 'Don\'t Show Again';
            const choice = yield vscode_1.window.showWarningMessage('You\'re experiencing some slowing down when vscode start ? You might need to update your settings for colorize, you can learn more about it [here](https://github.com/KamiKillertO/vscode-colorize/issues/174).', 
            // updateSetting,
            neverShowAgain);
            /* if (choice === updateSetting) {
              commands.executeCommand('workbench.action.openSettings2');
            } else */
            if (choice === neverShowAgain) {
                yield config.update('ignore_search_variables_info', true, true);
            }
        }
    });
}
function displayFilesExtensionsDeprecationWarning(filesExtensionsConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode_1.workspace.getConfiguration('colorize');
        const ignoreWarning = config.get('ignore_files_extensions_deprecation');
        if (filesExtensionsConfig.length > 0 && ignoreWarning === false) {
            const updateSetting = 'Update setting';
            const neverShowAgain = 'Don\'t Show Again';
            const choice = yield vscode_1.window.showWarningMessage('You\'re using the `colorize.files_extensions` settings. This settings as been deprecated in favor of `colorize.include`', updateSetting, neverShowAgain);
            if (choice === updateSetting) {
                vscode_1.commands.executeCommand('workbench.action.openSettings2');
            }
            else if (choice === neverShowAgain) {
                yield config.update('ignore_files_extensions_deprecation', true, true);
            }
        }
    });
}
function readConfiguration() {
    const configuration = vscode_1.workspace.getConfiguration('colorize');
    // remove duplicates (if duplicates)
    const colorizedVariables = Array.from(new Set(configuration.get('colorized_variables', []))); // [...new Set(array)] // works too
    const colorizedColors = Array.from(new Set(configuration.get('colorized_colors', []))); // [...new Set(array)] // works too
    const filesExtensions = configuration.get('files_extensions', []);
    displayFilesExtensionsDeprecationWarning(filesExtensions);
    displayVariablesSearchMessage();
    const languages = configuration.get('languages', []);
    const inferedFilesToInclude = inferFilesToInclude(languages, filesExtensions).map(extension => `**/*${extension}`);
    const filesToIncludes = Array.from(new Set(configuration.get('include', [])));
    const filesToExcludes = Array.from(new Set(configuration.get('exclude', [])));
    const searchVariables = configuration.get('enable_search_variables', false);
    return {
        languages,
        filesExtensions: filesExtensions.map(ext => RegExp(`\\${ext}$`)),
        isHideCurrentLineDecorations: configuration.get('hide_current_line_decorations'),
        colorizedColors,
        colorizedVariables,
        filesToIncludes,
        filesToExcludes,
        inferedFilesToInclude,
        searchVariables
    };
}
function colorizeVisibleTextEditors() {
    vscode_1.window.visibleTextEditors.forEach(editor => {
        q.push(cb => colorize(editor, cb));
    });
}
function activate(context) {
    config = readConfiguration();
    color_util_1.default.setupColorsExtractors(config.colorizedColors);
    variables_manager_1.default.setupVariablesExtractors(config.colorizedVariables);
    q.push((cb) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (config.searchVariables) {
                yield variables_manager_1.default.getWorkspaceVariables(config.filesToIncludes.concat(config.inferedFilesToInclude), config.filesToExcludes); // 👍
            }
            initEventListeners(context);
        }
        catch (error) {
            // handle promise rejection
        }
        return cb();
    }));
    colorizeVisibleTextEditors();
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    extension.nbLine = null;
    extension.editor = null;
    extension.deco.clear();
    extension.deco = null;
    cache_manager_1.default.clearCache();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map