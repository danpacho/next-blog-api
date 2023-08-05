import { cwd } from 'process'
import { describe, expect, it } from 'vitest'
import { DataExtractor } from '../../helper'
import { extractHeaderNodes } from '../extract.header.node'

describe('extract header nodes from markdown', () => {
    const extractor = new DataExtractor({})
    it('should extract header node in extraction range', async () => {
        const mdData = (await extractor.readFile(`${cwd()}/packages/api/src/lib/__mocks__/headers.md`)) as string

        const headerNodes = extractHeaderNodes(mdData)

        const headingNumbers = headerNodes.map(({ depth }) => depth)
        expect(headingNumbers).toStrictEqual([
            1, 2, 3, 3, 2, 3, 4, 4, 3, 1, 2, 3, 4, 5, 5, 4, 3, 2, 3, 1, 2, 3, 2, 3, 2,
        ])

        const headingChildren = headerNodes.map(({ text }) => text)
        expect(headingChildren).toStrictEqual([
            'h1-1',
            'h2-1',
            'h3-1',
            'h3-2',
            'h2-2',
            'h3-3',
            'h4-2',
            'h4-3',
            'h3-4',
            'h1-2',
            'h2-3',
            'h3-6',
            'h4-5',
            'h5-3',
            'h5-4',
            'h4-6',
            'h3-7',
            'h2-4',
            'h3-8',
            'h1-3',
            'h2-5',
            'h3-9',
            'h2-6',
            'h3-10',
            'h2-7',
        ])
    })
})
