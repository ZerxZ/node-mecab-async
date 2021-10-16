
import { exec, ExecOptions } from "shelljs";
interface IMecabParserResult {
  kanji: string
  lexical: string
  compound: string
  compound2: string
  compound3: string
  conjugation: string
  inflection: string
  original: string
  reading: string
  pronunciation: string
}
interface IMecabOptions {
  dictPath?: string
  userPath?: string
  forceUTF8?: boolean
}
class Mecab {
  public command: string
  private _dictpath: IMecabOptions
  public options: ExecOptions
  /**
   * 
   * @param command 
   * @param options 
   * @param dictpath 
   */
  constructor(command?: string, options?: ExecOptions, dictpath?: IMecabOptions) {
    this.command = command || "mecab"
    this._dictpath = Object.assign({}, this._defaultOptions, dictpath)
    this.options = Object.assign({}, { "silent": true }, options)
  }
  private get _defaultOptions(): IMecabOptions {
    return {
      forceUTF8: true
    }
  }
  public parser(data: string[]): IMecabParserResult | null {
    if (data.length <= 8) return null;

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
    }
  }
  private _format(arr?: any[]) {
    const results: IMecabParserResult[] = [];
    if (!arr) { return results; }
    arr.forEach(data => {
      const result = this.parser(data);
      if (result) { results.push(result); }
    });
    return results;
  }
  private _shellCommand(str: string): string {
    const { _dictpath, command } = this
    const forceUTF8 = process.platform === "win32" && _dictpath.forceUTF8 ? "@chcp 65001 > nul & " : ""
    const dictPath = _dictpath.dictPath ? `-d "${_dictpath.dictPath}"` : ""
    const userPath = _dictpath.userPath ? `-u "${_dictpath.userPath}"` : ""
    return `${forceUTF8}echo "${str}" | ${command} ${dictPath} ${userPath}`
  }
  private _parseMeCabResult(result: string) {
    return result.split('\n').map(line => {
      const arr = line.split('\t');
      // EOS
      if (arr.length === 1) {
        return [line];
      }
      return [arr[0]].concat(arr[1].split(','));
    });
  }
  public parse(str: string, callback: (err: string | null, arr?: any[]) => any) {
    process.nextTick(() => { // for bug
      console.log(this._shellCommand(str));

      exec(this._shellCommand(str), this.options, (_, result, err) => {
        if (err) { return callback(err); }
        callback(err, this._parseMeCabResult(result).slice(0, -2));
      });
    });
  }
  public parseSync(str: string): any[] {
    console.log(this._shellCommand(str));
    const result = exec(this._shellCommand(str), this.options).stdout
    return this._parseMeCabResult(String(result)).slice(0, -2);
  }
  private _wakatsu(arr: any[]) {
    return arr.map(data => data[0])
  }

  public parseFormat(str: string, callback: (err: string | null, result?: any[]) => void) {
    this.parse(str, (err, result) => {
      if (err) { return callback(err); }
      callback(err, this._format(result));
    });
  }
  public parseSyncFormat(str: string) {
    return this._format(this.parseSync(str));
  }
  public wakachi(str: string, callback: (err: string | null, arr?: any[]) => any) {
    this.parse(str, (err: string | null, arr: any) => {
      if (err) { return callback(err); }
      callback(null, this._wakatsu(arr));
    });
  }
  public wakachiSync(str: string) {
    const arr = this.parseSync(str);
    return this._wakatsu(arr);
  }
  public setDictPath(paths:string) {
    this._dictpath.dictPath =  paths
  }
  public setUserPath(paths:string) {
    this._dictpath.userPath =  paths
  }
  public setForceUTF8(paths:boolean) {
    this._dictpath.forceUTF8 =  paths
  }
}

export default Mecab
