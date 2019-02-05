import {
  Entity,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
  Column,
  Unique
} from 'typeorm';
import { Teacher } from './Teacher';
import { Student } from './Student';

@Unique(['teacherId', 'studentId'])
@Entity()
export class Registration {
  @PrimaryColumn()
  studentId: number;

  @PrimaryColumn()
  teacherId: number;

  @Column({
    type: 'tinyint',
    precision: 1,
    default: false
  })
  suspended: boolean;

  @ManyToOne(type => Teacher, teacher => teacher.students, {
    primary: true
  })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @ManyToOne(type => Student, student => student.teachers, {
    primary: true
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;
}
