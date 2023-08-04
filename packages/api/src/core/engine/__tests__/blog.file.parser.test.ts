import { cwd } from 'process'
import { describe, expect, it } from 'vitest'
import { DataExtractor } from '../../../helper'
import javascriptDescription from '../__mocks__/blog/javascript/description.json'
import typescriptDescription from '../__mocks__/blog/typescript/description.json'
import { BlogFileParser } from '../blog.file.parser'
import { BlogPath } from '../blog.path'

describe('BlogEngine - blog file parser', () => {
    const extractor = new DataExtractor({})
    const sourcePath = `${cwd()}/packages/engine/src/core/engine/__mocks__`
    const blogFileParser = new BlogFileParser({
        blogPath: new BlogPath({
            sourcePath,
        }),
        dataExtractor: extractor,
        fileNameExceptions: ['profile.json'],
    })

    it('should parse blog category names', async () => {
        const allCategoryNames = await blogFileParser.getAllCategoryNames()
        expect(allCategoryNames).toStrictEqual(['javascript', 'typescript'])
    })

    it('should parse blog post names', async () => {
        const allCategoryNames = await blogFileParser.getAllCategoryNames()

        const allPostFileNames = (
            await Promise.all(
                allCategoryNames.map(async (categoryName) => {
                    const postNames = await blogFileParser.getAllPostFileNames(categoryName)
                    return postNames
                })
            )
        ).flat()

        expect(allPostFileNames).toStrictEqual(['js1.mdx', 'ts1.mdx', 'ts2.mdx'])
    })

    it('should parse blog category description json', async () => {
        const allCategoryNames = await blogFileParser.getAllCategoryNames()

        const allCategoryDescriptionJsonFiles = (
            await Promise.all(
                allCategoryNames.map(async (categoryName) => {
                    const categoryDescription = await blogFileParser.getCategoryDescriptionFile(categoryName)
                    return JSON.parse(categoryDescription.toString())
                })
            )
        ).flat()

        expect(allCategoryDescriptionJsonFiles).toStrictEqual([javascriptDescription, typescriptDescription])
    })

    it('should parse blog post file queries', async () => {
        const allPostFileQueries = await blogFileParser.getAllPostFileQueries()

        expect(allPostFileQueries).toStrictEqual([
            {
                category: 'javascript',
                postFileQueries: [
                    {
                        category: 'javascript',
                        postFileName: 'js1.mdx',
                    },
                ],
            },
            {
                category: 'typescript',
                postFileQueries: [
                    {
                        category: 'typescript',
                        postFileName: 'ts1.mdx',
                    },
                    {
                        category: 'typescript',
                        postFileName: 'ts2.mdx',
                    },
                ],
            },
        ] as typeof allPostFileQueries)
    })

    it('should parse blog whole post', async () => {
        const allPostFileQueries = await blogFileParser.getAllPostFileQueries()
        const allPosts = (
            await Promise.all(
                allPostFileQueries.map(
                    async ({ postFileQueries }) =>
                        await Promise.all(postFileQueries.map(async (query) => await blogFileParser.getPostFile(query)))
                )
            )
        ).flat()

        const allExtractedFiles = (
            await Promise.all(
                allPostFileQueries.map(async ({ postFileQueries }) => {
                    return await Promise.all(
                        postFileQueries.map(async (query) => {
                            const postFile = await extractor.readFile(
                                `${sourcePath}/blog/${query.category}/posts/${query.postFileName}`
                            )
                            return postFile
                        })
                    )
                })
            )
        ).flat()

        expect(allPosts).toStrictEqual(allExtractedFiles)
    })
})
