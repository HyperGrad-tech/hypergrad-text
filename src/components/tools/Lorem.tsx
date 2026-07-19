import { useState, useMemo } from 'react';

type Unit = 'paragraph' | 'sentence' | 'word';
type Style = 'latin' | 'cn-zh' | 'cn-garble';

const LATIN_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');

const CN_CHARS = '的那是在了不有人之大这上为个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或把质电第理立法西海通华觉命少北原文世身通深美即许部情品众市林让识候近府次士太修名志精交区组快光空局化技林业示复设林复南准品系范据连任南林取据受改局非观林决布商义往利计林代处响志身确林足低音际林容维养林复红林府际决维装林复身际林据志林系身际决'.split('');

const CN_SENTENCES_TEMPLATES = [
  '在{adj}的{noun}里，{verb}着一段{noun2}。',
  '每当{subj}{verb2}的时候，总会有{adj2}的{noun3}出现。',
  '这里的天空总是{adj3}的颜色，远方的{noun4}在风中{verb3}。',
  '人们{verb4}着{noun5}，仿佛{noun6}就在眼前。',
  '时间会{verb5}一切，包括那些{adj4}的{noun7}。',
];
const ADJ = ['宁静', '喧嚣', '古老', '神秘', '辽阔', '温暖', '清澈', '深邃', '苍茫', '温柔'];
const NOUN = ['山谷', '河流', '城市', '森林', '梦境', '回忆', '故事', '时光', '街巷', '原野'];
const VERB = ['流淌', '沉睡', '飘荡', '回响', '栖息', '隐藏', '绽放', '游走', '停留', '闪烁'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function makeLatinSentence(min = 6, max = 18): string {
  const len = min + Math.floor(Math.random() * (max - min));
  const words: string[] = [];
  for (let i = 0; i < len; i++) words.push(pick(LATIN_WORDS));
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function makeLatinParagraph(): string {
  const n = 3 + Math.floor(Math.random() * 6);
  const arr: string[] = [];
  for (let i = 0; i < n; i++) arr.push(makeLatinSentence());
  return arr.join(' ');
}

function makeCnSentence(): string {
  let t = pick(CN_SENTENCES_TEMPLATES);
  return t
    .replace('{adj}', pick(ADJ)).replace('{noun}', pick(NOUN))
    .replace('{verb}', pick(VERB)).replace('{noun2}', pick(NOUN))
    .replace('{subj}', pick(['风', '雨', '月', '云', '人']))
    .replace('{verb2}', pick(['吹过', '落下', '升起', '散去', '流走']))
    .replace('{adj2}', pick(ADJ)).replace('{noun3}', pick(NOUN))
    .replace('{adj3}', pick(ADJ)).replace('{noun4}', pick(NOUN))
    .replace('{verb3}', pick(VERB))
    .replace('{verb4}', pick(['寻找', '等待', '怀念', '追逐', '铭记']))
    .replace('{noun5}', pick(NOUN)).replace('{noun6}', pick(NOUN))
    .replace('{verb5}', pick(['带走', '改变', '治愈', '冲淡', '见证']))
    .replace('{adj4}', pick(ADJ)).replace('{noun7}', pick(NOUN));
}

function makeCnParagraph(): string {
  const n = 2 + Math.floor(Math.random() * 4);
  const arr: string[] = [];
  for (let i = 0; i < n; i++) arr.push(makeCnSentence());
  return arr.join('');
}

function makeGarble(count: number): string {
  // 拉丁字母混排的伪中文风格乱文
  let s = '';
  for (let i = 0; i < count; i++) {
    s += pick(LATIN_WORDS) + ' ';
    if ((i + 1) % 7 === 0) s += '\n';
  }
  return s.trim();
}

export default function Lorem() {
  const [unit, setUnit] = useState<Unit>('paragraph');
  const [style, setStyle] = useState<Style>('latin');
  const [count, setCount] = useState(3);
  const [seed, setSeed] = useState(0); // 触发重新生成

  const output = useMemo(() => {
    // 依赖 seed 触发随机
    void seed;
    if (style === 'cn-garble') {
      if (unit === 'paragraph') {
        const arr: string[] = [];
        for (let i = 0; i < count; i++) arr.push(makeGarble(40 + Math.floor(Math.random() * 30)));
        return arr.join('\n\n');
      }
      if (unit === 'sentence') return Array.from({ length: count }, () => makeGarble(12)).join('\n');
      return makeGarble(count);
    }
    const mk = style === 'latin'
      ? (unit === 'paragraph' ? makeLatinParagraph : unit === 'sentence' ? makeLatinSentence : () => pick(LATIN_WORDS))
      : (unit === 'paragraph' ? makeCnParagraph : unit === 'sentence' ? makeCnSentence : () => pick(CN_CHARS));
    if (unit === 'word') return Array.from({ length: count }, () => mk()).join(style === 'latin' ? ' ' : '');
    if (unit === 'sentence') return Array.from({ length: count }, () => mk()).join('\n');
    return Array.from({ length: count }, () => mk()).join('\n\n');
  }, [unit, style, count, seed]);

  const copy = () => navigator.clipboard.writeText(output);

  return (
    <div className="lorem-tool">
      <div className="lorem-toolbar">
        <div className="seg-group">
          <span className="seg-label">风格：</span>
          <select className="select" value={style} onChange={e => setStyle(e.target.value as Style)}>
            <option value="latin">Lorem ipsum（拉丁）</option>
            <option value="cn-zh">中文假文（语义无意义）</option>
            <option value="cn-garble">中文乱文（字母混排）</option>
          </select>
        </div>
        <div className="seg-group">
          <span className="seg-label">单位：</span>
          {(['paragraph', 'sentence', 'word'] as Unit[]).map(u => (
            <button key={u} className={`seg-btn ${unit === u ? 'active' : ''}`} onClick={() => setUnit(u)}>
              {u === 'paragraph' ? '段落' : u === 'sentence' ? '句子' : '单词/字'}
            </button>
          ))}
        </div>
        <label className="opt-inline">
          数量：
          <input className="input num-input" type="number" min={1} max={50} value={count} onChange={e => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))} />
        </label>
        <button className="btn btn-sm btn-primary" onClick={() => setSeed(s => s + 1)}>重新生成</button>
        <button className="btn btn-sm btn-secondary" onClick={copy}>复制结果</button>
      </div>

      <div className="lorem-output">
        <div className="pane-head">
          <span>生成结果</span>
          <span className="pane-meta">{[...output].length} 字符</span>
        </div>
        <div className="lorem-display">{output || '点击「重新生成」生成假文…'}</div>
      </div>
    </div>
  );
}
