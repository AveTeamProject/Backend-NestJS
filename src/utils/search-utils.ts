// import { FindOperator, LessThan, MoreThan, LessThanOrEqual, MoreThanOrEqual, Like, Equal, Between } from 'typeorm'
// import { SearchConditionDto } from './search-condition.dto'
// import { ConstraintOperator, SearchOperator } from 'src/enums'

// function isDate(value: any): boolean {
//   if (typeof value === 'string') {
//     const date = new Date(value)
//     return !isNaN(date.valueOf())
//   }
//   return value instanceof Date && !isNaN(value.valueOf())
// }

// function buildDateOperator<T>(condition: SearchConditionDto<T>): FindOperator<any> {
//   const date = new Date(condition.value as string)
//   switch (condition.operator) {
//     case SearchOperator.LT:
//       return LessThan(date)
//     case SearchOperator.GT:
//       return MoreThan(date)
//     case SearchOperator.LTE:
//       return LessThanOrEqual(date)
//     case SearchOperator.GTE:
//       return MoreThanOrEqual(date)
//     case SearchOperator.EQUALS:
//       const startOfDay = new Date(date.setHours(0, 0, 0, 0))
//       const endOfDay = new Date(date.setHours(23, 59, 59, 999))
//       return Between(startOfDay, endOfDay)
//     default:
//       return Equal(date)
//   }
// }

// function buildNonDateOperator<T>(condition: SearchConditionDto<T>): FindOperator<any> {
//   switch (condition.operator) {
//     case SearchOperator.LT:
//       return LessThan(condition.value as string)
//     case SearchOperator.GT:
//       return MoreThan(condition.value as string)
//     case SearchOperator.LTE:
//       return LessThanOrEqual(condition.value as string)
//     case SearchOperator.GTE:
//       return MoreThanOrEqual(condition.value as string)
//     case SearchOperator.CONTAINS:
//       return Like(`%${condition.value}%`)
//     case SearchOperator.EQUALS:
//     default:
//       return Equal(condition.value as string)
//   }
// }

// export function buildWhereConditions<T>(
//   searchConditions: SearchConditionDto<T>[],
//   constraint: ConstraintOperator = ConstraintOperator.AND
// ): Record<string, FindOperator<any>> | Record<string, any>[] {
//   const where: Record<string, FindOperator<any>>[] = []

//   if (searchConditions) {
//     searchConditions.forEach((condition) => {
//       const value = condition.value
//       const operatorCondition = isDate(value) ? buildDateOperator(condition) : buildNonDateOperator(condition)
//       where.push({ [condition.field as string]: operatorCondition })
//     })
//   }

//   return constraint === ConstraintOperator.AND
//     ? where.reduce((acc, condition) => ({ ...acc, ...condition }), {})
//     : where
// }
