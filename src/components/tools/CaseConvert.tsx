import { useState, useMemo } from 'react';

type Mode =
  | 'upper' | 'lower' | 'title' | 'sentence' | 'camel'
  | 'pascal' | 'snake' | 'kebab' | 'constant' | 'dot';

const MODES: Array<{ id: Mode; label: string; example: string }> = [
  { id: 'upper', label: '全大写', example: 'HELLO WORLD' },
  { id: 'lower', label: '全小写', example: 'hello world' },
  { id: 'title', label: 'Title Case', example: 'Hello World' },
  { id: 'sentence', label: 'Sentence case', example: 'Hello world' },
  { id: 'camel', label: 'camelCase', example: 'helloWorld' },
  { id: 'pascal', label: 'PascalCase', example: 'HelloWorld' },
  { id: 'snake', label: 'snake_case', example: 'hello_world' },
  { id: 'kebab', label: 'kebab-case', example: 'hello-world' },
  { id: 'constant', label: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
  { id: 'dot', label: 'dot.case', example: 'hello.world' },
];

// 把任意字符串拆为单词数组（保留中文作为独立词边界）
function splitWords(input: string): string[] {
  // 在非字母数字与汉字之间也切分；汉字按单个字切分
  // 先在汉字两侧加空格
  const spaced = input.replace(/([\u4e00-\u9fff\u3400-\u4dbf])/g, ' $1 ');
  // 在大写字母前且后跟小写字母处加空格（处理 helloWorld → hello World）
  const camelSplit = spaced.replace(/([a-z])([A-Z])/g, '$1 $2');
  // 用非字母数字汉字字符作为分隔符
  return camelSplit.split(/[^a-zA-Z0-9\u4e00-\u9fff\u3400-\u4dbf]+/).filter(Boolean);
}

function transform(input: string, mode: Mode): string {
  if (!input) return '';
  const words = splitWords(input);

  switch (mode) {
    case 'upper':
      return input.toUpperCase();
    case 'lower':
      return input.toLowerCase();
    case 'title': {
      // 每个英文单词首字母大写，其余小写；中文不变
      return words
        .map(w => {
          if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(w[0])) return w;
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join(' ');
    }
    case 'sentence': {
      // 仅首字母大写，其余小写（按英文段落规则，但本工具把整段当一个句子）
      const lower = input.toLowerCase();
      // 找第一个字母或汉字
      const m = lower.match(/[a-zA-Z\u4e00-\u9fff\u3400-\u4dbf]/);
      if (!m || m.index === undefined) return lower;
      return lower.slice(0, m.index) + lower[m.index].toUpperCase() + lower.slice(m.index + 1);
    }
    case 'camel': {
      return words
        .map((w, i) => {
          if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(w[0])) return w;
          if (i === 0) return w.toLowerCase();
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join('');
    }
    case 'pascal': {
      return words
        .map(w => {
          if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(w[0])) return w;
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join('');
    }
    case 'snake':
      return words.map(w => w.toLowerCase()).join('_');
    case 'kebab':
      return words.map(w => w.toLowerCase()).join('-');
    case 'constant':
      return words.map(w => w.toUpperCase()).join('_');
    case 'dot':
      return words.map(w => w.toLowerCase()).join('.');
  }
}

export default function CaseConvert() {
  const [input, setInput] = useState('');

  const results = useMemo(() => {
    return MODES.map(m => ({ ...m, output: transform(input, m.id) }));
  }, [input]);

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="cc-tool">
      <div className="cc-input-section">
        <textarea
          className="cc-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入或粘贴要转换的文本…&#10;&#10;示例：hello world / Hello World / hello_world / hello-world"
          spellCheck={false}
        />
        <div className="cc-input-meta">
          <span>{input.length} 字符</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setInput('')}>清空</button>
        </div>
      </div>

      <div className="cc-results">
        {results.map(r => (
          <div key={r.id} className="cc-row">
            <div className="cc-row-head">
              <span className="cc-mode-label">{r.label}</span>
              <span className="cc-mode-example">{r.example}</span>
              <button className="btn btn-sm btn-ghost" onClick={() => copy(r.output)} disabled={!r.output}>复制</button>
            </div>
            <div className="cc-row-output">{r.output || <span className="cc-placeholder">{`（输入文本后显示 ${r.label} 结果）`}</span>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
