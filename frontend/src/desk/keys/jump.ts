import { onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

export interface JumpTarget {
  key: string; // e.g. 'o', 's', 'p', 'd', 'f'
  label: string;
  route: string;
}

export const DEFAULT_JUMP_TARGETS: JumpTarget[] = [
  // 1. Overview
  { key: 'h', label: 'Dashboard', route: '/dashboard' },

  // 2. Masters
  { key: 'v', label: 'Vehicle Master', route: '/fleet' },
  { key: 'p', label: 'Party Master', route: '/customers' },

  // 3. Operations
  { key: 'b', label: 'Booking / LR', route: '/orders' },
  { key: 'w', label: 'Planner Workspace', route: '/planning' },
  { key: 't', label: 'Trip & Allocation', route: '/dispatch' },
  { key: 'u', label: 'Fuel Entry', route: '/fuel' },
  { key: 'a', label: 'Driver Advances', route: '/driver-advances' },
  { key: 'y', label: 'Tyre Operations', route: '/tyres' },
  { key: 'm', label: 'Maintenance', route: '/maintenance' },
  { key: 'd', label: 'POD', route: '/pod' },

  // 4. Finance
  { key: 'i', label: 'Billing', route: '/billing' },
  { key: 'k', label: 'Purchase Bills', route: '/purchase-bills' },
  { key: 's', label: 'Settlements', route: '/settlements' },

  // 5. Insights
  { key: 'r', label: 'Reports', route: '/analytics' },
  { key: 'x', label: 'Exception Inbox', route: '/exceptions' },
  { key: 'g', label: 'Gati Copilot AI', route: '/copilot' },

  // 6. Admin
  { key: 'o', label: 'Access Management', route: '/admin/users' },
  { key: 'e', label: 'Organization & Settings', route: '/settings' },
];

export function useDeskJump() {
  const router = useRouter();

  function onKeyDown(e: KeyboardEvent) {
    if (!e.altKey || e.ctrlKey || e.metaKey) return;

    // Do not jump if a modal drawer or dialog is currently open
    const modalEl = document.querySelector('.desk-dialog, .q-dialog:not(.hidden)');
    if (modalEl) return;

    // Don't intercept if user is typing in a multiline textarea or contenteditable
    const activeEl = document.activeElement as HTMLElement | null;
    if (activeEl) {
      const tag = activeEl.tagName.toLowerCase();
      if (tag === 'textarea' || activeEl.isContentEditable) return;
    }

    const key = e.key.toLowerCase();
    const code = (e.code || '').toLowerCase(); // e.g. 'keyg'

    const match = DEFAULT_JUMP_TARGETS.find((t) => {
      const target = t.key.toLowerCase();
      return key === target || code === `key${target}`;
    });

    if (match) {
      e.preventDefault();
      e.stopPropagation();
      router.push(match.route);
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown, { capture: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown, { capture: true });
  });
}
