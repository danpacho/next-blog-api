import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import mockJson from '../__mocks__/json.parser.mock.json'
import { JsonParser } from '../json.parser'

describe('BlogEngine - json parser', () => {
    const jsonParser = new JsonParser()
    const schema = z.object({
        string: z.string(),
        array: z.array(z.number()),
        nested: z.object({
            string: z.string(),
            array: z.array(z.number()),
        }),
    })
    it('parse json data from stringified json', async () => {
        const parsedJson = jsonParser.parseJson({
            json: JSON.stringify(mockJson),
            schema,
            transformer: ({ array, nested, string }) => {
                const res = nested.array.map(Number)
                const transformedNested = {
                    array: res,
                    string: nested.string,
                }
                return {
                    array: array.map(Number),
                    nested: transformedNested,
                    string,
                }
            },
        })

        expect(parsedJson).toStrictEqual({
            string: 'string',
            array: [1, 2, 3],
            nested: {
                array: [1, 2, 3],
                string: 'string',
            },
        })
    })
})
