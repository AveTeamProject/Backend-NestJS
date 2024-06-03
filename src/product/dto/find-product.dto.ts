// import { ApiProperty } from '@nestjs/swagger'
// import { Product } from 'src/entities/product.entity'
// import { ConstraintOperator } from 'src/enums'
// import { SearchConditionDto } from 'src/utils/search-condition.dto'
// import { SortConditionDto } from 'src/utils/sort-condition.dto'

// export class FindProductsDto {
//   @ApiProperty({ type: () => Product })
//   readonly searchConditions?: SearchConditionDto<Product>[]
//   readonly searchConstraint?: ConstraintOperator = ConstraintOperator.AND
//   @ApiProperty({ type: () => Product })
//   readonly sort?: SortConditionDto<Product>[]
//   readonly page?: number = 1
//   readonly limit?: number = 10
// }
