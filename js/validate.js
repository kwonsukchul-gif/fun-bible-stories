// 입력 검증 — 콘텐츠 파일(운영자 입력)과 주소(사용자 입력)를 모두 여기서 검사합니다.
// 규칙은 v1_기획서.md 4절(US-1~US-5)의 완료 조건을 그대로 옮긴 것입니다.

export const EXPRESSIONS = ['basic', 'surprise', 'happy', 'sad'];

export const LIMITS = {
  panelsMin: 4,
  panelsMax: 6,
  panelText: 40,     // US-1: 말풍선 40자 이하
  intro: 40,
  title: 40,
  summary: 40,
  sentence: 30,      // US-3: 한 문장 30자 이하
  mission: 60,
  question: 60,
  name: 10,
  series: 20,
};

const BIBLE_BOOKS = [
  '창세기', '출애굽기', '레위기', '민수기', '신명기', '여호수아', '사사기', '룻기',
  '사무엘상', '사무엘하', '열왕기상', '열왕기하', '역대상', '역대하', '에스라', '느헤미야',
  '에스더', '욥기', '시편', '잠언', '전도서', '아가', '이사야', '예레미야', '예레미야애가',
  '에스겔', '다니엘', '호세아', '요엘', '아모스', '오바댜', '요나', '미가', '나훔', '하박국',
  '스바냐', '학개', '스가랴', '말라기',
  '마태복음', '마가복음', '누가복음', '요한복음', '사도행전', '로마서', '고린도전서', '고린도후서',
  '갈라디아서', '에베소서', '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서',
  '디모데전서', '디모데후서', '디도서', '빌레몬서', '히브리서', '야고보서', '베드로전서',
  '베드로후서', '요한일서', '요한이서', '요한삼서', '유다서', '요한계시록',
];

const STORY_ID_RE = /^[a-z0-9][a-z0-9-]{2,39}$/;
const CHARACTER_ID_RE = /^[a-z0-9][a-z0-9-]{0,29}$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
// US-2: `책이름 장:절–장:절` 형식으로 통일
const REFERENCE_RE = /^(\S+) (\d{1,3}):(\d{1,3})–(\d{1,3}):(\d{1,3})$/;

// 한글도 한 글자 = 1자로 셉니다.
export const charLength = (s) => [...s].length;

export function isValidDateString(value) {
  if (typeof value !== 'string') return false;
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
}

export function isValidStoryId(value) {
  return typeof value === 'string' && STORY_ID_RE.test(value);
}

// 붙임표(-)나 물결(~)로 적어도 –(en dash)로 맞춰 줍니다.
export function normalizeReference(value) {
  return typeof value === 'string' ? value.trim().replace(/\s*[-~]\s*/g, '–') : value;
}

function checkText(errors, label, value, max, { required = true } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) errors.push(`${label}: 비어 있음`);
    return;
  }
  if (typeof value !== 'string') {
    errors.push(`${label}: 글자가 아님`);
    return;
  }
  if (value.trim() === '') {
    errors.push(`${label}: 공백만 있음`);
    return;
  }
  const len = charLength(value);
  if (len > max) errors.push(`${label}: ${max}자 초과 (${len}자)`);
}

function checkReference(errors, value) {
  if (typeof value !== 'string' || value === '') {
    errors.push('reference(장절): 비어 있음');
    return;
  }
  const m = REFERENCE_RE.exec(value);
  if (!m) {
    errors.push(`reference(장절): 형식 오류 "${value}" → 예: 창세기 6:9–9:17`);
    return;
  }
  const [, book, c1, v1, c2, v2] = m;
  if (!BIBLE_BOOKS.includes(book)) errors.push(`reference(장절): 성경 책 이름이 아님 "${book}"`);
  const start = Number(c1) * 1000 + Number(v1);
  const end = Number(c2) * 1000 + Number(v2);
  if ([c1, v1, c2, v2].some((n) => Number(n) < 1)) errors.push('reference(장절): 장·절은 1 이상');
  else if (end < start) errors.push('reference(장절): 끝 장절이 시작보다 앞섬');
}

// 이야기 한 편을 검사해 오류 문장 목록을 돌려줍니다. 빈 배열이면 통과.
export function validateStory(story) {
  const errors = [];
  if (!story || typeof story !== 'object' || Array.isArray(story)) return ['이야기 한 편의 형식이 아님'];

  if (!isValidStoryId(story.id)) errors.push('id: 영어 소문자·숫자·붙임표 3~40자 (예: day03-noah)');
  if (!isValidDateString(story.publishDate)) errors.push('publishDate(공개일): YYYY-MM-DD 형식의 실제 날짜가 아님');

  const ch = story.character;
  if (!ch || typeof ch !== 'object') {
    errors.push('character(인물): 비어 있음');
  } else {
    if (!CHARACTER_ID_RE.test(ch.id ?? '')) errors.push('character.id: 영어 소문자·숫자·붙임표만 (이미지 파일 이름에 쓰임)');
    checkText(errors, 'character.name(이름)', ch.name, LIMITS.name);
    checkText(errors, 'character.intro(자기소개)', ch.intro, LIMITS.intro);
  }

  checkText(errors, 'title(제목)', story.title, LIMITS.title);
  checkText(errors, 'summary(한 줄 소개)', story.summary, LIMITS.summary, { required: false });
  checkText(errors, 'series(시리즈)', story.series, LIMITS.series, { required: false });
  checkReference(errors, story.reference);

  if (!Array.isArray(story.panels)) {
    errors.push('panels(컷): 목록이 아님');
  } else {
    const n = story.panels.length;
    if (n < LIMITS.panelsMin || n > LIMITS.panelsMax) {
      errors.push(`panels(컷): ${LIMITS.panelsMin}~${LIMITS.panelsMax}개여야 함 (지금 ${n}개)`);
    }
    story.panels.forEach((p, i) => {
      const label = `panels[${i + 1}번째 컷]`;
      if (!p || typeof p !== 'object') {
        errors.push(`${label}: 형식 오류`);
        return;
      }
      if (!EXPRESSIONS.includes(p.expression)) {
        errors.push(`${label}.expression(표정): ${EXPRESSIONS.join('/')} 중 하나여야 함`);
      }
      checkText(errors, `${label}.text(말풍선)`, p.text, LIMITS.panelText);
    });
  }

  const ap = story.apply;
  if (!ap || typeof ap !== 'object') {
    errors.push('apply(적용 카드): 비어 있음');
  } else {
    checkText(errors, 'apply.sentence(한 문장)', ap.sentence, LIMITS.sentence);
    checkText(errors, 'apply.mission(실천 미션)', ap.mission, LIMITS.mission);
    checkText(errors, 'apply.question(생각 질문)', ap.question, LIMITS.question);
  }
  return errors;
}

// 전체 목록 검사: 통과한 편만 공개 대상으로 돌려줍니다 (US-5: 오류 편은 비공개).
export function validateAll(data) {
  const list = Array.isArray(data) ? data : data?.stories;
  if (!Array.isArray(list)) {
    return { valid: [], invalid: [{ id: '(파일 전체)', errors: ['"stories" 목록을 찾을 수 없음'] }] };
  }

  const valid = [];
  const invalid = [];
  const seenIds = new Set();
  const seenDates = new Set();

  list.forEach((raw, index) => {
    const story = raw && typeof raw === 'object' ? { ...raw, reference: normalizeReference(raw.reference) } : raw;
    const errors = validateStory(story);
    const id = story?.id ?? `(${index + 1}번째 항목)`;
    if (isValidStoryId(story?.id)) {
      if (seenIds.has(story.id)) errors.push('id: 다른 편과 겹침');
      seenIds.add(story.id);
    }
    if (isValidDateString(story?.publishDate)) {
      if (seenDates.has(story.publishDate)) errors.push('publishDate(공개일): 다른 편과 같은 날짜');
      seenDates.add(story.publishDate);
    }
    if (errors.length) invalid.push({ id, publishDate: story?.publishDate, errors });
    else valid.push(story);
  });

  valid.sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  return { valid, invalid };
}
