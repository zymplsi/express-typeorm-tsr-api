import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { Registration } from '../entity/Registration';
import { Student } from '../entity/Student';
import { Teacher } from '../entity/Teacher';
import { validateTeacherEmail, validateStudentEmail } from './helper';

export class RegisterController {
  private registrationRepository = getRepository(Registration);
  
  /** A teacher can register multiple students. */
  /** A student can also be registered to multiple teachers. */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const specifiedTeacherEmail = req.body.teacher;
      const specifiedStudentsEmailList = req.body.students;

      /** validate and list specified students and teacher */
      const [
        specifiedTeacher,
        specifiedStudentsList
      ] = await this.validateSpecifiedEmails(
        specifiedTeacherEmail,
        specifiedStudentsEmailList
      );

      /** register all specified students with specified teacher */
      await this.registerStudentsWithTeacher(
        specifiedStudentsList,
        specifiedTeacher
      );
      res.sendStatus(204);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

  /** Register all specified students to specified teacher. */
  /** Checks if student is already registered. */
  /** Register only new students and throw error if no */
  /** new student is to be registered */
  private async registerStudentsWithTeacher(
    specifiedStudentsList: Student[],
    specifiedTeacher: Teacher
  ) {
    /** select all students already registered to specified teacher */
    const specifiedTeacherRegistrationList = await this.registrationRepository
      .createQueryBuilder('registration')
      .innerJoinAndSelect('registration.teacher', 'teacher')
      .innerJoinAndSelect('registration.student', 'student')
      .where('teacher.email = :email', { email: specifiedTeacher.email })
      .getMany();

    /** list all student's email already registered with the specified teacher */
    const studentRegisteredWithTeacherEmailList = specifiedTeacherRegistrationList.map(
      registration => registration.student.email
    );

    /** list all students email that are both already registered and yet to be to specified teacher*/
    const specifiedStudentsEmailList = specifiedStudentsList.map(
      student => student.email
    );

    /** list all student's email that are yet to be registered with specified teacher */
    const specifiedStudentsToRegisterEmailList = specifiedStudentsEmailList.filter(
      (specifiedStudentEmail: string) =>
        !studentRegisteredWithTeacherEmailList.includes(specifiedStudentEmail)
    );

    /** list all students Id that are yet to be registered with specified teacher */
    const specifiedStudentsIdListToRegister = specifiedStudentsList
      .filter((student: Student) =>
        specifiedStudentsToRegisterEmailList.includes(student.email)
      )
      .map((student: Student) => student.id);

    if (specifiedStudentsIdListToRegister.length === 0) {
      throw new Error('no new student to register');
    }

    /** create list of teacher, student id pairs for insert to registration repository */
    const specifiedTeacherStudentsToRegister = specifiedStudentsIdListToRegister.map(
      specifiedStudentId =>
        Object.assign(
          {},
          {
            studentId: specifiedStudentId,
            teacherId: specifiedTeacher.id
          }
        )
    );

    /** insert teacher, students id pairs into registration repository */
    return await this.registrationRepository
      .createQueryBuilder()
      .insert()
      .into(Registration)
      .values(specifiedTeacherStudentsToRegister)
      .execute();
  }

  /** Validate and return list specified students and teacher. */
  /** Upsert if students or teacher are not found, into */
  /** Student and Teacher repository accordingly. */
  /** Will throw error if student list is empty */
  private async validateSpecifiedEmails(
    teacherEmail: string,
    studentsEmailList: string[]
  ): Promise<[Teacher, Student[]]> {
    /** validate specified teacher's email*/
    const teacherValidated = await validateTeacherEmail(teacherEmail, true);

    /** check specified students' email list is not empty */
    const specifiedStudentsEmailList: Array<string> = studentsEmailList;
    if (specifiedStudentsEmailList.length === 0) {
      throw new Error('student email is missing');
    }

    /** validate specified students' email */
    const studentsListValidated: Student[] = await Promise.all(
      studentsEmailList.map(
        async email => await validateStudentEmail(email, true)
      )
    );

    return [teacherValidated, studentsListValidated];
  }
}
