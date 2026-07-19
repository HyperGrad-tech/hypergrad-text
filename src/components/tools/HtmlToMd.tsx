import { useState, useMemo, useEffect } from 'react';
import TurndownService from 'turndown';

let tdInstance: TurndownService | null = null;
function getTd(): TurndownService {
  if (tdInstance) return tdInstance;
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '*' });
  // 自定义表格规则（GFM 表格）
  td.addRule('gfmTable', {
    filter: 'table',
    replacement: function (_content, node) {
      const table = node as HTMLTableElement;
      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length === 0) return '';
      // 收集所有单元格
      const matrix: string[][] = [];
      rows.forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('th,td'));
        matrix.push(cells.map(c => {
          let txt = (c.textContent || '').replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
          return txt;
        }));
      });
      // 第一行作为表头
      const header = matrix[0];
      const aligns = Array.from(table.querySelectorAll('th')).map(th => {
        const a = (th as HTMLElement).style.textAlign || '';
        if (a === 'center') return ':---:';
        if (a === 'right') return '---:';
        return '---';
      });
      const sep = aligns.length === header.length ? aligns : header.map(() => '---');
      const lines: string[] = [];
      lines.push('| ' + header.join(' | ') + ' |');
      lines.push('| ' + sep.join(' | ') + ' |');
      for (let i = 1; i < matrix.length; i++) {
        // 补齐列数
        const row = matrix[i];
        while (row.length < header.length) row.push('');
        lines.push('| ' + row.join(' | ') + ' |');
      }
      return '\n\n' + lines.join('\n') + '\n\n';
    },
  });
  // 删除线
  td.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: content => '~~' + content + '~~',
  });
  // 任务列表
  td.addRule('taskListItems', {
    filter: (node: Node) => node.nodeName === 'INPUT' && (node as HTMLInputElement).type === 'checkbox',
    replacement: function (_content, node) {
      return (node as HTMLInputElement).checked ? '[x] ' : '[ ] ';
    },
  });
  tdInstance = td;
  return td;
}

export default function HtmlToMd() {
  const [html, setHtml] = useState('');
  const [md, setMd] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!html.trim()) { setMd(''); setError(''); return; }
    try {
      const td = getTd();
      // 清理 script/iframe/style/object（安全）
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      tmp.querySelectorAll('script,iframe,object,embed,style').forEach(el => el.remove());
      const result = td.turndown(tmp.innerHTML);
      setMd(result);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setMd('');
    }
  }, [html]);

  const copy = () => navigator.clipboard.writeText(md);
  const sample = `<h2>HTML 转 Markdown 示例</h2>
<p>这是一段<b>加粗</b>和<i>斜体</i>的文本，含<a href="https://text.hypergrad.cn">链接</a>。</p>
<ul>
  <li>列表项 1</li>
  <li>列表项 2</li>
</ul>
<table>
  <thead><tr><th>工具</th><th>用途</th></tr></thead>
  <tbody>
    <tr><td>字数统计</td><td>计数</td></tr>
    <tr><td>Markdown 编辑</td><td>写作</td></tr>
  </tbody>
</table>
<pre><code>const x = 1;</code></pre>`;

  return (
    <div className="h2m-tool">
      <div className="h2m-toolbar">
        <span className="h2m-tip">自动清理 script/iframe/style · 复杂表格保留数据</span>
        <button className="btn btn-sm btn-ghost" onClick={() => setHtml(sample)}>示例</button>
        <button className="btn btn-sm btn-ghost" onClick={() => setHtml('')}>清空</button>
      </div>

      {error && <div className="h2m-error">转换错误：{error}</div>}

      <div className="tool-grid-2">
        <div>
          <div className="pane-head"><span>HTML 输入</span></div>
          <textarea className="text-area" value={html} onChange={e => setHtml(e.target.value)} placeholder={'粘贴 HTML 代码…\n\n<h2>标题</h2>\n<p>段落</p>'} spellCheck={false} />
        </div>
        <div>
          <div className="pane-head"><span>Markdown 结果</span><button className="btn btn-sm btn-secondary" onClick={copy} disabled={!md}>复制</button></div>
          <textarea className="text-area" value={md} readOnly spellCheck={false} />
        </div>
      </div>
    </div>
  );
}
