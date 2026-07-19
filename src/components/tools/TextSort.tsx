import { useState, useMemo } from 'react';

type Mode = 'asc' | 'desc' | 'shuffle' | 'reverse';
type SortType = 'string' | 'natural' | 'numeric' | 'length';

export default function TextSort() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<Mode>('asc');
  const [sortType, setSortType] = useState<SortType>('string');
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);

  const { output, inputCount, outputCount } = useMemo(() => {
    if (!text) return { output: '', inputCount: 0, outputCount: 0 };
    const hasCRLF = text.includes('\r\n');
    const sep = hasCRLF ? '\r\n' : '\n';
    let lines = text.split(/\r\n|\r|\n/);
    const inputCount = lines.length;
    if (removeEmpty) lines = lines.filter(l => l.trim() !== '');

    // 比较键
    const keyOf = (s: string): string | number => {
      const raw = caseSensitive ? s : s.toLowerCase();
      switch (sortType) {
        case 'natural': return raw; // 自然排序在比较函数里单独处理
        case 'numeric': {
          const m = raw.match(/-?\d+(\.\d+)?/);
          return m ? parseFloat(m[0]) : 0;
        }
        case 'length': return [...raw].length;
        default: return raw;
      }
    };

    let arr = lines.slice();
    if (mode === 'shuffle') {
      // Fisher-Yates 洗牌
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } else if (mode === 'reverse') {
      arr.reverse();
    } else {
      const dir = mode === 'asc' ? 1 : -1;
      arr.sort((a, b) => {
        if (sortType === 'natural') {
          return dir * naturalCompare(caseSensitive ? a : a.toLowerCase(), caseSensitive ? b : b.toLowerCase());
        }
        const ka = keyOf(a) as number | string;
        const kb = keyOf(b) as number | string;
        if (typeof ka === 'number' && typeof kb === 'number') return (ka - kb) * dir;
        const sa = String(ka), sb = String(kb);
        return dir * (sa < sb ? -1 : sa > sb ? 1 : 0);
      });
    }
    return { output: arr.join(sep), inputCount, outputCount: arr.length };
  }, [text, mode, sortType, caseSensitive, removeEmpty]);

  // 自然排序：把字符串拆成数字/非数字块逐段比较
  function naturalCompare(a: string, b: string): number {
    const ax: string[] = [], bx: string[] = [];
    a.replace(/(\d+|\D+)/g, (_, t) => { ax.push(t); return ''; });
    b.replace(/(\d+|\D+)/g, (_, t) => { bx.push(t); return ''; });
    const n = Math.min(ax.length, bx.length);
    for (let i = 0; i < n; i++) {
      const an = /^\d/.test(ax[i]), bn = /^\d/.test(bx[i]);
      if (an && bn) {
        const d = parseInt(ax[i], 10) - parseInt(bx[i], 10);
        if (d !== 0) return d;
      } else {
        const d = ax[i] < bx[i] ? -1 : ax[i] > bx[i] ? 1 : 0;
        if (d !== 0) return d;
      }
    }
    return ax.length - bx.length;
  }

  const copy = () => navigator.clipboard.writeText(output);

  return (
    <div className="sort-tool">
      <div className="sort-toolbar">
        <div className="seg-group">
          <span className="seg-label">排序方式：</span>
          {(['asc', 'desc', 'shuffle', 'reverse'] as Mode[]).map(m => (
            <button key={m} className={`seg-btn ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
              {m === 'asc' ? '升序' : m === 'desc' ? '降序' : m === 'shuffle' ? '随机打乱' : '反转'}
            </button>
          ))}
        </div>
        <div className="seg-group">
          <span className="seg-label">比较类型：</span>
          <select className="select" value={sortType} onChange={e => setSortType(e.target.value as SortType)}>
            <option value="string">字符串（ASCII）</option>
            <option value="natural">自然排序（file2 &lt; file10）</option>
            <option value="numeric">数值（按数字大小）</option>
            <option value="length">字符长度</option>
          </select>
        </div>
        <label className="opt-check"><input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} /> 区分大小写</label>
        <label className="opt-check"><input type="checkbox" checked={removeEmpty} onChange={e => setRemoveEmpty(e.target.checked)} /> 移除空行</label>
      </div>

      <div className="tool-grid-2">
        <div>
          <div className="pane-head">
            <span>输入</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button>
          </div>
          <textarea className="text-area" value={text} onChange={e => setText(e.target.value)} placeholder="每行一条，自动排序…" spellCheck={false} />
        </div>
        <div>
          <div className="pane-head">
            <span>排序结果</span>
            <button className="btn btn-sm btn-secondary" onClick={copy} disabled={!output}>复制</button>
          </div>
          <textarea className="text-area" value={output} readOnly placeholder="排序后的内容…" spellCheck={false} />
        </div>
      </div>

      <div className="sort-stats">
        <span>输入 <strong>{inputCount}</strong> 行</span>
        <span>输出 <strong>{outputCount}</strong> 行</span>
      </div>
    </div>
  );
}
