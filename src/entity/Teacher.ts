import { PrimaryGeneratedColumn, Column, Index, Entity } from 'typeorm';
import { IsEmail } from 'class-validator';

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
}
