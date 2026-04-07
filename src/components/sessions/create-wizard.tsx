'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/sessions/step-indicator';
import { StepBasicInfo } from '@/components/sessions/step-basic-info';
import { StepTemplatePicker } from '@/components/sessions/step-template-picker';
import { StepContentEditor } from '@/components/sessions/step-content-editor';
import { StepLinkShare } from '@/components/sessions/step-link-share';
import type { CreateSessionStep1 } from '@/lib/validations/session';
import type { Template } from '@/domain/entities/template.entity';
import type { Block } from '@/types/block';
import { createSessionAction } from '@/app/actions/create-session';

const STEPS = ['기본 정보', '템플릿 선택', '콘텐츠 편집', '링크 공유'];

export function CreateWizard({
  templates,
  appUrl,
}: {
  templates: Template[];
  appUrl: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<CreateSessionStep1 | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [contentBlocks, setContentBlocks] = useState<Block[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStep1Next = (data: CreateSessionStep1) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2Next = (templateId: string | null, blocks: Block[]) => {
    setSelectedTemplateId(templateId);
    setContentBlocks(blocks);
    setStep(3);
  };

  const handleStep3Next = async (blocks: Block[]) => {
    if (!step1Data) return;
    setIsSubmitting(true);
    setError(null);

    const result = await createSessionAction(
      {
        roomNumber: step1Data.roomNumber,
        tenantName: step1Data.tenantName,
        moveInDate: step1Data.moveInDate,
        expiresAt: step1Data.expiresAt,
        memo: step1Data.memo,
      },
      selectedTemplateId,
      blocks,
    );

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setToken(result.token!);
    setStep(4);
    setIsSubmitting(false);
  };

  const handleGoToDashboard = () => {
    router.push('/sessions');
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <StepIndicator steps={STEPS} currentStep={step} />

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {step === 1 && (
        <StepBasicInfo
          defaultValues={step1Data ?? undefined}
          onNext={handleStep1Next}
        />
      )}

      {step === 2 && (
        <StepTemplatePicker
          templates={templates}
          selectedId={selectedTemplateId}
          onSelect={setSelectedTemplateId}
          onNext={handleStep2Next}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepContentEditor
          initialBlocks={contentBlocks}
          onNext={handleStep3Next}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && token && (
        <StepLinkShare
          link={`${appUrl}/onboarding/${token}`}
          expiresAt={step1Data?.expiresAt ?? ''}
          tenantName={step1Data?.tenantName ?? ''}
          onGoToDashboard={handleGoToDashboard}
        />
      )}
    </div>
  );
}
