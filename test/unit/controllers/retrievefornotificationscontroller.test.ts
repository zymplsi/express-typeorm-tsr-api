import 'source-map-support/register';
import chai, { expect } from 'chai';
import * as typeorm from 'typeorm';
import { stub, createStubInstance, spy, restore } from 'sinon';
import { RetrieveForNotificationsController } from '../../../src/controller/retrievefornotifications.controllers';
import { Registration } from '../../../src/entity/Registration';
import { Request, Response, NextFunction } from 'express';
import { mockRes } from 'sinon-express-mock';
import sinonChai from 'sinon-chai';


chai.use(sinonChai);

describe('RetrieveForNotificationsController', async () => {
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
    const retrieveForNotificationsController = new RetrieveForNotificationsController();
    expect(fakeRepository.createQueryBuilder).calledWith('registration');
  });

  it('should validate teacher email', async () => {
    req = {
      body: {
        teacher: 'abc@123.com'
      }
    };
    const retrieveForNotificationsController = new RetrieveForNotificationsController();
    const spyValidateEntity = spy(
      retrieveForNotificationsController,
      'validateEntity'
    );
    await retrieveForNotificationsController.create(<any>req, <any>res, next);

    expect(spyValidateEntity).to.be.calledWith(req.body.teacher);
  });

  it('should parse students email', async () => {
    req = {
      body: {
        notification: 'Hello @abc@123.com World @def@456.com'
      }
    };
    const retrieveForNotificationsController = new RetrieveForNotificationsController();
    const emails = retrieveForNotificationsController.parseSpecifiedeMails(
      req.body.notification
    );
    expect(emails.length).to.equal(2);
  });

  it("should throw 400 'email is not valid', when teacher email is empty", async () => {
    req = {
      body: {
        teacher: ''
      }
    };

    const retrieveForNotificationsController = new RetrieveForNotificationsController();
    await retrieveForNotificationsController.create(<any>req, <any>res, next);
    expect(res.status).to.be.calledWith(400);
    expect(res.send).to.be.calledWith('email is not valid');
  });

  it("should throw 400 'email is not valid', when teacher email is invalid", async () => {
    req = {
      body: {
        studetachernt: 'abc123'
      }
    };

    const retrieveForNotificationsController = new RetrieveForNotificationsController();
    await retrieveForNotificationsController.create(<any>req, <any>res, next);
    expect(res.status).to.be.calledWith(400);
    expect(res.send).to.be.calledWith('email is not valid');
  });
});
