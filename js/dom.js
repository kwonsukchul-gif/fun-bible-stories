import { CHARACTER_IMAGE_DIR, CHARACTER_IMAGE_EXT } from './config.js';

// 요소 만들기. 글자는 항상 text node로 넣어 콘텐츠 속 HTML이 실행되지 않게 합니다.
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

const imagePath = (characterId, expression) =>
  `${CHARACTER_IMAGE_DIR}/${characterId}_${expression}.${CHARACTER_IMAGE_EXT}`;

// 이름 첫 글자가 든 금색 원 — 이미지가 없을 때의 대체 이미지
export function initialCircle(name, className = '') {
  return el('span', { class: `initial ${className}`, 'aria-hidden': 'true' }, [...name][0] ?? '?');
}

// 캐릭터 이미지: 지정 표정 → 기본 표정 → 이름 원 순서로 대체 (화면설계 S1/S2 오류 상태)
export function characterImage(character, expression = 'basic', className = '') {
  const img = el('img', { class: className, src: imagePath(character.id, expression), alt: '', decoding: 'async' });
  let triedBasic = expression === 'basic';
  img.addEventListener('error', function onError() {
    if (!triedBasic) {
      triedBasic = true;
      img.src = imagePath(character.id, 'basic');
      return;
    }
    img.removeEventListener('error', onError);
    img.replaceWith(initialCircle(character.name, className));
  });
  return img;
}

// 한국어 조사: 받침이 있으면 '이', 없으면 '가'
export function subjectParticle(word) {
  const last = [...word].pop();
  const code = last ? last.charCodeAt(0) - 0xac00 : -1;
  if (code < 0 || code > 11171) return '이(가)';
  return code % 28 === 0 ? '가' : '이';
}

const ORDINALS = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];
export const dayLabel = (n) => (n >= 1 && n <= ORDINALS.length ? `${ORDINALS[n - 1]} 날` : `${n}일째`);

let toastTimer;
export function toast(message) {
  const box = document.getElementById('toast');
  if (!box) return;
  box.textContent = message;
  box.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { box.hidden = true; }, 2000);
}
