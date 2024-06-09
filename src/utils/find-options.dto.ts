import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

enum SearchConstraint {
  AND = 'AND',
  OR = 'OR'
}

enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

class SearchCondition {
  @IsString()
  field: string

  @IsEnum(['in', 'out'])
  operator: 'in' | 'out'

  @IsArray()
  value: any[]
}

class SortCondition {
  @IsString()
  field: string

  @IsEnum(SortOrder)
  order: SortOrder
}

export class FindOptionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SearchCondition)
  @IsOptional()
  searchConditions?: SearchCondition[]

  @IsEnum(SearchConstraint)
  @IsOptional()
  searchConstraint?: SearchConstraint

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortCondition)
  @IsOptional()
  sort?: SortCondition[]

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number
}
