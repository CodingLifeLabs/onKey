// 블록 타입 정의 — PRD Section 16 기반

export type BlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'divider'
  | 'checklist'
  | 'contact'
  | 'signature';

export interface BaseBlock {
  id: string; // nanoid(10)
  type: BlockType;
  order: number; // 정렬 순서 (0부터)
  required: boolean; // 입주자가 반드시 확인해야 하는 블록 여부
}

// heading — 섹션 제목
export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  content: {
    text: string;
    level: 1 | 2 | 3; // h1=대제목, h2=중제목, h3=소제목
  };
}

// text — 본문 텍스트
export interface TextBlock extends BaseBlock {
  type: 'text';
  content: {
    html: string; // 기본 서식만 허용 (bold, italic, ul, ol, a)
  };
}

// image — 이미지
export interface ImageBlock extends BaseBlock {
  type: 'image';
  content: {
    url: string; // Supabase Storage URL
    alt: string;
    caption?: string;
    width?: 'full' | 'half'; // 기본: full
  };
}

// video — 동영상 (임베드)
export interface VideoBlock extends BaseBlock {
  type: 'video';
  content: {
    url: string; // YouTube / Vimeo URL
    embed_url: string; // 변환된 embed URL
    caption?: string;
  };
}

// divider — 구분선
export interface DividerBlock extends BaseBlock {
  type: 'divider';
  content: Record<string, never>;
}

// checklist — 확인 체크리스트
export interface ChecklistItem {
  id: string; // nanoid(8)
  label: string;
  required: boolean;
}

export interface ChecklistBlock extends BaseBlock {
  type: 'checklist';
  required: true; // checklist는 항상 required
  content: {
    title?: string;
    items: ChecklistItem[];
  };
}

// contact — 비상 연락처
export interface ContactEntry {
  label: string; // 예: "관리사무소", "긴급 수리"
  phone: string;
  available?: string; // 예: "평일 09:00~18:00"
}

export interface ContactBlock extends BaseBlock {
  type: 'contact';
  content: {
    title?: string;
    entries: ContactEntry[];
  };
}

// signature — 전자 서명
export interface SignatureBlock extends BaseBlock {
  type: 'signature';
  required: true; // signature는 항상 required
  content: {
    title?: string; // 기본: "입주자 서명"
    description?: string; // 기본: "위 안내 사항을 모두 확인하였습니다"
    collect_name: boolean; // 기본: true
    collect_canvas: boolean; // 기본: true
  };
}

// Union type
export type Block =
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | VideoBlock
  | DividerBlock
  | ChecklistBlock
  | ContactBlock
  | SignatureBlock;
