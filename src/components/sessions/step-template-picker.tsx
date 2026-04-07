'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Template } from '@/domain/entities/template.entity';
import type { Block } from '@/types/block';

interface StepTemplatePickerProps {
  templates: Template[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onNext: (templateId: string | null, content: Block[]) => void;
  onBack: () => void;
}

function getBlockSummary(content: Block[]): string {
  if (content.length === 0) return '빈 템플릿';
  const headings = content
    .filter((b): b is Block & { type: 'heading' } => b.type === 'heading')
    .map((b) => b.content.text);
  return headings.length > 0
    ? headings.slice(0, 3).join(', ')
    : `${content.length}개 블록`;
}

export function StepTemplatePicker({
  templates,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: StepTemplatePickerProps) {
  const selectedTemplate = templates.find((t) => t.id === selectedId);

  const handleNext = () => {
    onNext(selectedId, selectedTemplate?.content ?? []);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">템플릿 선택</h2>
        <p className="text-sm text-muted-foreground">
          입주 안내에 사용할 템플릿을 선택하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              'cursor-pointer transition-all',
              selectedId === template.id
                ? 'ring-2 ring-primary shadow-md'
                : 'hover:shadow-md',
            )}
            onClick={() => onSelect(template.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{template.name}</CardTitle>
                {selectedId === template.id && (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {template.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {template.description}
                </p>
              )}
              <Badge variant="secondary" className="text-xs">
                <FileText className="mr-1 h-3 w-3" />
                {getBlockSummary(template.content)}
              </Badge>
            </CardContent>
          </Card>
        ))}

        {/* 빈 템플릿 */}
        <Card
          className={cn(
            'cursor-pointer border-2 border-dashed transition-all',
            selectedId === null
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-muted hover:border-primary/50',
          )}
          onClick={() => onSelect(null)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">빈 템플릿으로 시작</CardTitle>
              {selectedId === null && (
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Plus className="h-4 w-4" />
              모든 섹션을 직접 생성합니다
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          이전
        </Button>
        <Button onClick={handleNext}>
          다음
        </Button>
      </div>
    </div>
  );
}
