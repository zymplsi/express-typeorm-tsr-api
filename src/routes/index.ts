import { teacherRouter } from './teacher.routes';
import { studentRouter } from './student.routes';
import { registerRouter } from './register.routes';
import { commonStudentsRouter } from './commonstudents.routes';
import { retrieveForNotificationsRouter } from './retrievefornotifications.routes';
import { suspendRouter } from './suspend.routes';

export const apiRoutes = [
  ...teacherRouter,
  ...studentRouter,
  ...registerRouter,
  ...commonStudentsRouter,
  ...retrieveForNotificationsRouter,
  ...suspendRouter
];
