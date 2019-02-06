import { RetrieveForNotificationsController } from '../controller/retrievefornotifications.controllers';
import { registerRoutes } from './helper';

const Routes = [
  {
    method: 'post',
    route: '/retrievefornotifications',
    controller: RetrieveForNotificationsController,
    action: 'create'
  }
];

// register express routes from defined application routes
export const retrieveForNotificationsRouter = registerRoutes(Routes);
