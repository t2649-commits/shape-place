// GET /api/config → { mode }  학생 화면이 시작할 때 선생님이 고른 버전을 받아 가요.
import { json, getMode } from "../lib/common.mjs";

export default async (req) => {
  if (req.method !== "GET") return json({ error: "지원하지 않는 요청이에요." }, 405);
  return json({ mode: await getMode() });
};

export const config = { path: "/api/config" };
