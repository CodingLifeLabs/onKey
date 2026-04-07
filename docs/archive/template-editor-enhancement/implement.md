## 1. Domain / Utilities
- [x] `src/lib/block-utils.ts`에 `VideoBlock`, `ContactBlock` 초기화 로직 추가
- [x] `src/lib/block-utils.ts`에 `duplicateBlock` 유틸리티 함수 추가
- [x] `src/lib/__tests__/block-utils.test.ts`에 추가된 유틸리티 함수 및 초기화 로직 테스트 코드 작성

## 2. Editor Presentation
- [x] `ContactEditor` 구현 (`src/components/editor/blocks/contact-editor.tsx`)
- [x] `VideoEditor` 구현 (`src/components/editor/blocks/video-editor.tsx`)
- [x] Toolbar(`block-toolbar.tsx`)에 비상연락처 및 동영상 블록 추가
- [x] `BlockList` 업데이트 (`contact`, `video` 에디터 매핑)
- [x] `BlockList`의 빈 화면 상태 메시지 텍스트 가이드 보강
- [x] 블록 항목 컨트롤에 '복제' 옵션 추가 적용
- [x] 블록 사이에디터 삽입을 위한 (+) 버튼/툴바 추가 로직 적용
- [x] 페이지 이탈 방지(`beforeunload`) 로직 및 `isDirty` 상태 관리 적용 (`template-editor.tsx`)
- [x] `sonner` Toaster 연동 및 저장 시 Toast 피드백 추가 (`layout.tsx`, `template-editor.tsx`)

## 3. Viewer Presentation
- [x] `ContactViewer` 구현 (`src/components/onboarding/blocks/contact-viewer.tsx`)
- [x] `VideoViewer` 구현 (`src/components/onboarding/blocks/video-viewer.tsx`)
- [x] `BlockViewer` 업데이트 (`contact`, `video` 뷰어 매핑)
