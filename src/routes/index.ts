import { registerRouter } from './register.routes';
import { commonStudentsRouter } from './commonstudents.routes';
import { retrieveForNotificationsRouter } from './retrievefornotifications.routes';
import { suspendRouter } from './suspend.routes';

export const apiRoutes = [
  ...registerRouter,
  ...commonStudentsRouter,
  ...retrieveForNotificationsRouter,
  ...suspendRouter
];
