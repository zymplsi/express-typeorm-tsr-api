import { validate, ValidationError } from 'class-validator';
import { Student } from '../entity/Student';
import { Teacher } from '../entity/Teacher';
import { getRepository, Repository } from 'typeorm';

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

  public async validate() {
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

  get validatedEntity() {
    return this.entityFromRepo;
  }
}

/** validate specified teacher's email with upsert option */
/** and throw error if invalid */
export const validateTeacherEmail = async (
  email: string,
  upsert: boolean = false
): Promise<Teacher> => {
  let teacherMatched: Teacher;
  const teacher = await validateEmail(email, new Teacher());

  const teacherRepository = getRepository(Teacher);
  teacherMatched = await teacherRepository
    .createQueryBuilder('teacher')
    .where('teacher.email = :email', { email: teacher.email })
    .getOne();

  if (!teacherMatched) {
    if (upsert) {
      teacherMatched = await teacherRepository.save(teacher);
    } else {
      throw new Error('teacher is not found');
    }
  }

  return teacherMatched;
};

/** validate specified student's email with upsert option */
/** and throw error if invalid */
export const validateStudentEmail = async (
  email: string,
  upsert: boolean = false
): Promise<Student> => {
  console.log('validate');
  let studentMatched: Student;
  const student = await validateEmail(email, new Student());
  const studentRepository = getRepository(Student);
  studentMatched = await studentRepository
    .createQueryBuilder('student')
    .where('student.email = :email', { email: student.email })
    .getOne();

  if (!studentMatched) {
    if (upsert) {
      studentMatched = await studentRepository.save(student);
    } else {
      throw new Error('student is not found');
    }
  }

  return studentMatched;
};

/** validate email and throw error if invalid */
export const validateEmail = async (
  email: string,
  type: Teacher | Student
): Promise<Student | Teacher> => {
  type.email = email;
  const error: ValidationError[] = await validate(type);
  if (error.length > 0) {
    throw new Error('email is not valid');
  }
  return type;
};
