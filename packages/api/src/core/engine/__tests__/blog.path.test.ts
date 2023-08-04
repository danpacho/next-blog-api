import { describe, expect, it } from 'vitest'
import { BlogPath, type BlogPathOption } from '../blog.path'

describe('BlogEngine - blog path', () => {
    const sourcePath = `${process.cwd()}/packages/nextjs-blog-api/core/engine/__mocks__`
    const blogTree = {
        blogFolderName: 'blog',
        postFolderName: 'posts',
        categoryDescriptionFileName: 'description.json',
    } as const satisfies BlogPathOption['blogTree']

    const blogPath = new BlogPath({
        sourcePath,
        blogTree,
    })

    const mocks = {
        category: 'some-category',
        postFileName: 'some-post',
    }

    const toPath = (...pathList: (string | number)[]) => pathList.join('/')

    it('should return category description file path', () => {
        const someCategoryDescriptionFilePath = blogPath.categoryDescriptionFilePath(mocks.category)
        expect(someCategoryDescriptionFilePath).toBe(
            toPath(sourcePath, blogTree.blogFolderName, mocks.category, blogTree.categoryDescriptionFileName)
        )
    })

    it('should return post file path', () => {
        const somePostFilePath = blogPath.postFilePath({ category: mocks.category, postFileName: mocks.postFileName })
        expect(somePostFilePath).toBe(
            toPath(sourcePath, blogTree.blogFolderName, mocks.category, blogTree.postFolderName, mocks.postFileName)
        )
    })

    it('should return post file base path', () => {
        const somePostFileBasePath = blogPath.postFileBasePath(mocks.category)
        expect(somePostFileBasePath).toBe(
            toPath(sourcePath, blogTree.blogFolderName, mocks.category, blogTree.postFolderName)
        )
    })

    it('should return category file base path', () => {
        const someCategoryFileBasePath = blogPath.categoryFileBasePath
        expect(someCategoryFileBasePath).toBe(toPath(sourcePath, blogTree.blogFolderName))
    })

    it('should return post LINK path', () => {
        const postLinkPath = blogPath.postLinkBasePath(mocks.category)
        expect(postLinkPath).toBe(`/${toPath(mocks.category)}`)
    })

    it('should return post LINK path ', () => {
        const pageNumber = 1
        const postLinkPath = blogPath.postLinkPath({
            category: mocks.category,
            postFileName: mocks.postFileName,
            pageNumber,
        })
        expect(postLinkPath).toBe(`/${toPath(mocks.category, pageNumber, mocks.postFileName)}`)
    })
})
