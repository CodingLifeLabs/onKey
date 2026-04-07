# 서명 블록 — Research

## 목표

템플릿 에디터에 서명 블록을 추가한다. 운영자가 서명 수집 설정(title, description, collect_name, collect_canvas)을 구성할 수 있게 한다.
**실제 서명 캔버스(입주자 그리기)는 기능 #8 퍼블릭 페이지에서 구현한다.**

## Agent 1 — 아키텍처 (위치할 레이어 / 기존 패턴)

### SignatureBlock 타입 (이미 정의됨)

```typescript
interface SignatureBlock extends BaseBlock {
  type: 'signature';
  required: true;
  content: {
    title?: string;           // 기본: "입주자 서명"
    description?: string;     // 기본: "위 안내 사항을 모두 확인하였습니다"
    collect_name: boolean;    // 기본: true
    collect_canvas: boolean;  // 기본: true
  };
}
```

### 수정 필요 파일

| 파일 | 작업 |
|------|------|
| `src/components/editor/blocks/signature-editor.tsx` | **신규** — 설정 폼 (title, description, collect_name/collect_canvas 토글) |
| `src/components/editor/block-list.tsx` | switch case + 라벨 매핑 |
| `src/components/editor/block-toolbar.tsx` | blockOptions에 signature 추가 |
| `src/lib/block-utils.ts` | createBlock case 'signature' 추가 |

### 수정 불필요 파일

- `src/types/block.ts` — SignatureBlock 이미 정의됨
- Domain/Repository/Data 계층 — Block[] JSONB로 저장
- `src/domain/entities/session-progress.entity.ts` — signatureImageUrl, signatureName 필드 이미 존재

## Agent 2 — 유사 기능 (재사용 가능 / 새로 만들 것)

### 재사용 가능

| 항목 | 비고 |
|------|------|
| block-utils.ts 함수 | addBlock/removeBlock/moveBlock/updateBlockContent |
| BlockList 컨테이너 | 렌더/순서변경/삭제 UI |
| BlockToolbar 드롭다운 | blockOptions 배열에 항목만 추가 |
| image-editor.tsx 패턴 | 미리보기/편집 분기, onChange 패턴 |
| upload-template-image.ts | 서명 업로드 시 참고 (기능 #8에서 사용) |

### 새로 만들 것

| 항목 | 설명 |
|------|------|
| `signature-editor.tsx` | 설정 폼 에디터 (title, description, collect_name/collect_canvas) |
| `signatureContentSchema` | Zod 검증 스키마 |

### 핵심 구분

- **Phase 1 (이번)**: 운영자가 서명 블록 설정만 구성 (SignatureEditor = 설정 폼)
- **Phase 2 (기능 #8)**: 입주자가 실제 서명 (signature_pad 캔버스 + Storage 업로드)

## Agent 3 — 의존성 (필요한 것 / 충돌 위험)

### 추가 설치: 없음

- signature_pad@5.1.3 이미 설치됨 (타입 정의 자체 포함)
- 서명 캔버스는 이번 feature에서 구현하지 않음
- lucide-react에 PenLine/FileSignature 아이콘 사용 가능

### 버전 충돌 위험: 없음

## Agent 4 — 테스트 (위치 / 범위)

### 기존 테스트

- `block.test.ts`에 "signature는 항상 required이다" 테스트 이미 존재
- `signatureContentSchema` 테스트 없음
- `addBlock('signature')` 테스트 없음

### 추가 테스트

| 파일 | 내용 |
|------|------|
| `validations/__tests__/block.test.ts` | signatureContentSchema 검증 |
| `__tests__/block-utils.test.ts` | addBlock('signature') 테스트 |

## 결론 및 추천 방향

**핵심 작업**: signature-editor.tsx 신규 생성 (설정 폼) + 기존 파일 switch/case 추가
**signature_pad 캔버스는 이번에 구현하지 않음** — 기능 #8에서 입주자 페이지에 구현

구현 난이도: **낮음** — checklist보다 단순한 설정 폼
