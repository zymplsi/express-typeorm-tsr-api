import 'source-map-support/register';
import chai, { expect } from 'chai';
import * as typeorm from 'typeorm';
import { stub, createStubInstance, spy, restore } from 'sinon';
import { CommonStudentsController } from '../../../src/controller/commonstudents.controllers';
import { Registration } from '../../../src/entity/Registration';
import { Request, Response, NextFunction } from 'express';
import { mockRes } from 'sinon-express-mock';
import sinonChai from 'sinon-chai';
import fs from 'fs';
import { promisify } from 'util';

chai.use(sinonChai);

describe('CommonStudentsController', async () => {
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
    const commonStudentsController = new CommonStudentsController();
    expect(fakeRepository.createQueryBuilder).calledWith('registration');
  });

  it('should transform single teacher email into an array of email', async () => {
    req = {
      body: {
        teacher: 'abc@123.com'
      }
    };
    const commonStudentsController = new CommonStudentsController();
    const result = commonStudentsController.normaliseEmailsIntoArray(
      req.body.teacher
    );
    expect(Array.isArray(result)).equal(true);
  });

  it('should validate emails', async () => {
    const emailsCorrectList = ['abc@abc.com'];
    const emailsWrongList = ['abc.abc.com'];
    const commonStudentsController = new CommonStudentsController();
    commonStudentsController.validateEmails(emailsCorrectList).catch(error => {
      /** error is thrown from Typeorm query which is after the validate function */
      expect(error.message).to.be.equal(
        "Cannot read property 'where' of undefined"
      );
    });
    commonStudentsController.validateEmails(emailsWrongList).catch(error => {
      expect(error.message).to.be.equal('email is not valid');
    });
  });

  it('should get common list of students email', async () => {
    const promisifyFsReadFile =  promisify(fs.readFile);
    const registrations = await promisifyFsReadFile(__dirname + '/registration.json', {
      encoding: 'utf8'
    });
    const commonStudentsController = new CommonStudentsController();
    const commonStudentEmail =  await commonStudentsController.getCommonStudensEmailList(JSON.parse(registrations));

    expect(commonStudentEmail).to.be.eql(['eee@eee.com','ddd@ddd.com'])

  });
});
