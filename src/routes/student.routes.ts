import { StudentController } from '../controller/student.controller';
import { registerRoutes } from './helper';

  const Routes = [
    {
      method: 'get',
      route: '/students',
      controller: StudentController,
      action: 'find'
    },
    {
      method: 'get',
      route: '/students/:id',
      controller: StudentController,
      action: 'findById'
    },
    {
      method: 'post',
      route: '/students',
    controller: StudentController,
      action: 'save'
    },
    {
      method: 'delete',
      route: '/students/:id',
      controller: StudentController,
      action: 'deleteById'
    }
  ];

  // register express routes from defined application routes
  export const studentRouter =  registerRoutes(Routes);
