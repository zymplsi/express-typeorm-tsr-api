import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { Registration } from '../entity/Registration';
import { validateTeacherEmail, validateStudentEmail } from './helper';

export class RetrieveForNotificationsController {
  private registrationRepository = getRepository(Registration);

  /** retrieve a list of students common to a given list of teachers */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherEmail = req.body.teacher;
      const notification = req.body.notification;

      /** validate specified teacher's email */
      /** throw error if email is not found */
      await validateTeacherEmail(teacherEmail);

      /** parse student's email from message */
      const specifiedStudentsEmailList = this.parseSpecifiedeMails(
        notification
      );

      /** validate specified students' email */
      /** throw error if email is not found */
      await Promise.all(
        specifiedStudentsEmailList.map(
          async email => await validateStudentEmail(email)
        )
      );

      /** list students that are not suspended and registered with specified teacher */
      const notSuspendedStudentsFromTeacher = await this.registrationRepository
        .createQueryBuilder('registration')
        .innerJoinAndSelect('registration.teacher', 'teacher')
        .innerJoinAndSelect('registration.student', 'student')
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
        mentionedStudentsInNotification = await this.registrationRepository
          .createQueryBuilder('registration')
          .innerJoinAndSelect('registration.teacher', 'teacher')
          .innerJoinAndSelect('registration.student', 'student')
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
    }
  }

  /** parse email from message and return in an Array */
  private parseSpecifiedeMails(message: string): string[] {
    const phrase = message.split(' ');
    return phrase
      .filter(str => {
        return str[0] === '@';
      })
      .map(email => {
        return email.slice(1);
      });
  }
}
