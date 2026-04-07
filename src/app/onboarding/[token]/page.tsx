import { getSessionByToken } from '@/app/actions/get-session-by-token';
import { OnboardingPage } from '@/components/onboarding/onboarding-page';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function Page({ params }: Props) {
  const { token } = await params;
  const result = await getSessionByToken(token);

  if ('error' in result) {
    if (result.status === 'expired') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <p className="text-lg text-muted-foreground">만료된 링크입니다</p>
        </div>
      );
    }

    if (result.status === 'completed') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <CheckCircle2 className="size-8 text-green-500" />
          <p className="text-lg">이미 완료된 안내입니다</p>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-lg text-muted-foreground">유효하지 않은 링크입니다</p>
      </div>
    );
  }

  const { session, progress } = result;

  return (
    <OnboardingPage
      session={session}
      progress={progress}
      blocks={session.contentSnapshot}
    />
  );
}
