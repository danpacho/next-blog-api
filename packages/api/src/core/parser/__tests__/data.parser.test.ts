import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { DataParser } from '../data.parser'

describe('BlogEngine - data parse', () => {
    const dataParser = new DataParser()
    const pureData = {
        title: 'title text',
        preview: 'preview text',
    }
    const schema = z
        .object({
            title: z.string(),
            preview: z.string(),
            view: z.number().int().optional(),
        })
        .strict()

    it('data transformation -> schema validation', async () => {
        const transformedData = dataParser.parseDataWithSchema({
            data: pureData,
            schema,
            transformer: ({ preview, title, view }) => {
                return {
                    preview,
                    title,
                    view: view ? Number(view) : 0,
                }
            },
        })

        expect(transformedData).toStrictEqual({
            ...pureData,
            view: 0,
        })
    })
})
