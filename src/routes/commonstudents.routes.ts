import { CommonStudentsController } from '../controller/commonstudents.controllers';
import { registerRoutes } from './helper';

  const Routes = [
    {
      method: 'get',
      route: '/commonstudents',
      controller: CommonStudentsController,
      action: 'find'
    },
  ];

  // register express routes from defined application routes
  export const commonStudentsRouter =  registerRoutes(Routes);
