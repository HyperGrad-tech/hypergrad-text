import { useState, useMemo, useEffect, useRef } from 'react';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export default function MarkdownEditor() {
  const [text, setText] = useState('');
  const savedRef = useRef(false);

  // localStorage 持久化
  useEffect(() => {
    const saved = localStorage.getItem('hg:text:md-editor');
    if (saved) { setText(saved); savedRef.current = true; }
  }, []);
  useEffect(() => {
    localStorage.setItem('hg:text:md-editor', text);
  }, [text]);

  const html = useMemo(() => {
    try { return marked.parse(text || '') as string; }
    catch { return '<p>解析失败</p>'; }
  }, [text]);

  const insert = (before: string, after = '', placeholder = '') => {
    const ta = document.getElementById('md-editor-ta') as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const selected = text.slice(start, end) || placeholder;
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    setText(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    });
  };

  const exportMd = () => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'document.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = () => navigator.clipboard.writeText(html);

  const sample = `# 欢迎使用 Markdown 编辑器

支持 **GFM** 扩展语法，左右分栏 *实时预览*。

## 功能特性

- 表格、任务列表、删除线
- 代码围栏与高亮
- 自动保存到本地

## 表格示例

| 工具 | 说明 |
| --- | --- |
| 字数统计 | 实时计数 |
| Markdown | 编辑预览 |

## 任务列表

- [x] 自动保存
- [x] 实时预览
- [ ] 导出 PDF

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

> 内容仅保存在你的浏览器，不上传服务器。

[HyperGrad Text](https://text.hypergrad.cn)`;

  return (
    <div className="mded-tool">
      <div className="mded-toolbar">
        <div className="mded-btns">
          <button className="btn btn-sm btn-ghost" onClick={() => insert('# ', '', '标题')} title="一级标题">H1</button>
          <button className="btn btn-sm btn-ghost" onClick={() => insert('## ', '', '标题')} title="二级标题">H2</button>
          <button className="btn btn-sm btn-ghost" onClick={() => insert('**', '**', '加粗')} title="加粗">B</button>
          <button className="btn btn-sm btn-ghost" onClick={() => insert('*', '*', '斜体')} title="斜体">I</button>
          <button className="btn btn-sm btn-ghost" onClick={() => insert('~~', '~~', '删除线')} title="删除线">S</button>
          <button className="btn btn-sm btn-ghost" onClick={() => insert('[', '](https://)', '链接文字')} title="链接">Link</button>
          <button className="btn btn-sm btn-ghost" onClick={() => insert('`', '`', 'code')} title="行内代码">Code</button>
          <button className="btn btn-sm btn-ghost" onClick={() => insert('\n```\n', '\n```\n', '代码块')} title="代码块">Block</button>
          <button className="btn btn-sm btn-ghost" onClick={() => insert('\n- ', '', '列表项')} title="列表">List</button>
          <button className="btn btn-sm btn-ghost" onClick={() => insert('\n> ', '', '引用')} title="引用">Quote</button>
          <button className="btn btn-sm btn-ghost" onClick={() => insert('\n| 列1 | 列2 |\n| --- | --- |\n| ', ' |', '值')} title="表格">Table</button>
        </div>
        <div className="mded-btns-right">
          <button className="btn btn-sm btn-ghost" onClick={() => setText(sample)}>示例</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button>
          <button className="btn btn-sm btn-secondary" onClick={copyHtml}>复制 HTML</button>
          <button className="btn btn-sm btn-primary" onClick={exportMd}>导出 .md</button>
        </div>
      </div>

      <div className="mded-grid">
        <div className="mded-pane">
          <div className="pane-head"><span>Markdown 源码</span><span className="pane-meta">自动保存</span></div>
          <textarea
            id="md-editor-ta"
            className="text-area mded-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={'在此输入 Markdown，右侧实时预览…\n\n# 标题\n**加粗** *斜体*\n- 列表项'}
            spellCheck={false}
          />
        </div>
        <div className="mded-pane">
          <div className="pane-head"><span>实时预览</span></div>
          <div className="mded-preview md-body" dangerouslySetInnerHTML={{ __html: html || '<p style="color:#999">预览将显示在这里…</p>' }} />
        </div>
      </div>
    </div>
  );
}
