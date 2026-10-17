import { el } from '../dom.js';
import { SITE_NAME } from '../config.js';

export const storyHref = (id) => `#/story/${encodeURIComponent(id)}`;

function logoMark() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '22');
  svg.setAttribute('height', '22');
  [['M3 5.5c3-1.2 6-1.2 9 .6v13c-3-1.8-6-1.8-9-.6v-13Z', '#FBF6EE'],
   ['M21 5.5c-3-1.2-6-1.2-9 .6v13c3-1.8 6-1.8 9-.6v-13Z', '#F5E9D3']].forEach(([d, fill]) => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', fill);
    svg.append(p);
  });
  return el('span', { class: 'logo-mark', 'aria-hidden': 'true' }, svg);
}

// 상단바: 로고(→홈), 선택적으로 뒤로 버튼과 오른쪽 배지
export function topbar({ onBack, pill } = {}) {
  return el('header', { class: 'topbar' },
    el('div', { class: 'topbar-left' },
      onBack && el('button', { class: 'icon-btn', type: 'button', 'aria-label': '뒤로 가기', onclick: onBack }, '←'),
      el('a', { class: 'logo', href: '#/', 'aria-label': `${SITE_NAME} 홈` },
        logoMark(),
        el('span', { class: 'logo-text' }, '재미있는 ', el('b', {}, '성경이야기')))),
    pill && el('span', { class: 'day-pill' }, pill));
}

export function footer() {
  return el('footer', { class: 'footer' },
    el('span', { class: 'hand' }, '하루 하나, 2분이면 충분해요'),
    `${SITE_NAME} · 매일 새 이야기가 열려요`);
}

export function testBanner(date) {
  return el('p', { class: 'test-banner', role: 'note' }, `검수용 날짜로 보는 중: ${date}`);
}

// 데이터 로드 실패 (S1·S2 오류 상태)
export function errorView({ onRetry, showHome }) {
  return [
    topbar(),
    el('section', { class: 'state-box' },
      el('p', { class: 'state-emoji', 'aria-hidden': 'true' }, '📡'),
      el('h1', { class: 'state-title' }, '이야기를 불러오지 못했어요.'),
      el('p', { class: 'state-text' }, '잠시 후 다시 시도해 주세요. 계속 안 되면 인터넷 연결도 확인해 주세요.'),
      el('button', { class: 'btn-primary', type: 'button', onclick: onRetry }, '다시 시도'),
      showHome && el('a', { class: 'text-link', href: '#/' }, '홈으로')),
  ];
}
