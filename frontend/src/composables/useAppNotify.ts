import { Notify } from 'quasar';

export function useAppNotify() {
  const success = (message: string, caption?: string) => {
    Notify.create({
      type: 'positive',
      icon: 'check_circle',
      message,
      caption,
      position: 'top-right',
      timeout: 2500,
      progress: true,
      actions: [{ icon: 'close', color: 'white', round: true, dense: true, handler: () => {} }],
    });
  };

  const error = (message: string, caption?: string) => {
    Notify.create({
      type: 'negative',
      icon: 'error',
      message,
      caption,
      position: 'top-right',
      timeout: 3500,
      progress: true,
      actions: [{ icon: 'close', color: 'white', round: true, dense: true, handler: () => {} }],
    });
  };

  const warning = (message: string, caption?: string) => {
    Notify.create({
      type: 'warning',
      icon: 'warning',
      message,
      caption,
      textColor: 'dark',
      position: 'top-right',
      timeout: 3000,
      progress: true,
      actions: [{ icon: 'close', color: 'dark', round: true, dense: true, handler: () => {} }],
    });
  };

  const info = (message: string, caption?: string) => {
    Notify.create({
      type: 'info',
      icon: 'info',
      message,
      caption,
      position: 'top-right',
      timeout: 2500,
      progress: true,
      actions: [{ icon: 'close', color: 'white', round: true, dense: true, handler: () => {} }],
    });
  };

  return {
    success,
    error,
    warning,
    info,
  };
}
