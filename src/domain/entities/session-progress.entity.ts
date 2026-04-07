export interface SessionProgress {
  id: string;
  sessionId: string;
  viewedSections: string[]; // 열람 완료된 블록 ID 배열
  checkedItems: string[]; // 체크 완료된 항목 ID 배열
  signatureName: string | null;
  signatureImageUrl: string | null;
  submittedAt: Date | null;
  updatedAt: Date;
}
