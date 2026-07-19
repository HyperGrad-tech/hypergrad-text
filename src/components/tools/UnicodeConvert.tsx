import { useState, useMemo } from 'react';

type Dir = 'encode' | 'decode';

interface CharInfo {
  char: string;
  codepoint: string;     // U+XXXX
  utf8: string;           // F0 9F 98 80
  utf8Bytes: number[];
  utf16: string;          // \uD83D\uDE00
  utf16Units: number[];
  htmlEntity: string;     // &#128512;
  isEmoji: boolean;
}

function utf8Encode(codePoint: number): number[] {
  const bytes: number[] = [];
  if (codePoint <= 0x7F) bytes.push(codePoint);
  else if (codePoint <= 0x7FF) { bytes.push(0xC0 | (codePoint >> 6), 0x80 | (codePoint & 0x3F)); }
  else if (codePoint <= 0xFFFF) { bytes.push(0xE0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3F), 0x80 | (codePoint & 0x3F)); }
  else { bytes.push(0xF0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3F), 0x80 | ((codePoint >> 6) & 0x3F), 0x80 | (codePoint & 0x3F)); }
  return bytes;
}

function toSurrogatePair(codePoint: number): number[] {
  codePoint -= 0x10000;
  return [0xD800 | (codePoint >> 10), 0xDC00 | (codePoint & 0x3FF)];
}

function parseChar(c: string): CharInfo {
  const cp = c.codePointAt(0)!;
  const isSurrogate = c.length === 2; // 代理对
  const isEmoji = cp > 0xFFFF || (cp >= 0x1F300 && cp <= 0x1FAFF) || (cp >= 0x2600 && cp <= 0x27BF);
  const utf8Bytes = utf8Encode(cp);
  const utf16Units = isSurrogate ? toSurrogatePair(cp) : [cp];
  return {
    char: c,
    codepoint: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'),
    utf8: utf8Bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
    utf8Bytes,
    utf16: '\\u' + utf16Units.map(u => u.toString(16).toUpperCase().padStart(4, '0')).join('\\u'),
    utf16Units,
    htmlEntity: '&#' + cp + ';',
    isEmoji,
  };
}

export default function UnicodeConvert() {
  const [text, setText] = useState('');
  const [dir, setDir] = useState<Dir>('encode');

  // 编码：逐码点拆分
  const infos = useMemo<CharInfo[]>(() => {
    if (dir !== 'encode' || !text) return [];
    return [...text].map(parseChar);
  }, [text, dir]);

  // 编码总结果（拼接四种表示）
  const encodeOutput = useMemo(() => {
    if (dir !== 'encode' || infos.length === 0) return '';
    return [
      '// Unicode 码点\n' + infos.map(i => i.codepoint).join(' '),
      '// \\uXXXX 转义（JS/Java）\n' + infos.map(i => i.utf16).join(''),
      '// UTF-8 字节序列\n' + infos.map(i => i.utf8).join(' '),
      '// HTML 实体\n' + infos.map(i => i.htmlEntity).join(''),
    ].join('\n\n');
  }, [infos, dir]);

  // 解码：识别 \uXXXX、U+XXXX、&#NNN; / &#xHH;
  const decodeOutput = useMemo(() => {
    if (dir !== 'decode' || !text) return '';
    let s = text;
    // 代理对 \uD83D\uDE00 → emoji
    s = s.replace(/\\u([0-9a-fA-F]{4})\\u([0-9a-fA-F]{4})/g, (_, hi, lo) => {
      const h = parseInt(hi, 16), l = parseInt(lo, 16);
      if (h >= 0xD800 && h <= 0xDBFF && l >= 0xDC00 && l <= 0xDFFF) {
        return String.fromCodePoint(0x10000 + ((h - 0xD800) << 10) + (l - 0xDC00));
      }
      return String.fromCharCode(h) + String.fromCharCode(l);
    });
    // 单个 \uXXXX
    s = s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    // U+XXXXX (5-6 位)
    s = s.replace(/U\+([0-9a-fA-F]{4,6})/g, (_, h) => {
      try { return String.fromCodePoint(parseInt(h, 16)); } catch { return _; }
    });
    // &#NNN; 十进制
    s = s.replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCodePoint(parseInt(n, 10)); } catch { return _; }
    });
    // &#xHH; 十六进制
    s = s.replace(/&#x([0-9a-fA-F]+);/gi, (_, h) => {
      try { return String.fromCodePoint(parseInt(h, 16)); } catch { return _; }
    });
    return s;
  }, [text, dir]);

  const output = dir === 'encode' ? encodeOutput : decodeOutput;
  const copy = () => navigator.clipboard.writeText(output);

  return (
    <div className="uni-tool">
      <div className="uni-toolbar">
        <div className="seg-group">
          <span className="seg-label">方向：</span>
          <button className={`seg-btn ${dir === 'encode' ? 'active' : ''}`} onClick={() => setDir('encode')}>文本 → Unicode</button>
          <button className={`seg-btn ${dir === 'decode' ? 'active' : ''}`} onClick={() => setDir('decode')}>Unicode → 文本</button>
        </div>
        <span className="uni-tip">完整支持 emoji 与代理对</span>
      </div>

      <div className="tool-grid-2">
        <div>
          <div className="pane-head"><span>{dir === 'encode' ? '文本输入' : 'Unicode 输入'}</span><button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button></div>
          <textarea className="text-area" value={text} onChange={e => setText(e.target.value)} placeholder={dir === 'encode' ? '输入文本，如 你好😀' : '输入 \\uXXXX 或 U+XXXX 或 &#NNN;'} spellCheck={false} />
        </div>
        <div>
          <div className="pane-head"><span>{dir === 'encode' ? '四种 Unicode 表示' : '文本结果'}<button className="btn btn-sm btn-secondary" onClick={copy} disabled={!output}>复制</button></span></div>
          <textarea className="text-area dark" value={output} readOnly spellCheck={false} />
        </div>
      </div>

      {dir === 'encode' && infos.length > 0 && (
        <details className="uni-table-wrap" open>
          <summary>逐字符详情</summary>
          <div className="uni-table-scroll">
          <table className="uni-table">
            <thead>
              <tr><th>字符</th><th>码点</th><th>UTF-8 字节</th><th>UTF-16 单元</th><th>HTML 实体</th><th>类型</th></tr>
            </thead>
            <tbody>
              {infos.map((r, i) => (
                <tr key={i} className={r.isEmoji ? 'uni-emoji-row' : ''}>
                  <td className="uni-char">{r.char === ' ' ? '␣' : r.char === '\n' ? '⏎' : r.char}</td>
                  <td className="mono">{r.codepoint}</td>
                  <td className="mono">{r.utf8}</td>
                  <td className="mono">{r.utf16}</td>
                  <td className="mono">{r.htmlEntity}</td>
                  <td>{r.isEmoji ? 'emoji' : r.char.match(/[\u4e00-\u9fff]/) ? '中文' : 'ASCII'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </details>
      )}
    </div>
  );
}
