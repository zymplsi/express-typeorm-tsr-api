import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { validate, ValidationError } from 'class-validator';
import { Registration } from '../entity/Registration';
import { Student } from '../entity/Student';
import { Teacher } from '../entity/Teacher';

export class RegisterController {
  private registrationRepository = getRepository(Registration);
  private studentRepository = getRepository(Student);
  private teacherRepository = getRepository(Teacher);

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const specifiedTeacherEmail = req.body.teacher;
      const specifiedStudentsEmailList = req.body.students;

      /** validate and list specified students and teacher */
      const [
        specifiedTeacher,
        specifiedStudentsList
      ] = await this.validateSpecifiedEmailsOrThrowError(
        specifiedTeacherEmail,
        specifiedStudentsEmailList
      );

      /** list all specified students and also insert new into student repository */
      const specifiedStudentsListWithNewInserts = await this.insertNewSpecifiedStudents(
        specifiedStudentsList
      );

      /** register all specified students with specified teacher */
      await this.registerStudentsWithTeacher(
        specifiedStudentsListWithNewInserts,
        specifiedTeacher
      );
      res.sendStatus(204);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

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

  private async validateSpecifiedEmailsOrThrowError(
    teacherEmail: string,
    studentsEmailList: string[]
  ): Promise<[Teacher, Student[]]> {
    /** validate specified teacher's email*/
    const teacher: Teacher = new Teacher();
    teacher.email = teacherEmail;
    const teacherError: ValidationError[] = await validate(teacher);
    if (teacherError.length > 0) {
      throw new Error('teacher email is not valid');
    }

    const teacherIsMatched = await this.teacherRepository
      .createQueryBuilder('teacher')
      .where('teacher.email = :email', { email: teacherEmail })
      .getOne();

    if (!teacherIsMatched) {
      throw new Error('teacher is not found');
    }

    /** check specified students' email list is not empty */
    const specifiedStudentsEmailList: Array<string> = studentsEmailList;
    if (specifiedStudentsEmailList.length === 0) {
      throw new Error('student email is missing');
    }

    /** validate specified students' email */
    const studentsListValidated: Student[] = await Promise.all(
      studentsEmailList.map(async email => {
        const student = new Student();
        student.email = email;
        const emailError: ValidationError[] = await validate(student);
        if (emailError.length > 0) {
          throw new Error('student email is not valid');
        }
        return student;
      })
    );

    return [teacherIsMatched, studentsListValidated];
  }

  private async insertNewSpecifiedStudents(
    specifiedStudentsList: Student[]
  ): Promise<Student[]> {
    /** list specified students emails */
    const specifiedStudentsEmailList = specifiedStudentsList.map(
      student => student.email
    );

    /** select specified students in student repository */
    const specifiedStudentsInRepository = await this.studentRepository
      .createQueryBuilder('student')
      .where('student.email IN (:students)', {
        students: specifiedStudentsEmailList
      })
      .getMany();

    /** map specified students email that exist in student repository */
    const specifiedStudentsInRepositoryEmailList = specifiedStudentsInRepository.map(
      student => student.email
    );

    /** list specified students email to insert into student repository */
    const studentsToInsertStudentRepositoryEmail = specifiedStudentsList.filter(
      student => !specifiedStudentsInRepositoryEmailList.includes(student.email)
    );

    /** insert specified students into student repository */
    const specifiedStudentsNewInRepository = await this.studentRepository.save(
      studentsToInsertStudentRepositoryEmail
    );

    return [
      ...specifiedStudentsInRepository,
      ...specifiedStudentsNewInRepository
    ];
  }
}
