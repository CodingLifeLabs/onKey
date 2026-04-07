'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createSessionStep1Schema,
  type CreateSessionStep1,
} from '@/lib/validations/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from 'lucide-react';

interface StepBasicInfoProps {
  defaultValues?: CreateSessionStep1;
  onNext: (data: CreateSessionStep1) => void;
}

export function StepBasicInfo({ defaultValues, onNext }: StepBasicInfoProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateSessionStep1>({
    resolver: zodResolver(createSessionStep1Schema),
    defaultValues: defaultValues ?? {
      roomNumber: '',
      tenantName: '',
      moveInDate: '',
      expiresAt: '',
      memo: '',
    },
  });

  const moveInDate = watch('moveInDate');

  const onSubmit = (data: CreateSessionStep1) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">기본 정보 입력</h2>
        <p className="text-sm text-muted-foreground">
          입주자 및 세션 기본 정보를 입력해주세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="roomNumber">호실 번호 *</Label>
          <Input
            id="roomNumber"
            placeholder="예: 101호, 3층 A"
            {...register('roomNumber')}
          />
          {errors.roomNumber && (
            <p className="text-sm text-destructive">
              {errors.roomNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenantName">입주자 이름 *</Label>
          <Input
            id="tenantName"
            placeholder="입주자 이름"
            {...register('tenantName')}
          />
          {errors.tenantName && (
            <p className="text-sm text-destructive">
              {errors.tenantName.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="moveInDate">입주 예정일 *</Label>
          <Input id="moveInDate" type="date" {...register('moveInDate')} />
          {errors.moveInDate && (
            <p className="text-sm text-destructive">
              {errors.moveInDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiresAt">링크 만료일 *</Label>
          <Input
            id="expiresAt"
            type="date"
            min={moveInDate || undefined}
            {...register('expiresAt')}
          />
          {errors.expiresAt && (
            <p className="text-sm text-destructive">
              {errors.expiresAt.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="memo">메모 (내부용)</Label>
        <Textarea
          id="memo"
          placeholder="입주자에게 노출되지 않는 내부 메모입니다"
          rows={3}
          {...register('memo')}
        />
        {errors.memo && (
          <p className="text-sm text-destructive">{errors.memo.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          다음
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
