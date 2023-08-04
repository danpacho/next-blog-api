import matter from 'gray-matter'
import { z } from 'zod'
import type { SchemaTransformer } from '../../types'
import { DataParser } from './data.parser'

export class MetaParser extends DataParser {
    /**
     * @description Parse meta data
     * @returns parsed meta data
     * @param pureMeta meta data
     * @param schema meta schema
     * @param transformer schema transformer, transform meta data to schema
     */
    public parseMeta<MetaSchema extends z.ZodSchema>({
        pureMeta,
        schema,
        transformer,
    }: {
        pureMeta: string
        schema: MetaSchema
        transformer?: SchemaTransformer<MetaSchema>
    }): z.infer<MetaSchema> {
        const meta = matter(pureMeta).data as z.infer<MetaSchema>
        const parsedMeta: MetaSchema = this.parseDataWithSchema({
            data: meta,
            schema,
            transformer,
        })

        return parsedMeta
    }

    public constructor() {
        super()
    }
}
