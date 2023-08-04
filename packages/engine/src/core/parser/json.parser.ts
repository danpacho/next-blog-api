import { z } from 'zod'
import type { SchemaTransformer } from '../../types'
import { DataParser } from './data.parser'

export class JsonParser extends DataParser {
    /**
     * @description Parse JSON data
     * @param json JSON data
     * @param schema JSON schema
     * @param transformer schema transformer, transform `JSON` data to schema
     */
    public parseJson<JsonSchema extends z.ZodSchema>({
        json,
        schema,
        transformer,
    }: {
        json: string
        schema: JsonSchema
        transformer?: SchemaTransformer<JsonSchema>
    }): z.infer<JsonSchema> {
        const parsedJson = JSON.parse(json) as z.infer<JsonSchema>

        const transformedJson: JsonSchema = this.parseDataWithSchema({
            data: parsedJson,
            schema,
            transformer,
        })

        return transformedJson
    }

    public constructor() {
        super()
    }
}
