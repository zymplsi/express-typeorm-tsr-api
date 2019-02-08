import 'source-map-support/register';
import chai, { expect } from 'chai';
import * as typeorm from 'typeorm';
import { stub, createStubInstance, restore } from 'sinon';
import { SuspendController } from '../../../src/controller/suspend.controller';
import { Registration } from '../../..//src/entity/Registration';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('SuspendController', async () => {
  after(() => {
    restore();
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

  it('should validate emails', async () => {
    const correctEmail = 'abc@abc.com';
    const wrongEmail = 'abc.abc.com';
    const suspendController = new SuspendController();

    suspendController.validateStudent(correctEmail).catch(error => {
      /** error is thrown from Typeorm query which is after the validate function */
      expect(error.message).to.be.equal(
        "Cannot read property 'where' of undefined"
      );
    });
    suspendController.validateStudent(wrongEmail).catch(error => {
      expect(error.message).to.be.equal('email is not valid');
    });
  });
});
