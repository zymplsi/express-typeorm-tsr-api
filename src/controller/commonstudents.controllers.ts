import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { Registration } from '../entity/Registration';
import { validateTeacherEmail, EmailValidator } from './helper';
import { Student } from '../../src/entity/Student';
import { Teacher } from '../../src/entity/Teacher';

export class CommonStudentsController {
  private registrationRepository = getRepository(Registration);

  /** retrieve a list of students common to a given list of teachers */
  async find(req: Request, res: Response, next: NextFunction) {
    try {
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
          async email =>  await this.validateEntity(email, new Teacher())
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
      const commonStudentsEmailList = await this.getCommonStudensEmailList(
        specifiedTeacherRegistrationList
      );

      res.status(200).json({
        students: commonStudentsEmailList
      });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

  /** retrieve from registaration list id of students*/
  /** that are common to sepcified teachers */
  private async getCommonStudensEmailList(
    specifiedTeacherRegistrationList: Registration[]
  ) {
    /** map through registrations list to get student ids */
    /** and do a count of each student id that is duplicated */
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

        /** list specified teachers' email  */
        const specifiedTeacherEmails = specifiedTeacherRegistrationList.map(
          registration => registration.teacher.email
        );
        
        /** id count should be equal to number of unique specified teachers  */
        /** if the id is common  */
        if (count === new Set(specifiedTeacherEmails).size) {
          return [...idStore, id];
        }
        return idStore;
      }, []);

    /** list the common students email */
    return commonStudensIdList.map(
      id =>
        specifiedTeacherRegistrationList.find(
          registration => registration.studentId === id
        ).student.email
    );
  }

  /** validate specified students' email */
  /** throw error if email is not found */
  async validateEntity(email: string, entity: Student | Teacher) {
    const entityValidator = new EmailValidator(entity, email);
    await entityValidator.validate();
    return entityValidator;
  }

}
