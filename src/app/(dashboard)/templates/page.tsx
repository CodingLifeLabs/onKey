'use client';

import { useEffect, useState, useTransition } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { TemplateCard } from '@/components/dashboard/template-card';
import { CreateTemplateDialog } from '@/components/dashboard/create-template-dialog';
import { DeleteTemplateDialog } from '@/components/dashboard/delete-template-dialog';
import { NativeButton } from '@/components/ui/button-native';
import { Plus } from 'lucide-react';
import { getAllTemplates } from '@/app/actions/get-all-templates';
import { duplicateTemplate } from '@/app/actions/duplicate-template';
import { getUserPlan } from '@/app/actions/get-user-plan';
import { useRouter } from 'next/navigation';
import type { Template } from '@/domain/entities/template.entity';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<{
    system: Template[];
    user: Template[];
  }>({ system: [], user: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

  const loadTemplates = async () => {
    const [data, plan] = await Promise.all([
      getAllTemplates(),
      getUserPlan(),
    ]);
    setTemplates(data);
    setIsPro(plan === 'pro');
    setIsLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleDuplicate = async (templateId: string) => {
    setDuplicatingId(templateId);
    try {
      await duplicateTemplate(templateId);
      await loadTemplates();
    } catch (err) {
      alert(err instanceof Error ? err.message : '복제에 실패했습니다');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDeleted = () => {
    setDeleteTarget(null);
    loadTemplates();
  };

  if (isLoading) {
    return (
      <>
        <DashboardHeader title="템플릿 관리" />
        <div className="p-6">
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </div>
      </>
    );
  }

  const totalCount = templates.system.length + templates.user.length;

  return (
    <>
      <DashboardHeader
        title="템플릿 관리"
        description={`${totalCount}개의 템플릿`}
        action={
          isPro ? (
            <NativeButton size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              새 템플릿
            </NativeButton>
          ) : undefined
        }
      />

      <div className="p-6 space-y-8">
        {templates.system.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              기본 템플릿
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.system.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onDelete={setDeleteTarget}
                  onDuplicate={handleDuplicate}
                  isDuplicating={duplicatingId === template.id}
                  isPro={isPro}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            내 템플릿
          </h2>
          {templates.user.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                아직 생성한 템플릿이 없습니다.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                새 템플릿을 만들거나 기본 템플릿을 복제해 보세요.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.user.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onDelete={setDeleteTarget}
                  onDuplicate={handleDuplicate}
                  isDuplicating={duplicatingId === template.id}
                  isPro={isPro}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <CreateTemplateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <DeleteTemplateDialog
        template={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onDeleted={handleDeleted}
      />
    </>
  );
}
