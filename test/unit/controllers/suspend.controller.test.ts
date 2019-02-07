import 'source-map-support/register';
import chai, { expect } from 'chai';
import * as typeorm from 'typeorm';
import { stub, createStubInstance, spy } from 'sinon';
import { SuspendController } from '../../../src/controller/suspend.controller';
import { Registration } from '../../..//src/entity/Registration';
import { Request, Response, NextFunction } from 'express';
import { mockRes } from 'sinon-express-mock';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('SuspendController', async () => {
  let req: Partial<Request>;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    res = mockRes();
    next = stub();
  });

  it('should call the Querybuilder', async () => {
    const fakeRepository: typeorm.Repository<Registration> = createStubInstance(
      typeorm.Repository
    );
    stub(typeorm, 'getRepository').returns(fakeRepository);
    fakeRepository.createQueryBuilder('registration');
    const suspendController = new SuspendController();
    expect(fakeRepository.createQueryBuilder).calledWith('registration');
  });

  it('should validate student email', async () => {
    req = {
      body: {
        student: 'abc@123.com'
      }
    };
    const suspendController = new SuspendController();
    const spyValidateStudent = spy(suspendController, 'validateStudent');
    await suspendController.update(<any>req, <any>res, next);

    expect(spyValidateStudent).to.be.calledWith(req.body.student);
  });

  it("should throw 400 'email is not valid', when student email is empty", async () => {
    req = {
      body: {
        student: ''
      }
    };

    const suspendController = new SuspendController();
    await suspendController.update(<any>req, <any>res, next);
    expect(res.status).to.be.calledWith(400);
    expect(res.send).to.be.calledWith('email is not valid');
  });

  it("should throw 400 'email is not valid', when student email is invalid", async () => {
    req = {
      body: {
        student: 'abc123'
      }
    };

    const suspendController = new SuspendController();
    await suspendController.update(<any>req, <any>res, next);
    expect(res.status).to.be.calledWith(400);
    expect(res.send).to.be.calledWith('email is not valid');
  });
});
