# Amway Size Converter — 서버(코어)
로더 플러그인이 실행될 때마다 이 저장소의 `core/` 파일을 받아서 실행합니다.

- `core/code.js`, `core/ui.html` — 변환 플러그인 본체 (수정은 여기만)
- `core/version.json` — `version`을 올리면 팀원들이 다음 실행 때 새로 받음
  - `ref`: 평소 `"main"`. 문제가 생기면 예전 커밋 번호(예: `"a1b2c3d"`)로 바꾸면 그 버전으로 즉시 되돌림
