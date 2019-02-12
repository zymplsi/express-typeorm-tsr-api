import 'source-map-support/register';
import chai, { expect } from 'chai';
import * as typeorm from 'typeorm';
import { createSandbox, SinonSandbox } from 'sinon';
import { RegisterController } from '../../../src/controller/register.controller';
import sinonChai from 'sinon-chai';

import { Teacher } from '../../../src/entity/Teacher';
import { Student } from '../../../src/entity/Student';

chai.use(sinonChai);

describe('RegisterController', async () => {
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call query for all students already registered to specified teacher', async () => {
    const fakeSelectQueryBuilderResult = [];
    const fakeSelectQueryBuilder = sandbox.createStubInstance(
      typeorm.SelectQueryBuilder
    );
    fakeSelectQueryBuilder.innerJoinAndSelect.returnsThis();
    fakeSelectQueryBuilder.where.returnsThis();
    fakeSelectQueryBuilder.getMany.resolves(fakeSelectQueryBuilderResult);

    const fakeRepository = sandbox.createStubInstance(typeorm.Repository);
    fakeRepository.createQueryBuilder.returns(<any>fakeSelectQueryBuilder);
    sandbox.stub(typeorm, 'getRepository').returns(fakeRepository);

    const registerController = new RegisterController();
    const result = await registerController.querySpecifiedTeacherRegistrationList(
      new Teacher()
    );

    expect(result).equal(fakeSelectQueryBuilderResult);
  });

  it('should call function to validate teacher email function', async () => {
    const teacher = new Teacher();
    const fakeRepository = sandbox.createStubInstance(typeorm.Repository);
    sandbox.stub(typeorm, 'getRepository').returns(fakeRepository);
    const registerController = new RegisterController();
    sandbox.stub(registerController, 'validateTeacher').resolves(teacher);

    const validateTeacherResolved = await registerController.validateTeacher(
      null
    );
    expect(validateTeacherResolved).equal(teacher);
  });

  it('should call function to validate students email', async () => {
    const student = new Student();
    const fakeRepository = sandbox.createStubInstance(typeorm.Repository);
    sandbox.stub(typeorm, 'getRepository').returns(fakeRepository);
    const registerController = new RegisterController();
    sandbox.stub(registerController, 'validateStudents').resolves([student]);

    const validateStudentResolved = await registerController.validateStudents(
      null
    );
    expect(validateStudentResolved).eql([student]);
  });

  it('should call function to insert teacher and students id pairs into registration repository', async () => {
    const fakeInsertQueryBuilder = sandbox.createStubInstance(
      typeorm.InsertQueryBuilder
    );
    fakeInsertQueryBuilder.insert.returnsThis();
    fakeInsertQueryBuilder.into.returnsThis();
    fakeInsertQueryBuilder.values.returnsThis();
    fakeInsertQueryBuilder.execute();

    const fakeRepository = sandbox.createStubInstance(typeorm.Repository);
    fakeRepository.createQueryBuilder.returns(<any>fakeInsertQueryBuilder);
    sandbox.stub(typeorm, 'getRepository').returns(fakeRepository);

    const registerController = new RegisterController();
    await registerController.insertNewRegistraiton([
      { studentId: 1, teacherId: 1 }
    ]);

    expect(fakeInsertQueryBuilder.execute).called;
  });
});
