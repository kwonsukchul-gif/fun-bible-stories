import { CONTENT_URL, SITE_NAME } from './config.js';
import { validateAll, isValidStoryId } from './validate.js';
import { todayString, readDateOverride } from './dates.js';
import { errorView, testBanner } from './views/common.js';
import { renderHome } from './views/home.js';
import { renderStory, renderNotFound } from './views/story.js';

const root = document.getElementById('app');
const state = { all: [], published: [], today: todayString(), dateOverride: readDateOverride(), loaded: false };
if (state.dateOverride) state.today = state.dateOverride;

async function load() {
  const res = await fetch(CONTENT_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`콘텐츠 파일 HTTP ${res.status}`);
  const data = await res.json();
  const { valid, invalid } = validateAll(data);
  invalid.forEach((s) => console.warn(`[콘텐츠 오류] ${s.id} — 공개하지 않음\n - ${s.errors.join('\n - ')}`));
  state.all = valid;
  state.published = valid.filter((s) => s.publishDate <= state.today);
  state.loaded = true;
}

// 주소도 사용자 입력이므로 형식을 검사합니다: #/ 또는 #/story/{id}
function parseRoute(hash) {
  const path = hash.replace(/^#/, '') || '/';
  if (path === '/') return { name: 'home' };
  const m = /^\/story\/([^/]+)$/.exec(path);
  if (!m) return { name: 'notfound', reason: 'missing' };
  let id = '';
  try { id = decodeURIComponent(m[1]); } catch { /* 깨진 주소 */ }
  if (!isValidStoryId(id)) return { name: 'notfound', reason: 'missing' };
  return { name: 'story', id };
}

// 앱 안에서 이동해 왔으면 브라우저 뒤로, 공유 링크로 바로 들어왔으면 홈으로
let movedInApp = false;
const goBack = () => (movedInApp ? history.back() : location.assign('#/'));

function show(nodes, title) {
  root.replaceChildren(...[].concat(nodes).filter(Boolean));
  if (state.dateOverride) root.prepend(testBanner(state.dateOverride));
  document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  window.scrollTo(0, 0);
}

function render() {
  if (!state.loaded) return;
  const route = parseRoute(location.hash);
  if (route.name === 'home') return show(renderHome(state));

  if (route.name === 'story') {
    const story = state.published.find((s) => s.id === route.id);
    if (story) return show(renderStory(story, { ...state, onBack: goBack }), story.title);
    const locked = state.all.some((s) => s.id === route.id);
    return show(renderNotFound(locked ? 'locked' : 'missing'), '찾을 수 없음');
  }
  show(renderNotFound(route.reason), '찾을 수 없음');
}

async function start() {
  try {
    await load();
    render();
  } catch (err) {
    console.error('[불러오기 실패]', err);
    show(errorView({ onRetry: start, showHome: location.hash.length > 2 }), '오류');
  }
}

window.addEventListener('hashchange', () => {
  movedInApp = true;
  render();
});
start();
