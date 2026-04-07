'use client';

import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Session } from '@/domain/entities/session.entity';
import type { SessionProgress } from '@/domain/entities/session-progress.entity';
import type { Block, ChecklistBlock } from '@/types/block';

Font.register({
  family: 'NotoSansKR',
  src: 'https://cdn.jsdelivr.net/gh/notion-kr/notion-kr-cdn@main/fonts/NotoSansKR-Regular.ttf',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    padding: 50,
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#888',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    color: '#666',
  },
  value: {
    flex: 1,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 10,
  },
  signatureContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signatureImage: {
    width: 200,
    height: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#aaa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderTopStyle: 'solid',
    paddingTop: 8,
  },
});

interface CertificateProps {
  session: Session;
  progress: SessionProgress;
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(date: Date | null): string {
  if (!date) return '-';
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isChecklistBlock(block: Block): block is ChecklistBlock {
  return block.type === 'checklist';
}

export function CompletionCertificate({ session, progress }: CertificateProps) {
  const checklistBlocks = session.contentSnapshot.filter(isChecklistBlock);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>입주 안내 완료 확인서</Text>
        <Text style={styles.subtitle}>OnKey 온보딩 시스템</Text>

        {/* 입주자 정보 */}
        <Text style={styles.sectionTitle}>입주자 정보</Text>
        <View style={styles.row}>
          <Text style={styles.label}>이름</Text>
          <Text style={styles.value}>{session.tenantName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>호실</Text>
          <Text style={styles.value}>{session.roomNumber ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>입주 예정일</Text>
          <Text style={styles.value}>{formatDate(session.moveInDate)}</Text>
        </View>

        {/* 완료 정보 */}
        <Text style={styles.sectionTitle}>완료 정보</Text>
        <View style={styles.row}>
          <Text style={styles.label}>안내 생성일</Text>
          <Text style={styles.value}>{formatDateTime(session.createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>완료 일시</Text>
          <Text style={styles.value}>{formatDateTime(progress.submittedAt)}</Text>
        </View>

        {/* 체크리스트 결과 */}
        {checklistBlocks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>확인 항목</Text>
            {checklistBlocks.map((block) => (
              <View key={block.id} style={{ marginBottom: 10 }}>
                {block.content.title && (
                  <Text style={{ fontSize: 11, marginBottom: 4 }}>
                    {block.content.title}
                  </Text>
                )}
                {block.content.items.map((item) => {
                  const checked = progress.checkedItems?.includes(item.id);
                  return (
                    <View key={item.id} style={styles.checklistItem}>
                      <View style={styles.checkbox}>
                        {checked && <Text style={styles.checkmark}>V</Text>}
                      </View>
                      <Text>{item.label}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        )}

        {/* 서명 */}
        {progress.signatureImageUrl && (
          <View style={styles.signatureContainer}>
            <Text style={styles.sectionTitle}>서명</Text>
            <Image src={progress.signatureImageUrl} style={styles.signatureImage} />
            {progress.signatureName && (
              <Text style={{ fontSize: 11, marginTop: 4 }}>
                {progress.signatureName}
              </Text>
            )}
          </View>
        )}

        {/* 푸터 */}
        <View style={styles.footer}>
          <Text>OnKey — 입주 온보딩 플랫폼</Text>
          <Text>발급일: {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
}
