'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function usePageState() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const action = searchParams.get('action');
  const itemId = searchParams.get('id');

  const setMode = useCallback((mode: 'list' | 'detail' | 'new' | 'edit', id?: number) => {
    const params = new URLSearchParams();
    if (mode !== 'list') {
      params.set('action', mode);
    }
    if (id && (mode === 'detail' || mode === 'edit')) {
      params.set('id', id.toString());
    }
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '';
    window.history.replaceState({}, '', newUrl);
  }, []);

  const navigateToDetail = useCallback((id: number, basePath: string) => {
    router.push(`${basePath}?action=detail&id=${id}`);
  }, [router]);

  const navigateToNew = useCallback((basePath: string) => {
    router.push(`${basePath}?action=new`);
  }, [router]);

  const navigateToList = useCallback((basePath: string) => {
    router.push(basePath);
  }, [router]);

  return {
    action,
    itemId,
    setMode,
    navigateToDetail,
    navigateToNew,
    navigateToList,
    isNew: action === 'new',
    isDetail: action === 'detail' || action === 'edit',
    isList: !action
  };
}
