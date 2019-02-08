import { validate, ValidationError } from 'class-validator';
import { Student } from '../entity/Student';
import { Teacher } from '../entity/Teacher';
import { getRepository, Repository } from 'typeorm';

/** Validate Student's or Teacher's email with */
/** option to throw error or insert if not found */
export class EmailValidator {
  private repository: Repository<Teacher | Student>;
  private entityWithValidEmail: Teacher | Student;
  private entityFromRepo: Teacher | Student;

  constructor(
    private entity: Teacher | Student,
    private email: string,
    private upsert: boolean = false
  ) {
    this.repository = getRepository(entity.constructor.name);
  }

  /** validate email and throw error if upsert is false */
  /** validate email and insert if upsert is true */
  async validate() {
    this.entityWithValidEmail = await validateEmail(this.email, this.entity);
    this.entityFromRepo = await this.repository
      .createQueryBuilder('entity')
      .where('entity.email = :email', { email: this.email })
      .getOne();

    if (!this.entityFromRepo) {
      if (this.upsert) {
        this.entityFromRepo = await this.repository.save(
          this.entityWithValidEmail
        );
      } else {
        throw new Error(
          `${this.entity.constructor.name.toLowerCase()} is not found`
        );
      }
    }
  }

  /** return validated email with id from repo */
  get validatedEntity() {
    return this.entityFromRepo;
  }
}

/** validate email and throw error if invalid */
export const validateEmail = async (
  email: string,
  type: Teacher | Student
): Promise<Student | Teacher> => {
  type.email = email;
  try {
    const error: ValidationError[] = await validate(type);
    if (error.length > 0) {
      throw new Error('email is not valid');
    }
    return type;
  } finally {
  }
};

export const validateEntity = async (
  email: string,
  entity: Student | Teacher,
  upsert: boolean = false
) => {
  const entityValidator = new EmailValidator(entity, email,upsert);
  await entityValidator.validate();
  return entityValidator.validatedEntity;
};


