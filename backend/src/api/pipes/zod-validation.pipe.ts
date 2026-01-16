import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { ZodSchema, ZodError } from 'zod'

/**
 * Zod 驗證管道
 * 使用方式：在 Controller 方法參數上使用 @Body(ZodValidationPipe(CreateExampleSchema))
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value)
      return parsedValue
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: '驗證失敗',
          errors: error.errors,
        })
      }
      throw new BadRequestException('驗證失敗')
    }
  }
}

// 輔助函數：建立 Zod 驗證管道
export function ZodValidationPipe(schema: ZodSchema) {
  return new ZodValidationPipe(schema)
}
