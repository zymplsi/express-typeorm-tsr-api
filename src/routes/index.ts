import { teacherRouter } from './teacher.routes';
import { studentRouter } from './student.routes';

export const apiRoutes = [...teacherRouter, ...studentRouter];
