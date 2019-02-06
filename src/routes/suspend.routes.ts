import { SuspendController } from '../controller/suspend.controller';
import { registerRoutes } from './helper';

  const Routes = [
    {
      method: 'post',
      route: '/suspend',
      controller: SuspendController,
      action: 'update'
    },
  ];

  // register express routes from defined application routes
  export const suspendRouter =  registerRoutes(Routes);
