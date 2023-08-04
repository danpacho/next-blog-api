import { cwd } from 'process'
import { describe, expect, it } from 'vitest'
import { DataExtractor } from '../../helper'
import { getToc } from '../get.toc'

describe('parse table of contents tree data in markdown', () => {
    const extractor = new DataExtractor({})
    it('should get toc', async () => {
        const mdData = (await extractor.readFile(`${cwd()}/packages/engine/src/lib/__mocks__/headers.md`)) as string
        const data = getToc(mdData, {
            max: 5,
            min: 1,
        })

        expect(data).toStrictEqual([
            {
                depth: 1,
                text: 'h1-1',
                href: '#h1-1',
                children: [
                    {
                        depth: 2,
                        text: 'h2-1',
                        href: '#h2-1',
                        children: [
                            { depth: 3, text: 'h3-1', href: '#h3-1', children: undefined },
                            { depth: 3, text: 'h3-2', href: '#h3-2', children: undefined },
                        ],
                    },
                    {
                        depth: 2,
                        text: 'h2-2',
                        href: '#h2-2',
                        children: [
                            {
                                depth: 3,
                                text: 'h3-3',
                                href: '#h3-3',
                                children: [
                                    { depth: 4, text: 'h4-2', href: '#h4-2', children: undefined },
                                    { depth: 4, text: 'h4-3', href: '#h4-3', children: undefined },
                                ],
                            },
                            { depth: 3, text: 'h3-4', href: '#h3-4', children: undefined },
                        ],
                    },
                ],
            },
            {
                depth: 1,
                text: 'h1-2',
                href: '#h1-2',
                children: [
                    {
                        depth: 2,
                        text: 'h2-3',
                        href: '#h2-3',
                        children: [
                            {
                                depth: 3,
                                text: 'h3-6',
                                href: '#h3-6',
                                children: [
                                    {
                                        depth: 4,
                                        text: 'h4-5',
                                        href: '#h4-5',
                                        children: [
                                            { depth: 5, text: 'h5-3', href: '#h5-3', children: undefined },
                                            { depth: 5, text: 'h5-4', href: '#h5-4', children: undefined },
                                        ],
                                    },
                                    { depth: 4, text: 'h4-6', href: '#h4-6', children: undefined },
                                ],
                            },
                            { depth: 3, text: 'h3-7', href: '#h3-7', children: undefined },
                        ],
                    },
                    {
                        depth: 2,
                        text: 'h2-4',
                        href: '#h2-4',
                        children: [{ depth: 3, text: 'h3-8', href: '#h3-8', children: undefined }],
                    },
                ],
            },
            {
                depth: 1,
                text: 'h1-3',
                href: '#h1-3',
                children: [
                    {
                        depth: 2,
                        text: 'h2-5',
                        href: '#h2-5',
                        children: [{ depth: 3, text: 'h3-9', href: '#h3-9', children: undefined }],
                    },
                    {
                        depth: 2,
                        text: 'h2-6',
                        href: '#h2-6',
                        children: [{ depth: 3, text: 'h3-10', href: '#h3-10', children: undefined }],
                    },
                    { depth: 2, text: 'h2-7', href: '#h2-7', children: undefined },
                ],
            },
        ])
    })
})
