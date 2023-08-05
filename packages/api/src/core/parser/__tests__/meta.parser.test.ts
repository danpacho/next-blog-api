import { cwd } from 'process'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { DataExtractor } from '../../../helper'
import { MetaParser } from '../meta.parser'

describe('blog core - meta parser', () => {
    const metaParser = new MetaParser()
    const extractor = new DataExtractor({})
    const schema = z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
        tags: z.string().array(),
    })

    it('should parse meta data from .md header data', async () => {
        const data = (await extractor.readFile(
            `${cwd()}/packages/api/src/core/parser/__mocks__/meta.parser.mock.md`
        )) as string
        const parsedMeta = metaParser.parseMeta({
            pureMeta: data,
            schema,
            transformer: ({ date, description, tags, title }) => {
                const transformedDescription = `${description} is transformed`
                const transformedTags = tags.map((tag) => `${tag} is transformed`)
                const transformedTitle = `${title} is transformed`
                return {
                    date,
                    description: transformedDescription,
                    tags: transformedTags,
                    title: transformedTitle,
                }
            },
        })

        expect(parsedMeta).toStrictEqual({
            title: 'title is transformed',
            date: new Date('2023-01-01T00:00:00.000Z'),
            description: 'description is transformed',
            tags: ['tag1 is transformed', 'tag2 is transformed'],
        })
    })
})
