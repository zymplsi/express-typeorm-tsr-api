import {
  PrimaryGeneratedColumn,
  Column,
  Index,
  Entity,
  OneToMany
} from 'typeorm';
import { IsEmail } from 'class-validator';
import { Teacher } from './Teacher';
import { Registration } from './Registration';

@Entity()
export class Student {
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
  teachers: Teacher[];
}
