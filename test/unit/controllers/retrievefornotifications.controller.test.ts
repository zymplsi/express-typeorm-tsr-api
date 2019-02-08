import 'source-map-support/register';
import chai, { expect } from 'chai';
import * as typeorm from 'typeorm';
import { stub, createStubInstance, spy, restore } from 'sinon';
import { RetrieveForNotificationsController } from '../../../src/controller/retrievefornotifications.controllers';
import { Registration } from '../../../src/entity/Registration';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('RetrieveForNotificationsController', async () => {
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

  it('should validate emails', async () => {
    const correctEmail = 'abc@abc.com';
    const wrongEmail = 'abc.abc.com';
    const retrieveForNotificationsController = new RetrieveForNotificationsController();

    retrieveForNotificationsController
      .validateTeacher(correctEmail)
      .catch(error => {
        /** error is thrown from Typeorm query which is after the validate function */
        expect(error.message).to.be.equal(
          "Cannot read property 'where' of undefined"
        );
      });
    retrieveForNotificationsController
      .validateTeacher(wrongEmail)
      .catch(error => {
        expect(error.message).to.be.equal('email is not valid');
      });
  });

  it('should parse emails from notification', async () => {
    const notification = 'string show @hhh.hhh@com @sdf@sdf.com';
    const retrieveForNotificationsController = new RetrieveForNotificationsController();
    const emails = retrieveForNotificationsController.parseSpecifiedeMails(
      notification
    );
    expect(emails).to.be.eql(['hhh.hhh@com', 'sdf@sdf.com']);
  });
});
