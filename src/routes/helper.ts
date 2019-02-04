import { Router, Request, Response } from 'express';
const router = Router();

export interface IRoute {
  method: string;
  route: string;
  controller: any;
  action: string;
}

export function registerRoutes(Routes: IRoute[]) {
  return Routes.map(route => {
    return (router as any)[route.method](
      route.route,
      (req: Request, res: Response, next: Function) => {
        const result = new (route.controller as any)()[route.action](
          req,
          res,
          next
        );
      }
    );
  });
}
