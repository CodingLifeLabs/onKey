# 기능 #16: QR 코드 생성

## 목표
세션 온보딩 링크를 QR 코드로 변환하여 다운로드할 수 있도록 한다.

## Agent 1 — 아키텍처
- URL 형식: `{protocol}://{host}/onboarding/{token}`
- QR 표시 위치: 세션 상세 페이지 퍼블릭 링크 카드 + 세션 생성 위저드 링크 공유 단계
- 클라이언트 사이드 SVG → Canvas → PNG 변환

## Agent 2 — 라이브러리
- **qrcode.react** 선택: 4.5kB, zero deps, TypeScript, SVG 기반
- `QRCodeSVG` 컴포넌트 + canvas 변환으로 PNG 다운로드

## 결론
- 추가 패키지: qrcode.react
- 신규 컴포넌트: QrCodeButton (다이얼로그 + 다운로드)
- 수정: 세션 상세 페이지, 링크 공유 스텝
