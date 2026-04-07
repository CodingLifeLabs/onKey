# 템플릿 콘텐츠 & 에디터 고도화 — Plan

## 범위

이 feature에서 다루는 것:
- [x] Contact 블록 에디터/뷰어 구현
- [x] Video 블록 에디터/뷰어 구현
- [x] 에디터 UX 개선 (블록 사이 삽입, 복제, 저장 피드백, 이탈 경고, 빈 상태 가이드)

이 feature에서 다루지 않는 것:
- 시스템 기본 템플릿 콘텐츠 보강 (별도 feature)
- 드래그앤드롭 블록 정렬 (PROJECT.md 결정사항 — ▲▼ 버튼 유지)

---

## 체크리스트

### Domain

- [ ] `block-utils.ts` — `createBlock()`에 `contact`, `video` 케이스 추가
- [ ] `block-utils.test.ts` — contact, video 블록 기본 content 테스트 추가

### Presentation — 에디터

- [ ] `contact-editor.tsx` — 비상연락처 편집기 (title + entries[] CRUD)
- [ ] `video-editor.tsx` — YouTube/Vimeo URL 입력 + embed URL 자동 변환 + 미리보기
- [ ] `block-toolbar.tsx` — blockOptions에 `contact`, `video` 추가
- [ ] `block-list.tsx` — BlockEditor switch에 contact/video 케이스 + 타입 라벨 추가
- [ ] `block-list.tsx` — 블록 복제 버튼 추가 (Copy 아이콘)
- [ ] `block-list.tsx` — 블록 사이 (+) 삽입 포인트 UI 추가
- [ ] `template-editor.tsx` — 변경 감지 + `beforeunload` 이탈 경고
- [ ] `template-editor.tsx` — 저장 성공/실패 toast 피드백 (`alert` → toast)
- [ ] `template-editor.tsx` — 빈 에디터 가이드 텍스트 개선

### Presentation — 뷰어 (퍼블릭 페이지)

- [ ] `contact-viewer.tsx` — 연락처 카드 렌더링 (전화번호 클릭 통화)
- [ ] `video-viewer.tsx` — iframe 임베드 렌더링 (반응형)
- [ ] `block-viewer.tsx` — switch에 contact/video 케이스 추가

### Data

- [ ] `block-utils.ts`에 `duplicateBlock()` 함수 추가

### Test

- [ ] `block-utils.test.ts` — video, contact createBlock 테스트
- [ ] `block-utils.test.ts` — duplicateBlock 테스트
