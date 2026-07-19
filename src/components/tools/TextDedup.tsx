import { useState, useMemo } from 'react';

type Unit = 'line' | 'paragraph';

export default function TextDedup() {
  const [text, setText] = useState('');
  const [unit, setUnit] = useState<Unit>('line');
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [trimEach, setTrimEach] = useState(false);
  const [ignoreEmpty, setIgnoreEmpty] = useState(true);

  const { output, inputCount, outputCount, removed } = useMemo(() => {
    if (!text) return { output: '', inputCount: 0, outputCount: 0, removed: 0 };

    // 切分单元
    let parts: string[];
    let sep: string;
    if (unit === 'line') {
      // 保留原始换行符类型
      const hasCRLF = text.includes('\r\n');
      sep = hasCRLF ? '\r\n' : '\n';
      parts = text.split(/\r\n|\r|\n/);
    } else {
      // 段落：以一个或多个空行分隔，尽量保留分隔符结构
      sep = '\n\n';
      parts = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    }

    let working = parts.slice();
    if (ignoreEmpty) working = working.filter(p => p.trim() !== '');

    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of working) {
      let key = p;
      if (trimEach) key = key.trim();
      if (caseInsensitive) key = key.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        // 输出时若开启 trimEach 则输出 trim 后的，否则保留原值
        out.push(trimEach ? p.trim() : p);
      }
    }

    return {
      output: out.join(sep),
      inputCount: working.length,
      outputCount: out.length,
      removed: working.length - out.length,
    };
  }, [text, unit, caseInsensitive, trimEach, ignoreEmpty]);

  const copy = () => navigator.clipboard.writeText(output);

  return (
    <div className="dedup-tool">
      <div className="dedup-toolbar">
        <label className="opt-label">
          去重单元：
          <select className="select" value={unit} onChange={e => setUnit(e.target.value as Unit)}>
            <option value="line">按行</option>
            <option value="paragraph">按段落</option>
          </select>
        </label>
        <label className="opt-check"><input type="checkbox" checked={caseInsensitive} onChange={e => setCaseInsensitive(e.target.checked)} /> 大小写不敏感</label>
        <label className="opt-check"><input type="checkbox" checked={trimEach} onChange={e => setTrimEach(e.target.checked)} /> 去前后空白</label>
        <label className="opt-check"><input type="checkbox" checked={ignoreEmpty} onChange={e => setIgnoreEmpty(e.target.checked)} /> 忽略空行/空段</label>
        <span className="dedup-tip">保留首次出现顺序 · 数据不离开浏览器</span>
      </div>

      <div className="tool-grid-2">
        <div className="dedup-pane">
          <div className="pane-head">
            <span>输入</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button>
          </div>
          <textarea
            className="text-area"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={unit === 'line' ? '每行一条数据，自动去重（如邮箱、URL、ID）…' : '段落之间用空行分隔，自动按段落去重…'}
            spellCheck={false}
          />
        </div>
        <div className="dedup-pane">
          <div className="pane-head">
            <span>去重结果</span>
            <button className="btn btn-sm btn-secondary" onClick={copy} disabled={!output}>复制</button>
          </div>
          <textarea className="text-area" value={output} readOnly placeholder="去重后的内容会显示在这里…" spellCheck={false} />
        </div>
      </div>

      <div className="dedup-stats">
        <span>输入 <strong>{inputCount}</strong> 条</span>
        <span>输出 <strong>{outputCount}</strong> 条</span>
        <span className="removed">去除重复 <strong>{removed}</strong> 条</span>
      </div>
    </div>
  );
}
