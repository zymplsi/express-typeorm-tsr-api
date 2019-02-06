import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { Registration } from '../entity/Registration';
import { validateStudentEmail } from './helper';

export class SuspendController {
  private registrationRepository = getRepository(Registration);

  /** retrieve a list of students common to a given list of teachers */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const studentEmail = req.body.student;

      /** validate specified students' email */
      /** throw error if email is not found */
      const studentToBeSuspended = await validateStudentEmail(studentEmail);

      /** update student suspended property for all teachers in registration repository */
      await this.registrationRepository
        .createQueryBuilder('registration')
        .update()
        .set({ suspended: true })
        .where('registration.studentId =  :id', { id: studentToBeSuspended.id })
        .execute();

      res.sendStatus(204);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
}
