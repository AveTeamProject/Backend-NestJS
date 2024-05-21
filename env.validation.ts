import { plainToInstance } from 'class-transformer'
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator'

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision'
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment

  @IsNumber()
  PORT: number

  @IsNumber()
  DB_PORT: number

  @IsString()
  DB_HOST: string

  @IsString()
  DB_USERNAME: string

  @IsString()
  DB_PASSWORD: string

  @IsString()
  DB_NAME: string

  @IsString()
  SECRET: string

  @IsString()
  JWT_ACCESS_SECRET: string

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string

  @IsString()
  JWT_REFRESH_SECRET: string

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string
}

export function validate(config: Record<string, unknown>) {
  // console.log('config ', config);
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  })
  // console.log(validatedConfig);

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false
  })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validatedConfig
}
