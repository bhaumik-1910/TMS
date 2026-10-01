import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useAppNotify } from './useAppNotify';
import api from '../api/client';

export function useWorkflowActions() {
  const authStore = useAuthStore();
  const notify = useAppNotify();

  const isSuperAdmin = computed(() => authStore.isSuperAdmin);
  const currentRole = computed(() => authStore.currentRole);

  /**
   * Determine available actions on a shipment based on its status, role and permissions.
   */
  function getShipmentActions(shipment: any) {
    if (!shipment) return {};
    const status = shipment.status;

    return {
      canAssign: (isSuperAdmin.value || ['OPERATIONS_MANAGER', 'DISPATCHER'].includes(currentRole.value)) &&
        authStore.hasPermission('dispatch:assign') &&
        ['PLANNED', 'ASSIGNED'].includes(status),

      canDispatch: (isSuperAdmin.value || ['OPERATIONS_MANAGER', 'DISPATCHER'].includes(currentRole.value)) &&
        authStore.hasPermission('dispatch:dispatch') &&
        ['ASSIGNED'].includes(status),

      canAcceptTrip: (isSuperAdmin.value || currentRole.value === 'DRIVER') &&
        ['DISPATCHED'].includes(status),

      canStartTrip: (isSuperAdmin.value || currentRole.value === 'DRIVER') &&
        ['DRIVER_ACCEPTED', 'PICKUP'].includes(status),

      canArriveDelivery: (isSuperAdmin.value || currentRole.value === 'DRIVER') &&
        ['IN_TRANSIT'].includes(status),

      canUploadPod: (isSuperAdmin.value || ['DRIVER', 'CARRIER', 'OPERATIONS_MANAGER'].includes(currentRole.value)) &&
        authStore.hasPermission('pod:create') &&
        ['DELIVERY', 'IN_TRANSIT', 'DELIVERED'].includes(status),

      canApproveBilling: (isSuperAdmin.value || ['FINANCE_MANAGER', 'TMS_ADMIN'].includes(currentRole.value)) &&
        authStore.hasPermission('billing:approve') &&
        ['DELIVERED', 'COMPLETED'].includes(status),
    };
  }

  /**
   * Execute server-side validated state transition.
   */
  async function transitionState(
    entityType: 'ORDER' | 'SHIPMENT' | 'DISPATCH',
    entityId: string,
    targetState: string,
    reason: string = 'Workflow update',
  ) {
    try {
      const res: any = await api.post(`/api/v1/workflow/${entityType}/${entityId}/transition`, {
        targetState,
        reason,
      });
      const data = res.data || res;
      notify.success(`Status updated to ${targetState}. Next step routed to: ${data.nextResponsibleRole || 'Operations'}`);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Transition failed';
      notify.error(msg);
      throw err;
    }
  }

  /**
   * Reassign resource (Driver, Vehicle, Carrier).
   */
  async function reassign(
    resourceType: 'SHIPMENT' | 'ORDER',
    resourceId: string,
    assignmentType: string,
    targetId: string,
    reason: string = 'Operational assignment',
  ) {
    try {
      const res: any = await api.post(`/api/v1/assignments/${resourceType}/${resourceId}`, {
        assignmentType,
        targetId,
        reason,
      });
      const data = res.data || res;
      notify.success(`${assignmentType} assigned successfully.`);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Assignment failed';
      notify.error(msg);
      throw err;
    }
  }

  return {
    getShipmentActions,
    transitionState,
    reassign,
  };
}
