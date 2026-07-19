import { useState, useMemo } from 'react';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

const STYLE_CSS = `
.md-body { font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.7; color: #1f2937; }
.md-body h1,.md-body h2,.md-body h3,.md-body h4,.md-body h5,.md-body h6 { font-weight: 700; line-height: 1.3; margin: 1.4em 0 .6em; }
.md-body h1 { font-size: 1.8em; border-bottom: 1px solid #e5e7eb; padding-bottom: .3em; }
.md-body h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: .3em; }
.md-body h3 { font-size: 1.25em; }
.md-body p { margin: .8em 0; }
.md-body a { color: #2D5A4F; text-decoration: none; }
.md-body a:hover { text-decoration: underline; }
.md-body ul,.md-body ol { padding-left: 1.6em; margin: .6em 0; }
.md-body li { margin: .25em 0; }
.md-body blockquote { border-left: 4px solid #2D5A4F; padding: .2em 1em; color: #4b5563; background: #EEF5F1; margin: .8em 0; }
.md-body code { background: #f3f4f6; padding: .15em .4em; border-radius: 4px; font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, monospace; font-size: .9em; color: #c7254e; }
.md-body pre { background: #1f2937; color: #e2e8f0; padding: 1em; border-radius: 6px; overflow-x: auto; margin: .8em 0; }
.md-body pre code { background: transparent; padding: 0; color: inherit; font-size: .875em; }
.md-body table { border-collapse: collapse; margin: .8em 0; width: 100%; }
.md-body th,.md-body td { border: 1px solid #d1d5db; padding: .5em .8em; text-align: left; }
.md-body th { background: #f9fafb; font-weight: 600; }
.md-body tr:nth-child(even) td { background: #fafafa; }
.md-body img { max-width: 100%; }
.md-body hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
.md-body del { color: #9ca3af; }
.md-body input[type="checkbox"] { margin-right: .4em; }
`;

export default function MdToHtml() {
  const [text, setText] = useState('');
  const [withStyle, setWithStyle] = useState(true);
  const [pureHtml, setPureHtml] = useState(false);

  const { html, standaloneHtml } = useMemo(() => {
    let parsed: string;
    try { parsed = marked.parse(text || '') as string; }
    catch { parsed = '<p>解析失败</p>'; }
    // 纯净 HTML：移除 class 与 data 属性
    let body = parsed;
    if (pureHtml) {
      body = body.replace(/\sclass="[^"]*"/g, '').replace(/\sdata-[a-z-]+="[^"]*"/g, '');
    }
    const standalone = withStyle
      ? `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>文档</title>\n<style>\n${STYLE_CSS}\n</style>\n</head>\n<body>\n<div class="md-body">\n${body}\n</div>\n</body>\n</html>`
      : body;
    return { html: body, standaloneHtml: standalone };
  }, [text, withStyle, pureHtml]);

  const [view, setView] = useState<'source' | 'preview'>('source');

  const copy = () => navigator.clipboard.writeText(view === 'source' ? html : standaloneHtml);
  const download = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'document.html'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="m2h-tool">
      <div className="m2h-toolbar">
        <div className="seg-group">
          <span className="seg-label">输出：</span>
          <select className="select" value={view} onChange={e => setView(e.target.value as 'source' | 'preview')}>
            <option value="source">HTML 源码</option>
            <option value="preview">完整 HTML 文件</option>
          </select>
        </div>
        <label className="opt-check"><input type="checkbox" checked={withStyle} onChange={e => setWithStyle(e.target.checked)} /> 自带样式</label>
        <label className="opt-check"><input type="checkbox" checked={pureHtml} onChange={e => setPureHtml(e.target.checked)} /> 纯净 HTML（移除 class）</label>
        <span className="m2h-tip">支持 GFM 表格/代码块/任务列表</span>
      </div>

      <div className="tool-grid-2">
        <div>
          <div className="pane-head"><span>Markdown 输入</span><button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button></div>
          <textarea className="text-area" value={text} onChange={e => setText(e.target.value)} placeholder={'输入 Markdown…\n\n# 标题\n\n| 列1 | 列2 |\n| --- | --- |\n| a | b |'} spellCheck={false} />
        </div>
        <div>
          <div className="pane-head">
            <span>{view === 'source' ? 'HTML 源码' : '完整 HTML'}</span>
            <div>
              <button className="btn btn-sm btn-secondary" onClick={copy} disabled={!html}>复制</button>{' '}
              <button className="btn btn-sm btn-primary" onClick={download} disabled={!html}>下载 .html</button>
            </div>
          </div>
          <textarea className="text-area dark" value={view === 'source' ? html : standaloneHtml} readOnly spellCheck={false} />
        </div>
      </div>
    </div>
  );
}
