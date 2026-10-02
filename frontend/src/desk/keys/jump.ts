import { useRouter } from 'vue-router';
import { useDeskKeymap } from './deskKeymap';

export interface JumpTarget {
  key: string; // e.g. 'o', 's', 'p', 'd', 'f'
  label: string;
  route: string;
}

export const DEFAULT_JUMP_TARGETS: JumpTarget[] = [
  { key: 'o', label: 'Orders', route: '/orders' },
  { key: 's', label: 'Shipments', route: '/shipments' },
  { key: 'p', label: 'Planning', route: '/planning' },
  { key: 'd', label: 'Dispatch', route: '/dispatch' },
  { key: 'v', label: 'Vehicles', route: '/vehicles' },
  { key: 't', label: 'Tracking', route: '/tracking' },
  { key: 'b', label: 'Billing', route: '/billing' },
];

export function useDeskJump() {
  const router = useRouter();

  const bindings = DEFAULT_JUMP_TARGETS.map((target) => ({
    commandId: `alt+${target.key}`,
    allowInInputs: false,
    handler: (event: KeyboardEvent) => {
      event.preventDefault();
      router.push(target.route);
      return true;
    },
  }));

  useDeskKeymap(bindings);
}
