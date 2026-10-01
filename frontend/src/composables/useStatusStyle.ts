export interface StatusStyle {
  color: string;
  textColor?: string;
  icon: string;
  label: string;
}

export function useStatusStyle() {
  const statusDict: Record<string, StatusStyle> = {
    // Operations & Shipments
    CONFIRMED: { color: 'cyan-9', textColor: 'cyan-1', icon: 'check_circle', label: 'Confirmed' },
    IN_TRANSIT: { color: 'blue-9', textColor: 'blue-1', icon: 'local_shipping', label: 'In Transit' },
    DISPATCHED: { color: 'indigo-9', textColor: 'indigo-1', icon: 'send', label: 'Dispatched' },
    ASSIGNED: { color: 'deep-purple-9', textColor: 'deep-purple-1', icon: 'assignment_ind', label: 'Assigned' },
    DELIVERED: { color: 'positive', textColor: 'white', icon: 'done_all', label: 'Delivered' },
    DELAYED: { color: 'warning', textColor: 'dark', icon: 'warning', label: 'Delayed' },
    CANCELLED: { color: 'negative', textColor: 'white', icon: 'cancel', label: 'Cancelled' },
    DRAFT: { color: 'grey-8', textColor: 'grey-2', icon: 'edit_note', label: 'Draft' },
    CREATED: { color: 'teal-9', textColor: 'teal-1', icon: 'add_circle_outline', label: 'Created' },

    // Fleet & Drivers
    AVAILABLE: { color: 'positive', textColor: 'white', icon: 'check', label: 'Available' },
    ON_TRIP: { color: 'blue-8', textColor: 'white', icon: 'navigation', label: 'On Trip' },
    MAINTENANCE: { color: 'orange-9', textColor: 'white', icon: 'build', label: 'Maintenance' },
    INACTIVE: { color: 'grey-8', textColor: 'grey-3', icon: 'block', label: 'Inactive' },

    // Finance & Invoices
    PAID: { color: 'positive', textColor: 'white', icon: 'paid', label: 'Paid' },
    UNPAID: { color: 'warning', textColor: 'dark', icon: 'pending', label: 'Unpaid' },
    OVERDUE: { color: 'negative', textColor: 'white', icon: 'alarm_on', label: 'Overdue' },

    // Generic
    ACTIVE: { color: 'positive', textColor: 'white', icon: 'check_circle', label: 'Active' },
    PENDING: { color: 'amber-9', textColor: 'dark', icon: 'schedule', label: 'Pending' },
  };

  function getStatusStyle(status: string): StatusStyle {
    if (!status) {
      return { color: 'grey-8', textColor: 'grey-2', icon: 'help_outline', label: 'Unknown' };
    }
    const normalized = status.toUpperCase().replace(/\s+/g, '_');
    return statusDict[normalized] || {
      color: 'grey-8',
      textColor: 'grey-2',
      icon: 'info',
      label: status.replace(/_/g, ' '),
    };
  }

  return {
    getStatusStyle,
  };
}
