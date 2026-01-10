'use client';

import { useEffect, useState } from 'react';
import { NetworkStatusListener } from '@/features/utilities/network-status-listener';

export function NetworkStatusProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <NetworkStatusListener />;
}
