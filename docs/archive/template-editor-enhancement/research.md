# 템플릿 콘텐츠 & 에디터 고도화 — Research

## 목표

1. 원룸/오피스텔 입주 안내에 실질적으로 필요한 콘텐츠 항목 조사
2. 현재 에디터 UX의 문제점 식별 및 개선 방향 도출

---

## Agent 1 — 아키텍처 (현재 구조)

### 블록 타입 (`src/types/block.ts`)
8개 타입 정의: `heading`, `text`, `image`, `video`, `divider`, `checklist`, `contact`, `signature`

### 에디터 구조 (`src/components/editor/`)
- `template-editor.tsx` — 최상위 편집 컨테이너 (블록 state, 저장, 편집/미리보기 토글)
- `block-toolbar.tsx` — 블록 추가 드롭다운 (6종만 — **video, contact 누락**)
- `block-list.tsx` — 블록 렌더링 + ▲▼ 이동/삭제 컨트롤
- `blocks/` — 개별 블록 에디터 6개 (heading, text, image, divider, checklist, signature)

### 뷰어 구조 (`src/components/onboarding/`)
- `block-viewer.tsx` — 퍼블릭 페이지 블록 렌더링 (6종만 — **video, contact 누락**)
- `blocks/` — 개별 블록 뷰어 6개

### `block-utils.ts` (`src/lib/`)
- `createBlock()` — 6종만 처리 (**video, contact의 기본 content 생성 없음**)
- `addBlock()`, `removeBlock()`, `moveBlockUp()`, `moveBlockDown()`, `updateBlockContent()`

---

## Agent 2 — 유사 기능 (재사용 / 새로 만들 것)

### 재사용 가능
- `block-utils.ts`의 CRUD 함수 → contact/video 블록에 확장
- TipTap 에디터 인프라 (`text-editor.tsx`) → 이미 잘 구성됨
- `upload-template-image.ts` 서버 액션 → 이미지 업로드 재사용
- shadcn/ui 컴포넌트 (Input, Button, Select, Card 등)

### 새로 만들 것
- `contact-editor.tsx` — 비상연락처 편집기
- `video-editor.tsx` — 동영상 임베드 편집기
- `contact-viewer.tsx` — 퍼블릭 페이지 연락처 뷰어
- `video-viewer.tsx` — 퍼블릭 페이지 동영상 뷰어

---

## Agent 3 — 의존성

### 현재 사용 중
- `@tiptap/react`, `@tiptap/starter-kit` — 리치 텍스트
- `nanoid` — 블록/체크리스트 ID 생성
- `lucide-react` — 아이콘

### 추가 필요
- 없음 (video embed는 YouTube/Vimeo URL 파싱으로 처리, 외부 라이브러리 불필요)

---

## Agent 4 — 테스트

### 기존 테스트
- `src/lib/__tests__/block-utils.test.ts` — addBlock, removeBlock, moveBlockUp/Down, updateBlockContent
  - ✅ heading, text, image, divider, checklist, signature 기본 content 테스트 존재
  - ❌ video, contact 블록 테스트 부재

### 테스트 실행
```bash
npx vitest run src/lib/__tests__/block-utils.test.ts
```

### 추가 필요
- video, contact 블록의 createBlock 기본 content 테스트

---

## 원룸/오피스텔 입주 안내 베스트프랙티스 (웹 조사)

### 필수 안내 항목 (운영자 → 입주자)

| 카테고리 | 세부 항목 |
|----------|----------|
| **환영 인사** | 입주 환영 메시지, 건물 소개 |
| **시설물 점검** | 수압/배수, 누수, 온수, 가스/인덕션, 콘센트, 전등, 냉난방기, 차단기 |
| **안전 수칙** | 소화기 위치, 화재 대피로, 가스 밸브, 현관 도어락 |
| **쓰레기 분리수거** | 배출 요일/시간, 장소, 종량제 봉투, 분리배출 요령 |
| **주차** | 등록 절차, 지정 주차면, 외부 차량 제한 |
| **택배** | 택배함 위치/비밀번호, 분실 방지 안내 |
| **비상연락처** | 관리사무소, 가스/전기 긴급, 소방서, 지구대 → `contact` 블록 활용 |
| **생활 규칙** | 층간소음, 반려동물, 공용시설 이용 |
| **행정 절차** | 전입신고, 확정일자, 관리비 정산 |

---

## 에디터 UX 문제점

| # | 문제 | 심각도 |
|---|------|--------|
| 1 | **video, contact 블록 에디터/뷰어 미구현** — 타입만 정의됨 | 🔴 |
| 2 | **블록 추가 버튼이 상단에만** — 블록 사이 삽입이 불편 | 🟡 |
| 3 | **링크 삽입이 `window.prompt()`** — UX 나쁨 | 🟡 |
| 4 | **저장 확인 없음** — 변경 사항 있어도 페이지 떠날 때 경고 없음 | 🟡 |
| 5 | **블록 복제 기능 없음** — 비슷한 블록 반복 입력 불편 | 🟡 |
| 6 | **블록 타입 라벨에 video, contact 표시 누락** — block-list.tsx | 🔴 |
| 7 | **에디터 빈 상태 안내** — 보일러플레이트 가이드 없음 | 🟢 |

---

## 결론 및 추천 방향

### 콘텐츠 고도화
- **contact 블록 에디터/뷰어 구현** → 비상연락처는 모든 입주 안내에 필수
- **video 블록 에디터/뷰어 구현** → 시설 이용 안내 동영상 임베드 수요
- 시스템 기본 템플릿 콘텐츠 보강 (필수 안내 항목 기반)은 별도 feature로 분리 권장

### 에디터 UX 고도화
1. **블록 사이 삽입 버튼** — 각 블록 사이에 (+) 삽입 포인트 추가
2. **블록 복제** — 기존 블록 복제 기능
3. **저장 알림** — 변경 감지 + 페이지 이탈 경고 (`beforeunload`)
4. **성공 토스트** — 저장 성공/실패 피드백 (`alert` 대신 toast)
5. **빈 에디터 가이드** — 처음 접하는 사용자를 위한 추천 블록 구성 안내
