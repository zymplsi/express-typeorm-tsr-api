import {
  PrimaryGeneratedColumn,
  Column,
  Index,
  Entity,
  OneToMany
} from 'typeorm';
import { IsEmail } from 'class-validator';
import { Student } from './Student';
import { Registration } from './Registration';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({
    unique: true
  })
  @Column({
    unique: true
  })
  @IsEmail()
  email: string;

  @OneToMany(type => Registration, registration => registration.student)
  students: Student[];
}
