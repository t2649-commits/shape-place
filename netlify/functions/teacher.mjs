// 선생님용 API: POST /api/teacher
//   { password, action: "check" }               → 비밀번호 확인, 현재 버전 반환
//   { password, action: "setMode", mode }       → 버전 변경 ("positive" 양수만 / "mixed" 섞인 버전)
//   { password, action: "list" }                → 학생 기록 목록 (최근 순)
//   { password, action: "reset" }               → 모든 기록 삭제
// 비밀번호는 넷리파이 환경 변수 TEACHER_PASSWORD 에 저장해요. 코드에는 들어 있지 않아요.
import { createHash, timingSafeEqual } from "node:crypto";
import { json, getMode, setMode, listRecords, recordStore, MODES } from "../lib/common.mjs";

const readSecret = () => globalThis.Netlify?.env?.get?.("TEACHER_PASSWORD") ?? process.env.TEACHER_PASSWORD ?? "";
const digest = (s) => createHash("sha256").update(String(s)).digest();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (req) => {
  if (req.method !== "POST") return json({ error: "지원하지 않는 요청이에요." }, 405);

  const secret = readSecret();
  if (!secret) return json({ error: "넷리파이에 TEACHER_PASSWORD 환경 변수가 아직 없어요. 등록한 뒤 다시 배포해 주세요." }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ error: "잘못된 요청이에요." }, 400); }

  if (!timingSafeEqual(digest(body?.password ?? ""), digest(secret))) {
    await sleep(800);
    return json({ error: "비밀번호가 맞지 않아요." }, 401);
  }

  const action = body?.action;
  if (action === "check") return json({ ok: true, mode: await getMode() });

  if (action === "setMode") {
    if (!MODES.includes(body?.mode)) return json({ error: "알 수 없는 버전이에요." }, 400);
    await setMode(body.mode);
    return json({ ok: true, mode: body.mode });
  }

  if (action === "list") return json({ ok: true, records: await listRecords() });

  if (action === "reset") {
    const store = recordStore();
    const { blobs } = await store.list();
    for (const b of blobs) await store.delete(b.key);
    return json({ ok: true, deleted: blobs.length });
  }

  return json({ error: "알 수 없는 요청이에요." }, 400);
};

export const config = { path: "/api/teacher" };
