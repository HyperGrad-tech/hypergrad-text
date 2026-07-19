import { useState, useMemo } from 'react';

type Mode = 'char' | 'word' | 'line';

export default function ReverseText() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<Mode>('char');
  const [keepPunct, setKeepPunct] = useState(false);

  const output = useMemo(() => {
    if (!text) return '';
    const punctSet = /[，。！？；：、""''（）【】《》…—,.!?;:"'()\[\]<>\/\\|`~@#\$%\^&\*\-_+=]/;

    if (mode === 'line') {
      const hasCRLF = text.includes('\r\n');
      const sep = hasCRLF ? '\r\n' : '\n';
      return text.split(/\r\n|\r|\n/).reverse().join(sep);
    }

    if (mode === 'word') {
      // 按空白切词，保留分隔符序列
      const tokens = text.split(/(\s+)/);
      const wordIdx: number[] = [];
      tokens.forEach((t, i) => { if (t.trim() !== '') wordIdx.push(i); });
      const reversedWords = wordIdx.slice().reverse();
      const newTokens = tokens.slice();
      wordIdx.forEach((origPos, k) => {
        newTokens[origPos] = tokens[reversedWords[k]];
      });
      return newTokens.join('');
    }

    // char：按 Unicode 码点拆分，正确处理代理对
    const chars = [...text];
    if (keepPunct) {
      // 标点位置固定，只翻转非标点字符
      const nonPunct: string[] = chars.filter(c => !punctSet.test(c));
      nonPunct.reverse();
      let idx = 0;
      return chars.map(c => punctSet.test(c) ? c : nonPunct[idx++]).join('');
    }
    chars.reverse();
    return chars.join('');
  }, [text, mode, keepPunct]);

  const copy = () => navigator.clipboard.writeText(output);

  return (
    <div className="rev-tool">
      <div className="rev-toolbar">
        <div className="seg-group">
          <span className="seg-label">翻转方式：</span>
          {(['char', 'word', 'line'] as Mode[]).map(m => (
            <button key={m} className={`seg-btn ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
              {m === 'char' ? '逐字符' : m === 'word' ? '逐词' : '逐行'}
            </button>
          ))}
        </div>
        <label className="opt-check" title="标点位置不变，只翻转字母与汉字">
          <input type="checkbox" checked={keepPunct} onChange={e => setKeepPunct(e.target.checked)} disabled={mode === 'line'} /> 保留标点位置
        </label>
        <span className="rev-tip">支持 emoji 与中英文 · 数据不离开浏览器</span>
      </div>

      <div className="tool-grid-2">
        <div>
          <div className="pane-head">
            <span>输入</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button>
          </div>
          <textarea className="text-area" value={text} onChange={e => setText(e.target.value)} placeholder="输入要翻转的文本…" spellCheck={false} />
        </div>
        <div>
          <div className="pane-head">
            <span>翻转结果</span>
            <button className="btn btn-sm btn-secondary" onClick={copy} disabled={!output}>复制</button>
          </div>
          <textarea className="text-area" value={output} readOnly placeholder="翻转后显示在这里…" spellCheck={false} />
        </div>
      </div>
    </div>
  );
}
