import { Slot } from 'expo-router';
import React from 'react';

import { AdminGate } from '@/admin/Gate';
import { OverlayProvider } from '@/admin/ui/overlay';

/**
 * The admin dashboard. Every route under /admin renders inside the gate
 * (owner setup, sign-in, first password) and then the dashboard frame.
 */
export default function AdminLayout() {
  return (
    <OverlayProvider>
      <AdminGate>
        <Slot />
      </AdminGate>
    </OverlayProvider>
  );
}
