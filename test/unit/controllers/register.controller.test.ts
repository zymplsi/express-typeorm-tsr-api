import 'source-map-support/register';
import chai, { expect } from 'chai';
import * as typeorm from 'typeorm';
import { stub, createStubInstance, spy, restore } from 'sinon';
import { RegisterController } from '../../../src/controller/register.controller';
import { Registration } from '../../../src/entity/Registration';
import { Request, Response, NextFunction } from 'express';
import { mockRes } from 'sinon-express-mock';
import sinonChai from 'sinon-chai';

import fs from 'fs';
import { promisify } from 'util';
import { Student } from '../../../src/entity/Student';
import { Teacher } from '../../../src/entity/Teacher';
const promisifyFsFile = promisify(fs.readFile);

chai.use(sinonChai);

describe('RegisterController', async () => {
  let req: Partial<Request>;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    res = mockRes();
    next = stub();
  });

  after(() => {
    restore();
  });

  it('should call the Querybuilder', async () => {
    const fakeRepository: typeorm.Repository<Registration> = createStubInstance(
      typeorm.Repository
    );
    stub(typeorm, 'getRepository').returns(fakeRepository);
    fakeRepository.createQueryBuilder('registration');
    const registerController = new RegisterController();
    expect(fakeRepository.createQueryBuilder).calledWith('registration');
  });

  it('should validate emails', async () => {
    const emailsCorrectList = ['abc@abc.com'];
    const emailsWrongList = ['abc.abc.com'];
    const registerController = new RegisterController();

    registerController.validateTeacher(emailsCorrectList[0]).catch(error => {
      /** error is thrown from Typeorm query which is after the validate function */
      expect(error.message).to.be.equal(
        "Cannot read property 'where' of undefined"
      );
    });
    registerController.validateTeacher(emailsWrongList[0]).catch(error => {
      expect(error.message).to.be.equal('email is not valid');
    });

    registerController.validateStudents(emailsCorrectList).catch(error => {
      /** error is thrown from Typeorm query which is after the validate function */
      expect(error.message).to.be.equal(
        "Cannot read property 'where' of undefined"
      );
    });
    registerController.validateStudents(emailsWrongList).catch(error => {
      expect(error.message).to.be.equal('email is not valid');
    });

    registerController.validateStudents([]).catch(error => {
      expect(error.message).to.be.equal('student email is missing');
    });
  });

  it('should list new students to register to specified teacher', async () => {
    const specifiedTeacherRegistrationList = await promisifyFsFile(
      __dirname + '/specifiedTeacherRegistrationList.json',
      { encoding: 'utf8' }
    );

    const currStudent = new Student();
    currStudent.email = 'abc@abc.com';
    currStudent.id = 1;
    const newStudent = new Student();
    newStudent.email = 'yyy@yyy.com';
    newStudent.id = 101;
    const specifiedStudentsList = [currStudent, newStudent];

    const specifiedTeacher = new Teacher();
    specifiedTeacher.email = '123@123.com';
    specifiedTeacher.id = 1;

    const registerController = new RegisterController();

    const studentsToRegisterWithTeacherList = registerController.studentsToRegisterWithTeacher(
      JSON.parse(specifiedTeacherRegistrationList),
      specifiedStudentsList,
      specifiedTeacher
    );
    
    expect(studentsToRegisterWithTeacherList).to.be.eql([
      { studentId: 101, teacherId: 1 }
    ]);
  });


});
