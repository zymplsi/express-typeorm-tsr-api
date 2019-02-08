import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { Registration } from '../entity/Registration';
import { validateEntity } from './helper';
import { Student } from '../../src/entity/Student';
import { Teacher } from '../../src/entity/Teacher';
import { validate, ValidationError } from 'class-validator';

export class RetrieveForNotificationsController {
  private registrationRepository = getRepository(Registration);

  /** retrieve a list of students common to a given list of teachers */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherEmail = req.body.teacher;
      const notification = req.body.notification;

      /** parse student's email from message */
      const specifiedStudentsEmailList = this.parseSpecifiedeMails(
        notification
      );
      
      /** Validate and return specified teacher or throw error if not found */
      await this.validateTeacher(teacherEmail);

      /** create join table between teachers and students */
      const jointableQuery = this.registrationRepository
        .createQueryBuilder('registration')
        .innerJoinAndSelect('registration.teacher', 'teacher')
        .innerJoinAndSelect('registration.student', 'student');

      /** list sttudent that are not suspended */
      const notSuspendedStudentsFromTeacher = await jointableQuery
        .where('teacher.email = :email AND registration.suspended = false', {
          email: teacherEmail
        })
        .getMany();

      /** list email from students that are not suspended and registered with specified teacher */
      const notSuspendedStudentsFromTeacherEmail = notSuspendedStudentsFromTeacher.map(
        registration => registration.student.email
      );

      /** list students that are not suspended and mentioned in notification */
      let mentionedStudentsInNotification: Registration[];
      let mentionedStudentsInNotificationEmail: string[] = [];
      if (specifiedStudentsEmailList.length > 0) {
        mentionedStudentsInNotification = await jointableQuery
          .where(
            'registration.suspended = false AND student.email IN (:emails)',
            { emails: specifiedStudentsEmailList }
          )
          .getMany();

        /** list email from students that are not suspended and mentioned in notification */
        mentionedStudentsInNotificationEmail = mentionedStudentsInNotification.map(
          registration => registration.student.email
        );
      }

      /** list notification recipients without duplicates*/
      const notificationRecipientsEmailList = [
        ...notSuspendedStudentsFromTeacherEmail,
        ...mentionedStudentsInNotificationEmail
      ].filter((email, emailIdx, emailList) => {
        return emailList.lastIndexOf(email) === emailIdx;
      });

      res.status(200).json({
        recipients: notificationRecipientsEmailList
      });
    } catch (error) {
      res.status(400).send(error.message);
    } finally {
    }
  }

  /** parse email from message and return in an Array */
  parseSpecifiedeMails(message: string): string[] {
    const phrase = message.split(' ');
    return phrase
      .filter(str => {
        return str[0] === '@';
      })
      .map(email => {
        return email.slice(1);
      })
      .filter(async email => {
        let student = new Student();
        student.email = email;
        try {
          const error: ValidationError[] = await validate(student);
          if (error.length > 0) {
            return false;
          }
          return true;
        } finally {
        }
      });
  }

  /** Validate and return specified teacher or throw error if not found */
  async validateTeacher(email: string) {
    return await validateEntity(email, new Teacher());
  }
}
