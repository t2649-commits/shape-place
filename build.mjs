// src 의 화면 파일을 완전한 HTML 문서로 감싸 public 폴더에 만들어요.
//   src/game.html    → public/index.html          (학생용, 사이트주소/)
//   src/teacher.html → public/teacher/index.html  (선생님용, 사이트주소/teacher/)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

function wrap(srcPath, outPath, marker) {
  const src = readFileSync(srcPath, "utf8");
  const cut = src.indexOf(marker);
  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${src.slice(0, cut)}</head>
<body>
${src.slice(cut)}</body>
</html>
`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  console.log(`${outPath} 생성 완료`);
}

wrap("src/game.html", "public/index.html", '<div class="app">');
wrap("src/teacher.html", "public/teacher/index.html", '<div class="app">');
