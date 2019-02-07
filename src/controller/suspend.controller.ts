import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { Registration } from '../entity/Registration';
import { EmailValidator } from './helper';
import { Student } from '../../src/entity/Student';

export class SuspendController {
  private registrationRepository = getRepository(Registration);

  /** retrieve a list of students common to a given list of teachers */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const studentEmail = req.body.student;
   
      // /** validate specified students' email */
      // /** throw error if email is not found */
      const studentValidator = await this.validateStudent(studentEmail);

      /** update student suspended property for all teachers in registration repository */
      await this.registrationRepository
        .createQueryBuilder('registration')
        .update()
        .set({ suspended: true })
        .where('registration.studentId =  :id', {
          id: studentValidator.validatedEntity.id
        })
        .execute();

      res.sendStatus(204);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

  /** validate specified students' email */
  /** throw error if email is not found */
  async validateStudent(email: string) {
    const studentValidator = new EmailValidator(new Student(), email);
    await studentValidator.validate();
    return studentValidator;
  }
}
