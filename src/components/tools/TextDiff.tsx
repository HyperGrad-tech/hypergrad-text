import { useState, useMemo } from 'react';

interface DiffRow {
  type: 'equal' | 'add' | 'del' | 'mod';
  left?: string;       // 原文行（del/equal/mod 有）
  right?: string;      // 新文行（add/equal/mod 有）
  leftNum?: number;    // 原文行号
  rightNum?: number;   // 新文行号
}

function splitLines(s: string): string[] {
  if (!s) return [];
  return s.split(/\r\n|\r|\n/);
}

// LCS 行级差异，回溯生成 diff 序列
function diffLines(a: string[], b: string[], ignoreCase: boolean, ignoreTrailWS: boolean, ignoreEmpty: boolean): DiffRow[] {
  const norm = (l: string) => {
    let x = l;
    if (ignoreTrailWS) x = x.replace(/[ \t]+$/, '');
    if (ignoreCase) x = x.toLowerCase();
    return x;
  };
  const na = a.length, nb = b.length;
  // 预处理比较键
  const keyA = a.map(l => {
    let x = l;
    if (ignoreTrailWS) x = x.replace(/[ \t]+$/, '');
    if (ignoreCase) x = x.toLowerCase();
    return x;
  });
  const keyB = b.map(l => {
    let x = l;
    if (ignoreTrailWS) x = x.replace(/[ \t]+$/, '');
    if (ignoreCase) x = x.toLowerCase();
    return x;
  });

  // 跳过空行匹配
  const isEmpty = (k: string) => ignoreEmpty && k.trim() === '';

  // DP 表
  const dp: number[][] = Array.from({ length: na + 1 }, () => new Array(nb + 1).fill(0));
  for (let i = na - 1; i >= 0; i--) {
    for (let j = nb - 1; j >= 0; j--) {
      if (!isEmpty(keyA[i]) && !isEmpty(keyB[j]) && keyA[i] === keyB[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const rows: DiffRow[] = [];
  let i = 0, j = 0;
  while (i < na && j < nb) {
    if (!isEmpty(keyA[i]) && !isEmpty(keyB[j]) && keyA[i] === keyB[j]) {
      rows.push({ type: 'equal', left: a[i], right: b[j], leftNum: i + 1, rightNum: j + 1 });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      // a[i] 是删除：检查下一行是否是新增（配对成 mod）
      rows.push({ type: 'del', left: a[i], leftNum: i + 1 });
      i++;
    } else {
      rows.push({ type: 'add', right: b[j], rightNum: j + 1 });
      j++;
    }
  }
  while (i < na) { rows.push({ type: 'del', left: a[i], leftNum: i + 1 }); i++; }
  while (j < nb) { rows.push({ type: 'add', right: b[j], rightNum: j + 1 }); j++; }

  // 把相邻的 del+add 配对成 mod
  const merged: DiffRow[] = [];
  let k = 0;
  while (k < rows.length) {
    if (rows[k].type === 'del') {
      const dels: DiffRow[] = [];
      while (k < rows.length && rows[k].type === 'del') { dels.push(rows[k]); k++; }
      const adds: DiffRow[] = [];
      while (k < rows.length && rows[k].type === 'add') { adds.push(rows[k]); k++; }
      // 若 dels 与 adds 数量相等且≥1，按行配对成 mod；其余独立输出
      const m = Math.min(dels.length, adds.length);
      for (let x = 0; x < m; x++) merged.push({ type: 'mod', left: dels[x].left, right: adds[x].right, leftNum: dels[x].leftNum, rightNum: adds[x].rightNum });
      for (let x = m; x < dels.length; x++) merged.push(dels[x]);
      for (let x = m; x < adds.length; x++) merged.push(adds[x]);
    } else {
      merged.push(rows[k]);
      k++;
    }
  }
  return merged;
}

// 字符级 diff，返回高亮片段
interface CharPart { text: string; changed: boolean; }
function charDiff(a: string, b: string): { left: CharPart[]; right: CharPart[] } {
  const A = [...a], B = [...b];
  const na = A.length, nb = B.length;
  const dp: number[][] = Array.from({ length: na + 1 }, () => new Array(nb + 1).fill(0));
  for (let i = na - 1; i >= 0; i--)
    for (let j = nb - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const leftParts: CharPart[] = [], rightParts: CharPart[] = [];
  let i = 0, j = 0;
  let lBuf = '', rBuf = '';
  const flush = () => {
    if (lBuf) { leftParts.push({ text: lBuf, changed: false }); lBuf = ''; }
    if (rBuf) { rightParts.push({ text: rBuf, changed: false }); rBuf = ''; }
  };
  while (i < na && j < nb) {
    if (A[i] === B[j]) {
      flush();
      leftParts.push({ text: A[i], changed: false });
      rightParts.push({ text: B[j], changed: false });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      lBuf += A[i]; i++;
    } else {
      rBuf += B[j]; j++;
    }
  }
  while (i < na) { lBuf += A[i]; i++; }
  while (j < nb) { rBuf += B[j]; j++; }
  flush();
  // 把连续 changed 合并标注
  const merge = (parts: CharPart[]) => {
    const out: CharPart[] = [];
    for (const p of parts) {
      const last = out[out.length - 1];
      if (last && last.changed === p.changed) last.text += p.text;
      else out.push({ ...p });
    }
    return out;
  };
  return { left: merge(leftParts), right: merge(rightParts) };
}

export default function TextDiff() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreTrailWS, setIgnoreTrailWS] = useState(true);
  const [ignoreEmpty, setIgnoreEmpty] = useState(false);

  const { rows, addCount, delCount, modCount } = useMemo(() => {
    const a = splitLines(left), b = splitLines(right);
    const rows = diffLines(a, b, ignoreCase, ignoreTrailWS, ignoreEmpty);
    let add = 0, del = 0, mod = 0;
    rows.forEach(r => { if (r.type === 'add') add++; else if (r.type === 'del') del++; else if (r.type === 'mod') mod++; });
    return { rows, addCount: add, delCount: del, modCount: mod };
  }, [left, right, ignoreCase, ignoreTrailWS, ignoreEmpty]);

  return (
    <div className="diff-tool">
      <div className="diff-toolbar">
        <label className="opt-check"><input type="checkbox" checked={ignoreTrailWS} onChange={e => setIgnoreTrailWS(e.target.checked)} /> 忽略行尾空白</label>
        <label className="opt-check"><input type="checkbox" checked={ignoreEmpty} onChange={e => setIgnoreEmpty(e.target.checked)} /> 忽略空行差异</label>
        <label className="opt-check"><input type="checkbox" checked={ignoreCase} onChange={e => setIgnoreCase(e.target.checked)} /> 忽略大小写</label>
        <span className="diff-stats-inline">
          <span className="diff-add">+{addCount}</span>
          <span className="diff-del">-{delCount}</span>
          <span className="diff-mod">~{modCount}</span>
        </span>
      </div>

      <div className="diff-inputs">
        <div>
          <div className="pane-head">
            <span>原始文本</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setLeft('')}>清空</button>
          </div>
          <textarea className="text-area" value={left} onChange={e => setLeft(e.target.value)} placeholder="粘贴原文…" spellCheck={false} />
        </div>
        <div>
          <div className="pane-head">
            <span>修改文本</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setRight('')}>清空</button>
          </div>
          <textarea className="text-area" value={right} onChange={e => setRight(e.target.value)} placeholder="粘贴修改后文本…" spellCheck={false} />
        </div>
      </div>

      <div className="diff-result">
        <div className="pane-head"><span>差异结果（并排高亮）</span></div>
        <div className="diff-table">
          {rows.length === 0 ? (
            <div className="diff-empty">两个文本相同，或尚未输入内容</div>
          ) : (
            rows.map((r, idx) => <DiffRowView key={idx} row={r} />)
          )}
        </div>
      </div>
    </div>
  );
}

function DiffRowView({ row }: { row: DiffRow }) {
  let cls = 'diff-row ';
  if (row.type === 'add') cls += 'row-add';
  else if (row.type === 'del') cls += 'row-del';
  else if (row.type === 'mod') cls += 'row-mod';

  const modParts = row.type === 'mod' && row.left !== undefined && row.right !== undefined
    ? charDiff(row.left, row.right) : null;

  return (
    <div className={cls}>
      <span className="diff-gutter diff-gutter-left">{row.leftNum ?? ''}</span>
      <span className="diff-cell diff-cell-left">
        {row.type === 'add' ? '' : (
          modParts ? modParts.left.map((p, i) => <span key={i} className={p.changed ? 'char-del' : ''}>{p.text}</span>) : row.left
        )}
      </span>
      <span className="diff-gutter diff-gutter-right">{row.rightNum ?? ''}</span>
      <span className="diff-cell diff-cell-right">
        {row.type === 'del' ? '' : (
          modParts ? modParts.right.map((p, i) => <span key={i} className={p.changed ? 'char-add' : ''}>{p.text}</span>) : row.right
        )}
      </span>
    </div>
  );
}
