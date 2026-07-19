import { useState, useMemo } from 'react';

type Format = 'csv' | 'tsv' | 'json' | 'markdown';

// RFC 4180 CSV 解析
function parseCsv(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === delim) { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); field = ''; rows.push(row); row = []; i++; continue; }
    field += c; i++;
  }
  // 末行
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 0 && !(r.length === 1 && r[0] === ''));
}

function parseJson(text: string): string[][] {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('JSON 顶层必须是数组');
  if (data.length === 0) return [];
  // 取所有 key 作表头
  const keys: string[] = [];
  const seen = new Set<string>();
  data.forEach(obj => {
    if (obj && typeof obj === 'object') {
      const flat = flattenObj(obj);
      Object.keys(flat).forEach(k => { if (!seen.has(k)) { seen.add(k); keys.push(k); } });
    }
  });
  const rows: string[][] = [keys];
  data.forEach(obj => {
    const flat = obj && typeof obj === 'object' ? flattenObj(obj) : { '_': String(obj) };
    rows.push(keys.map(k => flat[k] !== undefined ? String(flat[k]) : ''));
  });
  return rows;
}

function flattenObj(obj: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== 'object') { out[prefix || '_'] = String(obj); return out; }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => { Object.assign(out, flattenObj(v, `${prefix}[${i}]`)); });
    return out;
  }
  for (const k of Object.keys(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    const v = (obj as Record<string, unknown>)[k];
    if (v && typeof v === 'object') Object.assign(out, flattenObj(v, key));
    else out[key] = v === null || v === undefined ? '' : String(v);
  }
  return out;
}

function parseMarkdown(text: string): string[][] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && l.startsWith('|'));
  if (lines.length === 0) return [];
  // 跳过分隔行 | --- | --- |
  const rows = lines.filter(l => !/^\|[\s:|-]+\|?$/.test(l)).map(l => {
    return l.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
  });
  return rows;
}

function toCsv(rows: string[][], delim: string): string {
  return rows.map(r => r.map(field => {
    const needsQuote = field.includes(delim) || field.includes('"') || field.includes('\n') || field.includes('\r');
    if (!needsQuote) return field;
    return '"' + field.replace(/"/g, '""') + '"';
  }).join(delim)).join('\n');
}

function toJson(rows: string[][]): string {
  if (rows.length < 1) return '[]';
  const headers = rows[0];
  const objs = rows.slice(1).map(r => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => { o[h] = r[i] ?? ''; });
    return o;
  });
  return JSON.stringify(objs, null, 2);
}

function toMarkdown(rows: string[][]): string {
  if (rows.length === 0) return '';
  const headers = rows[0];
  const colCount = headers.length;
  const sep = headers.map(() => '---');
  const lines: string[] = [];
  lines.push('| ' + headers.join(' | ') + ' |');
  lines.push('| ' + sep.join(' | ') + ' |');
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    while (r.length < colCount) r.push('');
    lines.push('| ' + r.join(' | ') + ' |');
  }
  return lines.join('\n');
}

export default function TableConvert() {
  const [input, setInput] = useState('');
  const [from, setFrom] = useState<Format>('csv');
  const [to, setTo] = useState<Format>('json');
  const [error, setError] = useState('');

  const output = useMemo(() => {
    setError('');
    if (!input.trim()) return '';
    try {
      let rows: string[][];
      switch (from) {
        case 'csv': rows = parseCsv(input, ','); break;
        case 'tsv': rows = parseCsv(input, '\t'); break;
        case 'json': rows = parseJson(input); break;
        case 'markdown': rows = parseMarkdown(input); break;
      }
      if (rows.length === 0) return '';
      switch (to) {
        case 'csv': return toCsv(rows, ',');
        case 'tsv': return toCsv(rows, '\t');
        case 'json': return toJson(rows);
        case 'markdown': return toMarkdown(rows);
      }
    } catch (e) {
      setError((e as Error).message);
      return '';
    }
  }, [input, from, to]);

  const copy = () => navigator.clipboard.writeText(output);

  const fmtLabel = (f: Format) => f === 'csv' ? 'CSV' : f === 'tsv' ? 'TSV' : f === 'json' ? 'JSON' : 'Markdown';

  return (
    <div className="tc-tool">
      <div className="tc-toolbar">
        <div className="seg-group">
          <span className="seg-label">从：</span>
          <select className="select" value={from} onChange={e => setFrom(e.target.value as Format)}>
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown 表格</option>
          </select>
        </div>
        <span className="tc-arrow">→</span>
        <div className="seg-group">
          <span className="seg-label">转为：</span>
          <select className="select" value={to} onChange={e => setTo(e.target.value as Format)}>
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown 表格</option>
          </select>
        </div>
        <span className="tc-tip">{fmtLabel(from)} → {fmtLabel(to)} · 支持 RFC 4180 引号转义</span>
      </div>

      {error && <div className="tc-error">解析错误：{error}</div>}

      <div className="tool-grid-2">
        <div>
          <div className="pane-head"><span>{fmtLabel(from)} 输入</span><button className="btn btn-sm btn-ghost" onClick={() => setInput('')}>清空</button></div>
          <textarea className="text-area" value={input} onChange={e => setInput(e.target.value)} placeholder={`粘贴 ${fmtLabel(from)} 内容…`} spellCheck={false} />
        </div>
        <div>
          <div className="pane-head"><span>{fmtLabel(to)} 结果</span><button className="btn btn-sm btn-secondary" onClick={copy} disabled={!output}>复制</button></div>
          <textarea className="text-area" value={output} readOnly spellCheck={false} />
        </div>
      </div>
    </div>
  );
}
