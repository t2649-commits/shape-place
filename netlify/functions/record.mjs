// POST /api/record → { name, correct, total, ms, mode } 학생 한 판의 기록을 저장해요.
// 기록은 선생님 페이지에서만 볼 수 있어요.
import { json, recordStore, NQ, MODES } from "../lib/common.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "지원하지 않는 요청이에요." }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: "잘못된 요청이에요." }, 400); }

  const name = String(body?.name ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, 12);
  const correct = Math.round(Number(body?.correct));
  const ms = Math.round(Number(body?.ms));
  const mode = MODES.includes(body?.mode) ? body.mode : null;

  if (!name) return json({ error: "이름이 비어 있어요." }, 400);
  if (!Number.isInteger(correct) || correct < 0 || correct > NQ) return json({ error: "맞힌 수가 올바르지 않아요." }, 400);
  if (!Number.isFinite(ms) || ms < 0 || ms > 4 * 3600 * 1000) return json({ error: "걸린 시간이 올바르지 않아요." }, 400);
  if (!mode) return json({ error: "버전 정보가 올바르지 않아요." }, 400);

  const at = Date.now();
  const key = `${at}~${Math.random().toString(36).slice(2, 8)}`;
  await recordStore().setJSON(key, { name, correct, total: NQ, ms, mode, at });
  return json({ ok: true });
};

export const config = { path: "/api/record" };
