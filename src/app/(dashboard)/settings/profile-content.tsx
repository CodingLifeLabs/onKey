'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validations/profile';
import { updateProfileAction } from '@/app/actions/update-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, CreditCard, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { PlanBadge } from '@/components/dashboard/plan-badge';

interface ProfileContentProps {
  fullName: string;
  email: string;
  plan: string;
  subscriptionStatus: string | null;
}

export function ProfileContent({
  fullName,
  email,
  plan,
  subscriptionStatus,
}: ProfileContentProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: fullName ?? '' },
  });

  const onSubmit = (data: UpdateProfileInput) => {
    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      const result = await updateProfileAction(formData);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: '프로필이 업데이트되었습니다' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 프로필 수정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            프로필 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">이름</Label>
              <Input
                id="fullName"
                placeholder="이름을 입력해주세요"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" value={email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">이메일은 Clerk에서 관리됩니다</p>
            </div>

            {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-destructive'}`}>
                {message.text}
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={!isDirty || isPending} size="sm">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    저장
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 결제 관리 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              요금제
            </CardTitle>
            <PlanBadge plan={plan} subscriptionStatus={subscriptionStatus} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              요금제 변경, 결제 수단 관리, 구독 해지
            </p>
            <Link href="/settings/billing">
              <Button variant="outline" size="sm">
                결제 관리
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
