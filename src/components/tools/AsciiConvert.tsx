import { useState, useMemo } from 'react';

type Radix = 'dec' | 'hex' | 'bin';
type Dir = 'encode' | 'decode';
type Sep = 'space' | 'comma' | 'newline' | 'none';

const SEP_MAP: Record<Sep, string> = { space: ' ', comma: ', ', newline: '\n', none: '' };

// 控制字符名称表（0-31, 127）
const CTRL_NAMES: Record<number, string> = {
  0: 'NUL', 1: 'SOH', 2: 'STX', 3: 'ETX', 4: 'EOT', 5: 'ENQ', 6: 'ACK', 7: 'BEL',
  8: 'BS', 9: 'TAB', 10: 'LF', 11: 'VT', 12: 'FF', 13: 'CR', 14: 'SO', 15: 'SI',
  16: 'DLE', 17: 'DC1', 18: 'DC2', 19: 'DC3', 20: 'DC4', 21: 'NAK', 22: 'SYN', 23: 'ETB',
  24: 'CAN', 25: 'EM', 26: 'SUB', 27: 'ESC', 28: 'FS', 29: 'GS', 30: 'RS', 31: 'US', 127: 'DEL',
};

export default function AsciiConvert() {
  const [text, setText] = useState('');
  const [dir, setDir] = useState<Dir>('encode');
  const [radix, setRadix] = useState<Radix>('dec');
  const [sep, setSep] = useState<Sep>('space');

  const output = useMemo(() => {
    if (!text) return '';
    try {
      if (dir === 'encode') {
        const chars = [...text];
        const nums = chars.map(c => c.codePointAt(0)!);
        const formatted = nums.map(n => {
          if (radix === 'dec') return String(n);
          if (radix === 'hex') return n.toString(16).toUpperCase().padStart(2, '0');
          return n.toString(2).padStart(8, '0');
        });
        return formatted.join(SEP_MAP[sep]);
      } else {
        // decode: 按分隔符或固定宽度提取数字
        const cleaned = text.replace(/[^0-9a-fA-FxXbB,\s]/g, ' ');
        const tokens = cleaned.split(/[\s,]+/).filter(Boolean);
        const codePoints: number[] = [];
        for (const t of tokens) {
          let n: number;
          const lower = t.toLowerCase();
          if (lower.startsWith('0x')) n = parseInt(t, 16);
          else if (lower.startsWith('0b')) n = parseInt(t.slice(2), 2);
          else if (radix === 'hex') n = parseInt(t, 16);
          else if (radix === 'bin') n = parseInt(t, 2);
          else n = parseInt(t, 10);
          if (Number.isNaN(n)) continue;
          codePoints.push(n);
        }
        return codePoints.map(n => {
          if (n <= 31 || n === 127) return `\uFFFD`; // 控制字符用替换符
          try { return String.fromCodePoint(n); } catch { return ''; }
        }).join('');
      }
    } catch {
      return '⚠ 转换失败';
    }
  }, [text, dir, radix, sep]);

  const copy = () => navigator.clipboard.writeText(output);

  // 编码时展示字符对照表
  const table = useMemo(() => {
    if (dir !== 'encode' || !text) return [];
    return [...text].slice(0, 50).map(c => {
      const n = c.codePointAt(0)!;
      return {
        char: c,
        dec: n,
        hex: '0x' + n.toString(16).toUpperCase().padStart(2, '0'),
        bin: n.toString(2).padStart(8, '0'),
        name: n <= 127 ? (CTRL_NAMES[n] ?? (n >= 32 ? 'PRINT' : '')) : 'EXT',
      };
    });
  }, [text, dir]);

  return (
    <div className="asc-tool">
      <div className="asc-toolbar">
        <div className="seg-group">
          <span className="seg-label">方向：</span>
          <button className={`seg-btn ${dir === 'encode' ? 'active' : ''}`} onClick={() => setDir('encode')}>文本 → ASCII</button>
          <button className={`seg-btn ${dir === 'decode' ? 'active' : ''}`} onClick={() => setDir('decode')}>ASCII → 文本</button>
        </div>
        {dir === 'encode' && (
          <div className="seg-group">
            <span className="seg-label">进制：</span>
            <button className={`seg-btn ${radix === 'dec' ? 'active' : ''}`} onClick={() => setRadix('dec')}>十进制</button>
            <button className={`seg-btn ${radix === 'hex' ? 'active' : ''}`} onClick={() => setRadix('hex')}>十六进制</button>
            <button className={`seg-btn ${radix === 'bin' ? 'active' : ''}`} onClick={() => setRadix('bin')}>二进制</button>
          </div>
        )}
        {dir === 'encode' && (
          <div className="seg-group">
            <span className="seg-label">分隔符：</span>
            <select className="select" value={sep} onChange={e => setSep(e.target.value as Sep)}>
              <option value="space">空格</option>
              <option value="comma">逗号</option>
              <option value="newline">换行</option>
              <option value="none">无</option>
            </select>
          </div>
        )}
      </div>

      <div className="tool-grid-2">
        <div>
          <div className="pane-head"><span>{dir === 'encode' ? '文本输入' : 'ASCII 输入'}</span><button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button></div>
          <textarea className="text-area" value={text} onChange={e => setText(e.target.value)} placeholder={dir === 'encode' ? '输入文本，如 Hello' : '输入数字，如 72 101 108'} spellCheck={false} />
        </div>
        <div>
          <div className="pane-head"><span>{dir === 'encode' ? 'ASCII 码结果' : '文本结果'}<button className="btn btn-sm btn-secondary" onClick={copy} disabled={!output}>复制</button></span></div>
          <textarea className="text-area" value={output} readOnly spellCheck={false} />
        </div>
      </div>

      {dir === 'encode' && table.length > 0 && (
        <details className="asc-table-wrap" open>
          <summary>字符对照表（前 50 字符）</summary>
          <table className="asc-table">
            <thead>
              <tr><th>字符</th><th>十进制</th><th>十六进制</th><th>二进制</th><th>名称</th></tr>
            </thead>
            <tbody>
              {table.map((r, i) => (
                <tr key={i}>
                  <td className="asc-char">{r.char === ' ' ? '␣' : r.char === '\n' ? '⏎' : r.char}</td>
                  <td>{r.dec}</td>
                  <td>{r.hex}</td>
                  <td>{r.bin}</td>
                  <td className="asc-name">{r.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}
