import { Injectable } from '@nestjs/common'

@Injectable()
export class CommonService {
  mapper<T, U>(model: T, dtoFactory: any): U {
    const dtoInstance = new dtoFactory()
    Object.keys(model).forEach((key) => {
      if (dtoInstance.hasOwnProperty(key)) {
        dtoInstance[key] = model[key]
      }
    })
    return dtoInstance
  }
}
