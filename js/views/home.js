// S1 홈 — 오늘의 이야기 + 진행 표시 + 지난 이야기 (US-4)
import { el, characterImage, subjectParticle, dayLabel } from '../dom.js';
import { topbar, footer, storyHref } from './common.js';

const MAX_DOTS = 14; // 이보다 많으면 점 대신 글자로만 진행 표시

function featuredCard(story, isToday) {
  const name = story.character.name;
  return el('a', { class: 'today', href: storyHref(story.id), 'aria-label': `${isToday ? '오늘의' : '최근'} 이야기 — ${story.title} — ${name} 이야기 듣기` },
    el('div', { class: 'today-hero' },
      el('span', { class: 'badge-today' }, isToday ? '오늘' : '최근'),
      el('p', { class: 'bubble' }, story.character.intro),
      characterImage(story.character, 'basic', 'hero-img')),
    el('div', { class: 'today-body' },
      el('div', { class: 'meta' },
        el('span', { class: 'chip' }, story.reference),
        story.series && el('span', { class: 'chip ghost' }, story.series)),
      el('h2', {}, story.title),
      story.summary && el('p', { class: 'who' }, story.summary),
      el('span', { class: 'btn-primary' }, `${name} 이야기 듣기 `, el('span', { 'aria-hidden': 'true' }, '→')),
      el('p', { class: 'time' }, '⏱ 2분이면 다 볼 수 있어요')));
}

function progress(position, total) {
  const showDots = total <= MAX_DOTS;
  return el('section', { class: 'progress', 'aria-label': '이야기 진행' },
    el('div', { class: 'progress-head' },
      el('h3', {}, '전체 이야기'),
      el('span', {}, `${total}편 중 ${position}번째`)),
    showDots && el('div', { class: 'dots', 'aria-hidden': 'true', style: `grid-template-columns: repeat(${total}, 1fr)` },
      Array.from({ length: total }, (_, i) =>
        el('span', { class: `dot${i + 1 < position ? ' done' : ''}${i + 1 === position ? ' now' : ''}` }))));
}

function pastRow(story, dayNumber) {
  return el('li', {},
    el('a', { class: 'row', href: storyHref(story.id) },
      el('span', { class: 'avatar' }, characterImage(story.character, 'basic', 'avatar-img')),
      el('span', { class: 'row-text' },
        el('span', { class: 'row-title' }, story.title),
        el('span', { class: 'row-sub' }, `${dayLabel(dayNumber)} · ${story.character.name} · ${story.reference}`)),
      el('span', { class: 'row-arrow', 'aria-hidden': 'true' }, '›')));
}

export function renderHome({ all, published, today }) {
  const dayNumberOf = (story) => all.indexOf(story) + 1;
  const todayStory = published.find((s) => s.publishDate === today);
  const featured = todayStory ?? published[published.length - 1];

  // 공개된 편이 하나도 없을 때 (출시 전)
  if (!featured) {
    return [
      topbar(),
      el('section', { class: 'state-box' },
        el('p', { class: 'state-emoji', 'aria-hidden': 'true' }, '🌱'),
        el('h1', { class: 'state-title' }, '첫 이야기가 곧 열려요!'),
        el('p', { class: 'state-text' }, '조금만 기다려 주세요.')),
      footer(),
    ];
  }

  const name = featured.character.name;
  const past = published.filter((s) => s !== featured).reverse();

  return [
    topbar({ pill: dayLabel(dayNumberOf(featured)) }),
    el('section', { class: 'greeting' },
      el('p', { class: 'hand' }, todayStory ? '오늘의 이야기' : '최근 이야기'),
      todayStory
        ? el('h1', {}, `오늘은 ${name}${subjectParticle(name)} 찾아왔어요!`)
        : el('h1', {}, '오늘 이야기는 준비 중이에요.', el('br'), el('small', {}, '지난 이야기를 먼저 만나 볼까요?'))),
    featuredCard(featured, Boolean(todayStory)),
    progress(dayNumberOf(featured), all.length),
    el('section', { class: 'past' },
      el('h3', {}, '지난 이야기'),
      past.length
        ? el('ul', { class: 'list' }, past.map((s) => pastRow(s, dayNumberOf(s))))
        : el('p', { class: 'empty' }, '내일부터 여기에 지난 이야기가 쌓여요 📖')),
    footer(),
  ];
}
