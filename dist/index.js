'use strict';

var shelljs = require('shelljs');

class Mecab {
    command;
    _dictpath;
    options;
    /**
     *
     * @param command
     * @param options
     * @param dictpath
     */
    constructor(command, options, dictpath) {
        this.command = command || "mecab";
        this._dictpath = Object.assign({}, this._defaultOptions, dictpath);
        this.options = Object.assign({}, { "silent": true }, options);
    }
    get _defaultOptions() {
        return {
            forceUTF8: true
        };
    }
    parser(data) {
        if (data.length <= 8)
            return null;
        return {
            // Ref: http://mecab.googlecode.com/svn/trunk/mecab/doc/index.html
            // 表層形\t品詞,品詞細分類1,品詞細分類2,品詞細分類3,活用形,活用型,原形,読み,発音
            kanji: data[0],
            lexical: data[1],
            compound: data[2],
            compound2: data[3],
            compound3: data[4],
            conjugation: data[5],
            inflection: data[6],
            original: data[7],
            reading: data[8],
            pronunciation: data[9] || ''
        };
    }
    _format(arr) {
        const results = [];
        if (!arr) {
            return results;
        }
        arr.forEach(data => {
            const result = this.parser(data);
            if (result) {
                results.push(result);
            }
        });
        return results;
    }
    _shellCommand(str) {
        const { _dictpath, command } = this;
        const forceUTF8 = process.platform === "win32" && _dictpath.forceUTF8 ? "@chcp 65001 > nul & " : "";
        const dictPath = _dictpath.dictPath ? `-d "${_dictpath.dictPath}"` : "";
        const userPath = _dictpath.userPath ? `-u "${_dictpath.userPath}"` : "";
        return `${forceUTF8}echo "${str}" | ${command} ${dictPath} ${userPath}`;
    }
    _parseMeCabResult(result) {
        return result.split('\n').map(line => {
            const arr = line.split('\t');
            // EOS
            if (arr.length === 1) {
                return [line];
            }
            return [arr[0]].concat(arr[1].split(','));
        });
    }
    parse(str, callback) {
        process.nextTick(() => {
            console.log(this._shellCommand(str));
            shelljs.exec(this._shellCommand(str), this.options, (_, result, err) => {
                if (err) {
                    return callback(err);
                }
                callback(err, this._parseMeCabResult(result).slice(0, -2));
            });
        });
    }
    parseSync(str) {
        console.log(this._shellCommand(str));
        const result = shelljs.exec(this._shellCommand(str), this.options).stdout;
        return this._parseMeCabResult(String(result)).slice(0, -2);
    }
    _wakatsu(arr) {
        return arr.map(data => data[0]);
    }
    parseFormat(str, callback) {
        this.parse(str, (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(err, this._format(result));
        });
    }
    parseSyncFormat(str) {
        return this._format(this.parseSync(str));
    }
    wakachi(str, callback) {
        this.parse(str, (err, arr) => {
            if (err) {
                return callback(err);
            }
            callback(null, this._wakatsu(arr));
        });
    }
    wakachiSync(str) {
        const arr = this.parseSync(str);
        return this._wakatsu(arr);
    }
    setDictPath(paths) {
        this._dictpath.dictPath = paths;
    }
    setUserPath(paths) {
        this._dictpath.userPath = paths;
    }
    setForceUTF8(paths) {
        this._dictpath.forceUTF8 = paths;
    }
}

module.exports = Mecab;
//# sourceMappingURL=index.js.map
