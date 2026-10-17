// S2 이야기 + S3 적용 카드 (US-1, US-2, US-3, US-4)
import { el, characterImage, toast } from '../dom.js';
import { topbar, footer, storyHref } from './common.js';
import { SITE_NAME } from '../config.js';

// 공유 주소에는 검수용 ?date 같은 쿼리를 싣지 않습니다 (QA US4-4c).
const storyUrl = (id) => `${location.origin}${location.pathname}${storyHref(id)}`;

function panel(character, text, expression, { side = 'left', intro = false } = {}) {
  return el('li', { class: `panel ${side}${intro ? ' intro' : ''}` },
    el('div', { class: 'panel-figure' },
      characterImage(character, expression, 'panel-img'),
      el('span', { class: 'panel-name' }, character.name)),
    el('p', { class: 'panel-bubble' }, text));
}

// 공유: 기기 공유 → 주소 복사 → 직접 복사 안내 (화면설계 S3 오류 상태)
async function share(story, manualBox) {
  const url = storyUrl(story.id);
  if (navigator.share) {
    try {
      await navigator.share({ title: `${story.title} | ${SITE_NAME}`, url });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return; // 사용자가 공유창을 닫음
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast('주소를 복사했어요');
    return;
  } catch { /* 아래 직접 복사로 */ }

  const input = el('input', { type: 'text', value: url, readonly: true, 'aria-label': '이야기 주소' });
  manualBox.replaceChildren(el('strong', {}, '길게 눌러 복사해 주세요'), input);
  manualBox.hidden = false;
  input.focus();
  input.select();
}

export function renderStory(story, { all, published, onBack }) {
  const { character, apply } = story;
  const index = published.indexOf(story);
  const next = published[index + 1];
  const hasUpcoming = all.length > published.length;

  const manualBox = el('div', { class: 'manual-copy', hidden: true, 'aria-live': 'polite' });

  const panels = [
    panel(character, character.intro, 'basic', { intro: true }),
    ...story.panels.map((p, i) => panel(character, p.text, p.expression, { side: i % 2 === 0 ? 'right' : 'left' })),
  ];

  return [
    topbar({ onBack }),
    el('header', { class: 'story-head' },
      el('div', { class: 'meta' },
        el('span', { class: 'chip' }, story.reference),
        story.series && el('span', { class: 'chip ghost' }, story.series)),
      el('h1', {}, story.title)),
    el('ol', { class: 'panels', 'aria-label': `${character.name}의 이야기` }, panels),
    el('p', { class: 'ref-note' }, '📖 이 이야기는 ', el('strong', {}, story.reference), '에 있어요'),

    el('section', { class: 'apply', 'aria-labelledby': 'apply-title' },
      el('p', { class: 'apply-from', id: 'apply-title' },
        el('span', { class: 'avatar' }, characterImage(character, 'happy', 'avatar-img')),
        `${character.name}의 한마디`),
      el('p', { class: 'apply-sentence' }, apply.sentence),
      el('div', { class: 'apply-item' },
        el('span', { class: 'apply-label' }, '오늘의 미션'),
        el('p', {}, apply.mission)),
      el('div', { class: 'apply-item question' },
        el('span', { class: 'apply-label' }, '생각해 보기'),
        el('p', {}, apply.question))),

    el('div', { class: 'actions' },
      el('button', { class: 'btn-primary', type: 'button', onclick: () => share(story, manualBox) }, '공유하기'),
      manualBox,
      next
        ? el('a', { class: 'btn-secondary', href: storyHref(next.id) }, `다음 이야기: ${next.character.name} →`)
        : el('p', { class: 'next-note' }, hasUpcoming ? '다음 이야기는 내일 열려요!' : '지금까지 나온 마지막 이야기예요.'),
      el('a', { class: 'text-link', href: '#/' }, '홈으로')),
    footer(),
  ];
}

// S4 찾을 수 없음
export function renderNotFound(reason) {
  const locked = reason === 'locked';
  return [
    topbar(),
    el('section', { class: 'state-box' },
      el('span', { class: 'initial state-mascot', 'aria-hidden': 'true' }, '?'),
      el('h1', { class: 'state-title' }, locked ? '이 이야기는 아직 열리지 않았어요.' : '앗, 이야기를 찾을 수 없어요.'),
      el('p', { class: 'state-text' }, locked ? '공개일을 기다려 주세요!' : '주소가 맞는지 확인해 주세요.'),
      el('a', { class: 'btn-primary', href: '#/' }, '오늘 이야기 보러 가기')),
    footer(),
  ];
}
