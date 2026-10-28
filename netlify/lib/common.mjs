// 세 함수(config, record, teacher)가 함께 쓰는 저장소·설정 도우미
import { getStore } from "@netlify/blobs";

export const NQ = 19;
export const MODES = ["positive", "mixed"]; // positive: 최고차항 양수만, mixed: 양수·음수 섞인 버전
export const DEFAULT_MODE = "positive";

export const recordStore = () => getStore({ name: "shape-place-records", consistency: "strong" });
const settingsStore = () => getStore({ name: "shape-place-settings", consistency: "strong" });

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export async function getMode() {
  const s = await settingsStore().get("settings", { type: "json" });
  return MODES.includes(s?.mode) ? s.mode : DEFAULT_MODE;
}

export async function setMode(mode) {
  await settingsStore().setJSON("settings", { mode, updatedAt: Date.now() });
}

export async function listRecords() {
  const store = recordStore();
  const { blobs } = await store.list();
  const rows = await Promise.all(blobs.map(async (b) => {
    const v = await store.get(b.key, { type: "json" });
    return v ? { id: b.key, ...v } : null;
  }));
  return rows.filter(Boolean).sort((a, b) => b.at - a.at);
}
