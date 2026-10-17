import { isValidDateString } from './validate.js';

const pad = (n) => String(n).padStart(2, '0');

// 기기 시간 기준 오늘 (YYYY-MM-DD)
export function todayString(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// 검수용 날짜 바꾸기: 주소 끝에 ?date=2026-10-17 을 붙이면 그 날짜로 봅니다.
// 사용자 입력이므로 형식과 실제 날짜 여부를 검사하고, 틀리면 무시합니다.
export function readDateOverride(search = location.search) {
  const raw = new URLSearchParams(search).get('date');
  if (raw === null) return null;
  if (!isValidDateString(raw)) {
    console.warn(`[주소 오류] date=${raw.slice(0, 20)} 는 올바른 날짜가 아니라 무시합니다. 예: ?date=2026-10-17`);
    return null;
  }
  return raw;
}
