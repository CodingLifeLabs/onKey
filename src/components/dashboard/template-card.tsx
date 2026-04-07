'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UpgradePromptDialog } from '@/components/dashboard/upgrade-prompt-dialog';
import {
  Copy,
  Edit,
  FileText,
  Lock,
  MoreVertical,
  Shield,
  Trash2,
} from 'lucide-react';
import type { Template } from '@/domain/entities/template.entity';
import type { Block } from '@/types/block';

interface TemplateCardProps {
  template: Template;
  onDelete: (template: Template) => void;
  onDuplicate: (templateId: string) => void;
  isDuplicating?: boolean;
  isPro?: boolean;
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

export function TemplateCard({
  template,
  onDelete,
  onDuplicate,
  isDuplicating,
  isPro,
}: TemplateCardProps) {
  const router = useRouter();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');

  const handleProOnly = (feature: string) => {
    setUpgradeFeature(feature);
    setUpgradeOpen(true);
  };

  return (
    <>
      <Card className="group hover:shadow-md hover:border-primary/20 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${template.isSystem ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'}`}>
                {template.isSystem ? <Shield className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">{template.name}</CardTitle>
                {template.isSystem && (
                  <span className="text-[10px] font-medium text-primary/70 uppercase tracking-wider">기본 템플릿</span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => isPro ? router.push(`/templates/${template.id}/edit`) : handleProOnly('템플릿 편집')}
                >
                  {isPro ? (
                    <Edit className="mr-2 h-4 w-4" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  편집
                  {!isPro && <span className="ml-auto text-[10px] text-muted-foreground">Pro</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => isPro ? onDuplicate(template.id) : handleProOnly('템플릿 복제')}
                  disabled={isPro && isDuplicating}
                >
                  {isPro ? (
                    <Copy className="mr-2 h-4 w-4" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  {isPro && isDuplicating ? '복제 중...' : '복제'}
                  {!isPro && <span className="ml-auto text-[10px] text-muted-foreground">Pro</span>}
                </DropdownMenuItem>
                {!template.isSystem && (
                  <DropdownMenuItem
                    onClick={() => onDelete(template)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {template.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {template.description}
            </p>
          )}
          <Badge variant="outline" className="text-[11px] font-normal">
            {getBlockSummary(template.content)}
          </Badge>
        </CardContent>
      </Card>
      <UpgradePromptDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        feature={upgradeFeature}
      />
    </>
  );
}
