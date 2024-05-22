import { Request as BaseRequest } from 'express'
import { QueryRunner } from 'typeorm'

declare module 'express' {
  export interface Request extends BaseRequest {
    queryRunner?: QueryRunner
  }
}
