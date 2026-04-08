'use client';

import { useState } from 'react';
import { signOut } from '@/lib/auth/client';
import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

interface UserMenuProps {
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
}

export function UserMenu({ fullName, email, avatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const displayName = fullName || email || '사용자';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent w-full cursor-pointer"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm truncate flex-1 text-left">{displayName}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border bg-popover p-1 shadow-md z-50">
            <div className="px-3 py-2 border-b mb-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
            </div>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              설정
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent w-full text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}
