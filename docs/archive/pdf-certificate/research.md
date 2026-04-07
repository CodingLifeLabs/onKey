# 기능 #15: PDF 완료 확인서

## 목표
세션 완료 시 체크리스트 결과 + 서명 이미지가 포함된 PDF 확인서를 다운로드한다.

## 아키텍처
- **라이브러리**: @react-pdf/renderer (React 컴포넌트 → PDF)
- **한국어 폰트**: NotoSansKR 번들 (src/fonts/)
- **렌더링**: 클라이언트 사이드 (브라우저에서 다운로드)
- **트리거**: 세션 상세 페이지 완료 정보 카드에 "PDF 다운로드" 버튼

## 데이터 (getSessionDetail에서 모두 사용 가능)
- 세션: tenantName, roomNumber, moveInDate, createdAt, completedAt
- 진행: signatureName, signatureImageUrl, checkedItems, submittedAt
- 블록: contentSnapshot에서 checklist 타입 필터링

## PDF 레이아웃
1. 헤더: OnKey 로고 + "입주 안내 완료 확인서"
2. 입주자 정보: 이름, 호실, 입주일
3. 완료 일시: 제출 시각
4. 체크리스트 결과: 항목별 체크/미체크 표시
5. 서명: 이미지 + 서명자 이름
6. 푸터: 발급일
