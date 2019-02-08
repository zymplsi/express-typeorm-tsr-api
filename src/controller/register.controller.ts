import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { Registration } from '../entity/Registration';
import { Student } from '../entity/Student';
import { Teacher } from '../entity/Teacher';
import { validateEntity } from './helper';

export class RegisterController {
  private registrationRepository = getRepository(Registration);

  /** A teacher can register multiple students. */
  /** A student can also be registered to multiple teachers. */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const specifiedTeacherEmail = req.body.teacher;
      const specifiedStudentsEmailList = req.body.students;

      /** Validate and return specified teacher or insert if not found */
      const specifiedTeacher = await this.validateTeacher(
        specifiedTeacherEmail
      );

      /** Validate and return specified student list or throw Error */
      const specifiedStudentsList = await this.validateStudents(
        specifiedStudentsEmailList
      );

      /** select all students already registered to specified teacher */
      const specifiedTeacherRegistrationList = await this.registrationRepository
        .createQueryBuilder('registration')
        .innerJoinAndSelect('registration.teacher', 'teacher')
        .innerJoinAndSelect('registration.student', 'student')
        .where('teacher.email = :email', { email: specifiedTeacher.email })
        .getMany();

      /** list students to register to specified teacher */
      const studentsToRegisterWithTeacherList = this.studentsToRegisterWithTeacher(
        specifiedTeacherRegistrationList,
        <Student[]>specifiedStudentsList,
        <Teacher>specifiedTeacher
      );

      /** insert teacher, students id pairs into registration repository */
      await this.registrationRepository
        .createQueryBuilder()
        .insert()
        .into(Registration)
        .values(studentsToRegisterWithTeacherList)
        .execute();

      res.sendStatus(204);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

  /** list students to register to specified teacher */
  studentsToRegisterWithTeacher(
    specifiedTeacherRegistrationList: Registration[],
    specifiedStudentsList: Student[],
    specifiedTeacher: Teacher
  ) {
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
    return specifiedStudentsIdListToRegister.map(specifiedStudentId =>
      Object.assign(
        {},
        {
          studentId: specifiedStudentId,
          teacherId: specifiedTeacher.id
        }
      )
    );
  }

  /** Validate and return specified teacher or insert if not found */
  async validateTeacher(email: string) {
    return await validateEntity(email, new Teacher(), true);
  }

  /** Validate and return specified student list or insert if not found */
  async validateStudents(emailList: string[]) {
    if (emailList.length === 0) {
      throw new Error('student email is missing');
    }
    return await Promise.all(
      emailList.map(
        async email => await validateEntity(email, new Student(), true)
      )
    );
  }
}
