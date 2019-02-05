import { teacherRouter } from './teacher.routes';
import { studentRouter } from './student.routes';
import { registerRouter } from './register.routes';

export const apiRoutes = [
  ...teacherRouter,
  ...studentRouter,
  ...registerRouter
];
