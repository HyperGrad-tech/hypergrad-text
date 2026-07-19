import { useState, useMemo } from 'react';

type Mode = 'html' | 'jsx' | 'js-string' | 'url';

const HTML_NAMED: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#47;',
};

function encodeHTML(s: string): string {
  return s.replace(/[&<>"'/]/g, ch => HTML_NAMED[ch]);
}
function decodeHTML(s: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00A0', '#39': "'", '#47': '/', '#x27': "'", '#x2f': '/' };
  return s.replace(/&(?:#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, ent => {
    const body = ent.slice(1, -1);
    if (body[0] === '#') {
      const hex = body[1] === 'x' || body[1] === 'X';
      const code = parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isNaN(code) ? ent : String.fromCodePoint(code);
    }
    return named[body.toLowerCase()] ?? ent;
  });
}

function encodeJSX(s: string): string {
  // 比 HTML 多转义 { }
  return encodeHTML(s).replace(/[{}]/g, ch => ch === '{' ? '&#123;' : '&#125;');
}
function decodeJSX(s: string): string {
  return decodeHTML(s.replace(/&#123;|&#x7[bB];/g, '{').replace(/&#125;|&#x7[dD];/g, '}'));
}

function encodeJsString(s: string): string {
  // 转义为 JS 字符串字面量内容（用双引号包裹的语义）
  return s.replace(/[\\"]/g, '\\$&').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}
function decodeJsString(s: string): string {
  return s.replace(/\\(.)/g, (_, ch) => {
    if (ch === 'n') return '\n';
    if (ch === 'r') return '\r';
    if (ch === 't') return '\t';
    if (ch === 'b') return '\b';
    if (ch === 'f') return '\f';
    if (ch === 'v') return '\v';
    if (ch === '0') return '\0';
    return ch;
  });
}

export default function HtmlEscape() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<Mode>('html');
  const [dir, setDir] = useState<'encode' | 'decode'>('encode');

  const output = useMemo(() => {
    if (!text) return '';
    try {
      switch (mode) {
        case 'html': return dir === 'encode' ? encodeHTML(text) : decodeHTML(text);
        case 'jsx': return dir === 'encode' ? encodeJSX(text) : decodeJSX(text);
        case 'js-string': return dir === 'encode' ? encodeJsString(text) : decodeJsString(text);
        case 'url': return dir === 'encode' ? encodeURIComponent(text) : decodeURIComponent(text);
      }
    } catch {
      return '⚠ 转换失败：输入内容包含无法解码的序列';
    }
  }, [text, mode, dir]);

  const copy = () => navigator.clipboard.writeText(output);

  const modeLabel = mode === 'html' ? 'HTML' : mode === 'jsx' ? 'JSX' : mode === 'js-string' ? 'JS 字符串' : 'URL 编码';

  return (
    <div className="esc-tool">
      <div className="esc-toolbar">
        <div className="seg-group">
          <span className="seg-label">类型：</span>
          {(['html', 'jsx', 'js-string', 'url'] as Mode[]).map(m => (
            <button key={m} className={`seg-btn ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
              {m === 'html' ? 'HTML' : m === 'jsx' ? 'JSX' : m === 'js-string' ? 'JS 字符串' : 'URL'}
            </button>
          ))}
        </div>
        <div className="seg-group">
          <span className="seg-label">方向：</span>
          <button className={`seg-btn ${dir === 'encode' ? 'active' : ''}`} onClick={() => setDir('encode')}>转义（Encode）</button>
          <button className={`seg-btn ${dir === 'decode' ? 'active' : ''}`} onClick={() => setDir('decode')}>反转义（Decode）</button>
        </div>
        <span className="esc-tip">{dir === 'encode' ? `${modeLabel} 转义` : `${modeLabel} 反转义`} · 数据不离开浏览器</span>
      </div>

      <div className="tool-grid-2">
        <div>
          <div className="pane-head"><span>输入</span><button className="btn btn-sm btn-ghost" onClick={() => setText('')}>清空</button></div>
          <textarea className="text-area" value={text} onChange={e => setText(e.target.value)} placeholder={dir === 'encode' ? '粘贴要转义的内容…' : '粘贴已转义的内容以还原…'} spellCheck={false} />
        </div>
        <div>
          <div className="pane-head"><span>{dir === 'encode' ? '转义结果' : '还原结果'}</span><button className="btn btn-sm btn-secondary" onClick={copy} disabled={!output}>复制</button></div>
          <textarea className="text-area" value={output} readOnly placeholder="结果…" spellCheck={false} />
        </div>
      </div>
    </div>
  );
}
