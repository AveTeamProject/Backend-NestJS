import { SelectQueryBuilder } from 'typeorm'
import { FindOptionsDto } from './find-options.dto'

export function applyFilters<T>(
  qb: SelectQueryBuilder<T>,
  options: FindOptionsDto,
  alias: string
): SelectQueryBuilder<T> {
  const { searchConditions = [], searchConstraint = 'AND', sort = [], page = 1, limit = 10 } = options

  if (searchConditions.length > 0) {
    const conditionStrings = searchConditions.map((cond) => {
      const isStringValue = cond.value.every((val) => typeof val === 'string')
      if (isStringValue) {
        const likeConditions = cond.value.map((val) => `${alias}.${cond.field} LIKE '%${val}%'`).join(` OR `)
        return cond.operator === 'in' ? `(${likeConditions})` : `NOT (${likeConditions})`
      } else {
        const values = cond.value.map((val) => `'${val}'`).join(',')
        return cond.operator === 'in'
          ? `${alias}.${cond.field} IN (${values})`
          : `${alias}.${cond.field} NOT IN (${values})`
      }
    })
    const whereClause = conditionStrings.join(` ${searchConstraint} `)
    qb.andWhere(whereClause)
  }

  sort.forEach((s) => {
    qb.addOrderBy(`${alias}.${s.field}`, s.order)
  })

  const skip = (page - 1) * limit
  qb.skip(skip).take(limit)

  return qb
}
