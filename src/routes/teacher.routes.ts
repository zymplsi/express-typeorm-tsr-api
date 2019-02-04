import { TeacherController } from '../controller/teacher.controller';
import { registerRoutes } from './helper';

  const Routes = [
    {
      method: 'get',
      route: '/teachers',
      controller: TeacherController,
      action: 'find'
    },
    {
      method: 'get',
      route: '/teachers/:id',
      controller: TeacherController,
      action: 'findById'
    },
    {
      method: 'post',
      route: '/teachers',
    controller: TeacherController,
      action: 'save'
    },
    {
      method: 'delete',
      route: '/teachers/:id',
      controller: TeacherController,
      action: 'deleteById'
    }
  ];

  // register express routes from defined application routes
  export const teacherRouter =  registerRoutes(Routes);
