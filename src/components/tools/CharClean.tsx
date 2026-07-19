import { useState, useMemo } from 'react';

// 隐形字符检测与清理
export default function CharClean() {
  const [text, setText] = useState('');
  const [removeZw, setRemoveZw] = useState(true);    // 零宽字符
  const [removeBom, setRemoveBom] = useState(true);   // BOM
  const [removeCtrl, setRemoveCtrl] = useState(true); // 不可见控制符（保留 \t \n \r）
  const [mergeSpace, setMergeSpace] = useState(false);// 合并连续空白为单个空格
  const [trimEnd, setTrimEnd] = useState(false);      // 删除行尾空白
  const [removeFullSpace, setRemoveFullSpace] = useState(false); // 全角空格

  // 检测报告
  const report = useMemo(() => {
    const zw = (text.match(/[\u200B\u200C\u200D\u2060\uFEFF]/g) || []);
    const bom = (text.match(/\uFEFF/g) || []);
    const ctrl = (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []);
    const fullSpace = (text.match(/[\u3000\uFFA0]/g) || []);
    return {
      zw: zw.length,
      bom: bom.length,
      ctrl: ctrl.length,
      fullSpace: fullSpace.length,
    };
  }, [text]);

  const output = useMemo(() => {
    if (!text) return '';
    let s = text;
    if (removeZw) s = s.replace(/[\u200B\u200C\u200D\u2060]/g, '');
    if (removeBom) s = s.replace(/\uFEFF/g, '');
    if (removeCtrl) s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    if (removeFullSpace) s = s.replace(/[\u3000\uFFA0]/g, ' ');
    if (trimEnd) s = s.split(/\r\n|\r|\n/).map(l => l.replace(/[ \t]+$/, '')).join(text.includes('\r\n') ? '\r\n' : '\n');
    if (mergeSpace) s = s.replace(/[ \t]{2,}/g, ' ');
    return s;
  }, [text, removeZw, removeBom, removeCtrl, mergeSpace, trimEnd, removeFullSpace]);

  const copy = () => navigator.clipboard.writeText(output);
  const removed = text.length - output.length;

  const reportItems = [
    { label: '零宽字符', count: report.zw, color: report.zw > 0 ? 'warn' : '', hint: 'U+200B/C/D, U+2060' },
    { label: 'BOM 标记', count: report.bom, color: report.bom > 0 ? 'warn' : '', hint: 'U+FEFF' },
    { label: '控制符', count: report.ctrl, color: report.ctrl > 0 ? 'warn' : '', hint: '\\x00-1F 等' },
    { label: '全角空格', count: report.fullSpace, color: report.fullSpace > 0 ? 'warn' : '', hint: 'U+3000/FFA0' },
  ];

  return (
    <div className="cc-tool">
      <div className="cc-report">
        {reportItems.map(r => (
          <div key={r.label} className={`cc-report-item ${r.color}`}>
            <span className="cc-report-label">{r.label}</span>
            <span className="cc-report-count">{r.count}</span>
            <span className="cc-report-hint">{r.hint}</span>
          </div>
        ))}
        {report.zw > 0 && <div className="cc-warn">⚠ 检测到零宽字符，可能是 AIGC 文本水印或复制污染源，建议清理。</div>}
      </div>

      <div className="cc-options">
        <label className="opt-check"><input type="checkbox" checked={removeZw} onChange={e => setRemoveZw(e.target.checked)} /> 清除零宽字符</label>
        <label className="opt-check"><input type="checkbox" checked={removeBom} onChange={e => setRemoveBom(e.target.checked)} /> 清除 BOM</label>
        <label className="opt-check"><input type="checkbox" checked={removeCtrl} onChange={e => setRemoveCtrl(e.target.checked)} /> 清除控制符</label>
        <label className="opt-check"><input type="checkbox" checked={removeFullSpace} onChange={e => setRemoveFullSpace(e.target.checked)} /> 全角空格→半角</label>
        <label className="opt-check"><input type="checkbox" checked={mergeSpace} onChange={e => setMergeSpace(e.target.checked)} /> 合并连续空白</label>
        <label className="opt-check"><input type="checkbox" checked={trimEnd} onChange={e => setTrimEnd(e.target.checked)} /> 删除行尾空白</label>
      </div>

      <div className="tool-grid-2">
        <div>
          <div className="pane-head">
            <span>输入</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button>
          </div>
          <textarea className="text-area" value={text} onChange={e => setText(e.target.value)} placeholder="粘贴可能含有隐形字符的文本…" spellCheck={false} />
        </div>
        <div>
          <div className="pane-head">
            <span>清理结果</span>
            <button className="btn btn-sm btn-secondary" onClick={copy} disabled={!output}>复制</button>
          </div>
          <textarea className="text-area" value={output} readOnly placeholder="清理后显示在这里…" spellCheck={false} />
        </div>
      </div>

      <div className="cc-stats">
        <span>原长度 <strong>{[...text].length}</strong> 字符</span>
        <span>清理后 <strong>{[...output].length}</strong> 字符</span>
        <span className="removed">移除 <strong>{removed}</strong> 字符</span>
      </div>
    </div>
  );
}
