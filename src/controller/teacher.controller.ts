import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { Teacher } from '../entity/Teacher';
import { validate, ValidationError } from 'class-validator';

export class TeacherController {
  private teacherRepository = getRepository(Teacher);

  /** finds all teachers with limit and offset filters */

  async find(req: Request, res: Response, next: NextFunction) {
    const query = this.teacherRepository.createQueryBuilder('teacher');

    const { offset, limit } = req.query.filter;

    try {
      if (limit > 0) {
        query.limit(limit);
      } else {
        throw await new Error('limit must not be zero');
      }

      if (offset) {
        query.offset(offset);
      }

      const result = await query.getMany();
      res.send(result);
    } catch (error) {
      res.status(400).send(JSON.stringify(error.message));
    }
  }

  /** find teacher by id */
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.teacherRepository.findOne(req.params.id);
      if (result) {
        res.send(result);
      } else {
        res.send({});
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

  /** save a new teacher */
  async save(req: Request, res: Response, next: NextFunction) {
    let validationErrors: ValidationError[];

    try {
      const teacher = new Teacher();
      teacher.email = req.body.email;
      validationErrors = await validate(teacher);
      if (validationErrors.length > 0) {
        throw 400;
      }

      await this.teacherRepository.save(teacher);
      res.send(teacher);
    } catch (error) {
      if (error === 400) {
        res.status(400).send(JSON.stringify(validationErrors[0].constraints));
      } else {
        res.status(400).send(JSON.stringify(error.message));
      }
    }
  }

  /** delete a teacher by Id */
  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.teacherRepository
        .createQueryBuilder()
        .delete()
        .where('id = :id', { id: req.params.id })
        .execute();

      const { affectedRows } = result.raw;
      if (affectedRows === 0) {
        throw new Error('user does not exist!');
      }

      res.sendStatus(204);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
}
