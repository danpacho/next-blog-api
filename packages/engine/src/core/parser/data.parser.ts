import { z } from 'zod'
import type { SchemaTransformer } from '../../types'

export class DataParser {
    public parseDataWithSchema<Data, TargetSchema extends z.ZodSchema>({
        data,
        schema,
        transformer,
    }: {
        data: Data
        schema: TargetSchema
        transformer?: SchemaTransformer<TargetSchema>
    }): TargetSchema {
        const parsedData = schema.parse(data)

        const transformedData = transformer ? transformer(parsedData as z.infer<TargetSchema>) : parsedData

        const parsed = schema.safeParse(transformedData)
        if (parsed.success) {
            return parsed.data as z.infer<TargetSchema>
        } else {
            throw new Error(`error: ${parsed.error.format()._errors.join('\n')}\nvalue: ${parsedData}`)
        }
    }
}
