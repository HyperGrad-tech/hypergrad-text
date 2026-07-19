import { useState, useMemo, useEffect } from 'react';

export default function WordCount() {
  const [text, setText] = useState('');
  const [options, setOptions] = useState({
    countCharWithSpace: true,
    countCharNoSpace: true,
    countChinese: true,
    countEnglishWords: true,
    countLines: true,
    countParagraphs: true,
  });

  // localStorage 持久化
  useEffect(() => {
    const saved = localStorage.getItem('hg:text:word-count');
    if (saved) setText(saved);
    return () => {
      // 切走不主动清空，让用户下次回来还在
    };
  }, []);
  useEffect(() => {
    localStorage.setItem('hg:text:word-count', text);
  }, [text]);

  const stats = useMemo(() => {
    const t = text;
    // 含空格字符数 = 全部长度
    const charWithSpace = [...t].length;
    // 不含空格字符数 = 去掉所有空白（含空格、tab、换行）
    const charNoSpace = [...t.replace(/\s/g, '')].length;
    // 纯汉字数（CJK 统一表意 + 扩展）
    const chineseMatches = t.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
    const chinese = chineseMatches ? chineseMatches.length : 0;
    // 英文单词数（连续字母）

    const englishMatches = t.match(/[a-zA-Z]+/g);
    const englishWords = englishMatches ? englishMatches.length : 0;
    // 行数（按换行符）
    const lines = t === '' ? 0 : t.split(/\r\n|\r|\n/).length;
    // 段落（以一个或多个空行分隔）
    const paragraphs = t.trim() === '' ? 0 : t.trim().split(/\n\s*\n/).filter(p => p.trim()).length;
    // 字节数（UTF-8）
    const bytes = new TextEncoder().encode(t).length;
    // 数字串数
    const digitRuns = (t.match(/\d+/g) || []).length;
    // 标点数（中英文标点）
    const punctMatches = t.match(/[，。！？；：「」『』（）【】《》、…—,.!?;:"'()\[\]<>\/\\|`~@#\$%\^&\*\-_+=]/g);
    const punct = punctMatches ? punctMatches.length : 0;

    return {
      charWithSpace,
      charNoSpace,
      chinese,
      englishWords,
      lines,
      paragraphs,
      bytes,
      digitRuns,
      punct,
    };
  }, [text]);

  const samples = [
    { label: '粘贴文本到这里，实时统计字数、字符数、行数', value: '欢迎使用 HyperGrad 字数统计工具。\n\n本工具实时统计中英文字符数、单词数、行数、段落数，所有计算在浏览器本地完成，不上传、不存储。\n\n试试粘贴一段文本，或者直接在这里撰写。' },
  ];

  const metricDefs: Array<{ key: keyof typeof stats; label: string; tip: string; enabled: boolean; highlight?: boolean }> = [
    { key: 'charWithSpace', label: '字符数（含空格）', tip: '所有字符总数，包含空格与换行。Word「字符数(含空格)」对应此项。', enabled: options.countCharWithSpace, highlight: true },
    { key: 'charNoSpace', label: '字符数（不含空格）', tip: '去除所有空白后的字符数。Word「字符数(不含空格)」对应此项。', enabled: options.countCharNoSpace },
    { key: 'chinese', label: '中文字数', tip: 'CJK 统一表意文字数量，每个汉字算 1 个字。论文投稿通常看此项。', enabled: options.countChinese, highlight: true },
    { key: 'englishWords', label: '英文单词数', tip: '连续字母算一个单词。英文 SEO 与英文论文字数对应此项。', enabled: options.countEnglishWords },
    { key: 'lines', label: '行数', tip: '按换行符拆分的行数。', enabled: options.countLines },
    { key: 'paragraphs', label: '段落数', tip: '以空行分隔的段落数。', enabled: options.countParagraphs },
    { key: 'bytes', label: '字节数 (UTF-8)', tip: 'UTF-8 编码后的字节数。中文每字 3 字节，英文每字 1 字节。', enabled: true, highlight: false },
    { key: 'punct', label: '标点数', tip: '中英文标点字符总数。', enabled: true },
    { key: 'digitRuns', label: '数字串数', tip: '连续数字算一串。', enabled: true },
  ];

  return (
    <div className="wc-tool">
      {/* 统计结果横向卡片，放在文本框上方，让用户先看到结果 */}
      <div className="wc-stats-bar">
        {metricDefs.filter(m => m.enabled).map(m => (
          <div key={m.key} className={`wc-stat-card ${m.highlight ? 'highlight' : ''}`} title={m.tip}>
            <div className="wc-stat-card-label">{m.label}</div>
            <div className="wc-stat-card-value">{stats[m.key].toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="wc-toolbar">
        {samples.map((s, i) => (
          <button key={i} className="btn btn-sm btn-ghost" onClick={() => setText(s.value)}>示例</button>
        ))}
        <button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button>
        <button className="btn btn-sm btn-ghost" onClick={() => navigator.clipboard.writeText(text)}>复制文本</button>
        <span className="wc-tip">实时统计 · 数据不离开浏览器</span>
      </div>

      <textarea
        className="wc-input"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="在此粘贴或输入文本，自动统计字数…"
        spellCheck={false}
      />

      <details className="wc-options">
        <summary>显示选项</summary>
        <div className="wc-option-grid">
          <label><input type="checkbox" checked={options.countCharWithSpace} onChange={e => setOptions({...options, countCharWithSpace: e.target.checked})} /> 字符数（含空格）</label>
          <label><input type="checkbox" checked={options.countCharNoSpace} onChange={e => setOptions({...options, countCharNoSpace: e.target.checked})} /> 字符数（不含空格）</label>
          <label><input type="checkbox" checked={options.countChinese} onChange={e => setOptions({...options, countChinese: e.target.checked})} /> 中文字数</label>
          <label><input type="checkbox" checked={options.countEnglishWords} onChange={e => setOptions({...options, countEnglishWords: e.target.checked})} /> 英文单词数</label>
          <label><input type="checkbox" checked={options.countLines} onChange={e => setOptions({...options, countLines: e.target.checked})} /> 行数</label>
          <label><input type="checkbox" checked={options.countParagraphs} onChange={e => setOptions({...options, countParagraphs: e.target.checked})} /> 段落数</label>
        </div>
      </details>
    </div>
  );
}
