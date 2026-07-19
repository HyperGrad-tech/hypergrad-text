import { useState, useMemo } from 'react';

interface Pattern {
  id: string;
  label: string;
  re: RegExp;
  hint: string;
}

const PATTERNS: Pattern[] = [
  { id: 'email', label: '邮箱', re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, hint: 'RFC 5322 简化版' },
  { id: 'url', label: 'URL', re: /https?:\/\/[^\s<>"']+/gi, hint: 'http/https 链接' },
  { id: 'phone', label: '手机号', re: /(?<!\d)1[3-9]\d{9}(?!\d)/g, hint: '中国大陆 11 位' },
  { id: 'tel', label: '固定电话', re: /(?:0\d{2,3}-)?\d{7,8}/g, hint: '区号-号码' },
  { id: 'ipv4', label: 'IPv4', re: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g, hint: '0.0.0.0 - 255.255.255.255' },
  { id: 'ipv6', label: 'IPv6', re: /\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b/g, hint: '完整格式' },
  { id: 'date', label: '日期', re: /\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?/g, hint: 'YYYY-MM-DD 等' },
  { id: 'time', label: '时间', re: /\b\d{1,2}:\d{2}(?::\d{2})?\b/g, hint: 'HH:MM[:SS]' },
  { id: 'idcard', label: '身份证号', re: /(?<!\d)\d{17}[\dXx](?!\d)/g, hint: '18 位含校验' },
  { id: 'qq', label: 'QQ 号', re: /(?<!\d)[1-9]\d{4,10}(?!\d)/g, hint: '5-11 位' },
  { id: 'zip', label: '邮编', re: /(?<!\d)\d{6}(?!\d)/g, hint: '中国 6 位邮编' },
  { id: 'mac', label: 'MAC 地址', re: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g, hint: 'XX:XX:XX:XX:XX:XX' },
];

export default function TextExtract() {
  const [text, setText] = useState('');
  const [patternId, setPatternId] = useState('email');
  const [customRe, setCustomRe] = useState('');
  const [customFlags, setCustomFlags] = useState('g');
  const [useCustom, setUseCustom] = useState(false);
  const [dedup, setDedup] = useState(true);
  const [error, setError] = useState('');

  const result = useMemo(() => {
    setError('');
    if (!text) return { matches: [] as string[], unique: [] as string[] };
    let re: RegExp;
    if (useCustom) {
      try {
        const src = customRe.replace(/^\/|\/$/g, '');
        re = new RegExp(src, customFlags.includes('g') ? customFlags : customFlags + 'g');
      } catch (e) {
        setError((e as Error).message);
        return { matches: [], unique: [] };
      }
    } else {
      const p = PATTERNS.find(p => p.id === patternId)!;
      // 重置 lastIndex 防止全局污染
      re = new RegExp(p.re.source, p.re.flags);
    }
    const matches: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push(m[0]);
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    const unique = dedup ? Array.from(new Set(matches)) : matches;
    return { matches, unique };
  }, [text, patternId, customRe, customFlags, useCustom, dedup]);

  const copy = () => navigator.clipboard.writeText(result.unique.join('\n'));

  return (
    <div className="ext-tool">
      <div className="ext-toolbar">
        <div className="seg-group">
          <span className="seg-label">模式：</span>
          <label className="opt-check"><input type="radio" checked={!useCustom} onChange={() => setUseCustom(false)} /> 预设</label>
          <label className="opt-check"><input type="radio" checked={useCustom} onChange={() => setUseCustom(true)} /> 自定义正则</label>
        </div>
        {!useCustom ? (
          <select className="select" value={patternId} onChange={e => setPatternId(e.target.value)}>
            {PATTERNS.map(p => <option key={p.id} value={p.id}>{p.label}（{p.hint}）</option>)}
          </select>
        ) : (
          <div className="custom-re">
            <input className="input" placeholder="正则表达式，如 \d{4}" value={customRe} onChange={e => setCustomRe(e.target.value)} />
            <input className="input flags-input" placeholder="flags" value={customFlags} onChange={e => setCustomFlags(e.target.value)} />
          </div>
        )}
        <label className="opt-check"><input type="checkbox" checked={dedup} onChange={e => setDedup(e.target.checked)} /> 去重</label>
      </div>

      {error && <div className="ext-error">正则错误：{error}</div>}

      <div className="tool-grid-2">
        <div>
          <div className="pane-head"><span>输入文本</span><button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button></div>
          <textarea className="text-area" value={text} onChange={e => setText(e.target.value)} placeholder="粘贴要提取的文本…" spellCheck={false} />
        </div>
        <div>
          <div className="pane-head">
            <span>提取结果</span>
            <button className="btn btn-sm btn-secondary" onClick={copy} disabled={result.unique.length === 0}>复制（每行一个）</button>
          </div>
          <div className="ext-result">
            {result.unique.length === 0 ? (
              <div className="ext-empty">未匹配到内容</div>
            ) : (
              <ol className="ext-list">
                {result.unique.map((m, i) => <li key={i}>{m}</li>)}
              </ol>
            )}
          </div>
        </div>
      </div>

      <div className="ext-stats">
        <span>命中 <strong>{result.matches.length}</strong> 次</span>
        <span>去重后 <strong>{result.unique.length}</strong> 个</span>
      </div>
    </div>
  );
}
