"use client";

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function useNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  const replace = (href: string) => {
    startTransition(() => {
      router.replace(href);
    });
  };

  return {
    navigate,
    replace,
    isPending
  };
}
