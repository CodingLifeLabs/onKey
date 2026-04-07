import { getTemplate } from '@/app/actions/get-template';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { TemplateEditor } from '@/components/editor/template-editor';
import { notFound } from 'next/navigation';

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const template = await getTemplate(templateId);

  if (!template) notFound();

  return (
    <>
      <DashboardHeader
        title="템플릿 편집"
        description={template.name}
      />
      <div className="p-6">
        <TemplateEditor template={template} />
      </div>
    </>
  );
}
