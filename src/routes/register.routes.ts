import { RegisterController } from '../controller/register.controller';
import { registerRoutes } from './helper';

  const Routes = [
    {
      method: 'post',
      route: '/register',
      controller: RegisterController,
      action: 'create'
    },
  ];

  // register express routes from defined application routes
  export const registerRouter =  registerRoutes(Routes);
