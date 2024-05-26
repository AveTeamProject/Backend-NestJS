import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Entity, EntityManager, Repository } from 'typeorm';

@Injectable()
export class TransactionManager {
  constructor(@InjectDataSource() private readonly connection: DataSource) {}

  async transactional<T>(runInTransaction: (entityManager: EntityManager) => Promise<T>): Promise<T> {
    return await this.connection.transaction(runInTransaction);
  }
}
