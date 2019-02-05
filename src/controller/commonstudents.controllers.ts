import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { Registration } from '../entity/Registration';
import { validateTeacherEmail } from './helper';

export class CommonStudentsController {
  private registrationRepository = getRepository(Registration);
  
  /** retrieve a list of students common to a given list of teachers */
  async find(req: Request, res: Response, next: NextFunction) {
    const queryParams = req.query.teacher;

    /** single email queryParam is not an Array */
    /** normalise all queryParams into an Array */
    const specifiedTeacherEmails = Array.isArray(queryParams)
      ? queryParams
      : [queryParams];

    /** validate specified teachers' email */
    /** throw error if email is not found */
    await Promise.all(
      specifiedTeacherEmails.map(
        async email => await validateTeacherEmail(email)
      )
    );

    /** list all students registered to specified teachers */
    const specifiedTeacherRegistrationList = await this.registrationRepository
      .createQueryBuilder('registration')
      .innerJoinAndSelect('registration.teacher', 'teacher')
      .innerJoinAndSelect('registration.student', 'student')
      .where('teacher.email IN (:emails)', { emails: specifiedTeacherEmails })
      .getMany();

    /** retrieve from registaration list id of students*/
    /** that are common to sepcified teachers */
    const commonStudensIdList = specifiedTeacherRegistrationList
      .map(registration => registration.studentId)
      .reduce((idStore, id, _, idList) => {
        let count = 0;

        /** if id has been indentified as common */
        /** skip the loop */
        if (!idStore.includes(id)) {
          for (let i = 0; i < idList.length; i++) {
            if (idList[i] === id) {
              count = count + 1;
            }
          }
        }

        /** id count should be equal to number of specified teachers  */
        /** if the id is common  */
        if (count === specifiedTeacherEmails.length) {
          return [...idStore, id];
        }
        return idStore;
      }, []);

    /** list the common students email */
    const commonStudentsEmailList = commonStudensIdList.map(
      id =>
        specifiedTeacherRegistrationList.find(
          registration => registration.studentId === id
        ).student.email
    );

    res.status(200).json({
      students: commonStudentsEmailList
    });
  }
}
