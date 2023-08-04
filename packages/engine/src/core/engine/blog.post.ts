import { z } from 'zod'
import { removeFileFormat } from '../../helper'
import { getToc, type Toc, type TocExtractionDepthRangeOption } from '../../lib'
import type { SchemaTransformer } from '../../types'
import type { MdxParser, MetaParser } from '../parser'
import type { BlogFileParser } from './blog.file.parser'
import type { BlogPath, PostFileQuery } from './blog.path'

interface BlogPostOption<PostMetaSchema extends z.ZodSchema> {
    /**
     * @description post meta data `zod` schema
     * @example
     * If you post meta should look like this:
     * ```mdx
     * ---
     * title: post title
     * description: post description
     * category: javascript
     * tags:
     *      - tag1
     *      - tag2
     * ---
     * ```
     * then your post meta schema should look like this:
     * ```ts
     * import { z } from 'zod'
     *
     * const postMetaSchema = z.object({
     *     title: z.string(),
     *     description: z.string(),
     *     category: z.string(),
     *     tags: z.array(z.string()),
     * })
     * ```
     */
    postMetaSchema: PostMetaSchema
    /**
     * @description data transformer for post meta schema
     * @example
     * For example, if you want to transform tags `string` into `array`, then you can use this option
     * ```ts
     * // tags: "a, b, c" => tags: ["a", "b", "c"]
     * const transformer = (data) => {
     *      const data = { title, description, category, tags }
     *      const tags = tags.split(',') ?? []
     *
     *      return { title, description, category, tags }
     * }
     * ```
     */
    postMetaSchemaTransformer?: SchemaTransformer<PostMetaSchema>
    /**
     * @description maximum count of posts at category, minimum `4`
     */
    postCountPerPage: number
    /**
     * @description category sorting function, default sort by `localeCompare`
     * @param currentCategory category name
     * @param nextCategory category name
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters compareFunction}
     */
    categorySorter?: (
        currentCategory: CategoryPostGroups<PostMetaSchema>['category'],
        nextCategory: CategoryPostGroups<PostMetaSchema>['category'],
        compareOptions?: {
            locales?: string | string[]
            options?: Intl.CollatorOptions
        }
    ) => number | boolean
    /**
     * @description post sorting function, default sort by `update` meta date
     * @param currentPost current post `meta` and `postFileQuery`
     * @param nextPost next post `meta` and `postFileQuery`
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters compareFunction}
     */
    postSorter?: (
        currentPost: CategoryPostGroups<PostMetaSchema>['posts'][number],
        nextPost: CategoryPostGroups<PostMetaSchema>['posts'][number]
    ) => number | boolean

    /**
     * @description name of post generation time, default `update`
     * @example
     * If post generation filed meta name is `createdAt`, then post meta should look like this:
     * ```mdx
     * ---
     * createdAt: 2023-01-01
     * ---
     * ```
     */
    postGenerationTimeMetaName?: string

    /**
     * @description name of post title meta, default `title`
     * @example
     * If post title meta name is `postTitle`, then post meta should look like this:
     * ```mdx
     * ---
     * postTitle: your post title
     * ---
     * ```
     */
    postTitleMetaName?: string

    /**
     * @description table of contents extraction depth range, default `1` ~ `5`
     */
    tocExtractionDepthRange?: TocExtractionDepthRangeOption
}

interface BlogPostConstructorOption<PostMetaSchema extends z.ZodSchema> extends BlogPostOption<PostMetaSchema> {
    blogPath: BlogPath
    mdxParser: MdxParser
    metaParser: MetaParser
    blogFileParser: BlogFileParser
}

type PostNavigator = {
    prev?: {
        title: string
        link: string
    }
    next?: {
        title: string
        link: string
    }
}
export type postMetaBaseSchema = {
    title: string
}
/**
 * @description post meta data generated at build time
 */
export type PostMetaBuildInfo = {
    fileName: string
    link: string
    order: number
    pageNumber: number
}
type Post<PostMetaSchema extends z.ZodSchema> = {
    mdxSource: string
    tableOfContents: Toc[]
    meta: z.infer<PostMetaSchema> & PostMetaBuildInfo
    navigator: PostNavigator
}

type CategoryPostGroups<PostMetaSchema extends z.ZodSchema> = {
    category: string
    posts: Array<{
        meta: z.infer<PostMetaSchema> & PostMetaBuildInfo
        postFileQuery: PostFileQuery
    }>
}

class BlogPost<PostMetaSchema extends z.ZodSchema> {
    private static postCountPerPageValidator = z.number().int().min(4).default(4)

    private $blogPath: BlogPath
    private $mdxParser: MdxParser
    private $metaParser: MetaParser
    private $blogFileParser: BlogFileParser

    private postCountPerPage: number
    public postGenerationFiledMetaName = 'update'
    public postTitleFiledMetaName = 'title'

    private postMetaSchema: PostMetaSchema
    private postMetaSchemaTransformer?: SchemaTransformer<PostMetaSchema>
    private tocExtractionDepthRange?: TocExtractionDepthRangeOption

    private categorySorter: Exclude<BlogPostOption<PostMetaSchema>['categorySorter'], undefined> = (
        currentCategory,
        nextCategory,
        compareOptions = {
            locales: 'ko',
            options: undefined,
        }
    ) => {
        return currentCategory.localeCompare(nextCategory, compareOptions.locales, compareOptions.options)
    }
    private postSorter: Exclude<BlogPostOption<PostMetaSchema>['postSorter'], undefined> = (curr, next) => {
        const MILLISECONDS = 10 ** 3
        const postGenerationTimes = {
            curr: z.date().parse(new Date(curr.meta[this.postGenerationFiledMetaName])),
            next: z.date().parse(new Date(next.meta[this.postGenerationFiledMetaName])),
        }
        const buildCurrentTime = new Date().getTime()

        const getTimeDiffWithBuildTime = (targetTime: Date) =>
            Math.trunc((buildCurrentTime - targetTime.getTime()) / MILLISECONDS)

        const currentTimeDiff = getTimeDiffWithBuildTime(postGenerationTimes.curr)
        const nextTimeDiff = getTimeDiffWithBuildTime(postGenerationTimes.next)

        return currentTimeDiff - nextTimeDiff
    }

    public constructor({
        blogPath,
        mdxParser,
        metaParser,
        blogFileParser,
        postCountPerPage,
        postMetaSchema,
        postMetaSchemaTransformer,
        postSorter,
        categorySorter,
        postGenerationTimeMetaName,
        postTitleMetaName,
        tocExtractionDepthRange,
    }: BlogPostConstructorOption<PostMetaSchema>) {
        this.postCountPerPage = BlogPost.postCountPerPageValidator.parse(postCountPerPage)

        this.$blogPath = blogPath

        this.$mdxParser = mdxParser
        this.$metaParser = metaParser
        this.$blogFileParser = blogFileParser

        this.postMetaSchema = postMetaSchema
        this.postMetaSchemaTransformer = postMetaSchemaTransformer

        this.postTitleFiledMetaName = postTitleMetaName ?? this.postTitleFiledMetaName
        this.postGenerationFiledMetaName = postGenerationTimeMetaName ?? this.postGenerationFiledMetaName
        this.tocExtractionDepthRange = tocExtractionDepthRange

        this.postSorter = postSorter ?? this.postSorter
        this.categorySorter = categorySorter ?? this.categorySorter
    }

    private async parsePostMdxMetaWithFileName(postFileQuery: PostFileQuery): Promise<
        z.infer<PostMetaSchema> & {
            fileName: string
        }
    > {
        const pureMeta = z.string().parse(await this.$blogFileParser.getPostFile(postFileQuery))

        const parsedMdxMeta = this.$metaParser.parseMeta({
            pureMeta,
            schema: this.postMetaSchema,
            transformer: this.postMetaSchemaTransformer,
        })
        const fileName = removeFileFormat(postFileQuery.postFileName)

        return { ...parsedMdxMeta, fileName }
    }

    private async parsePostMdx(postQuery: PostFileQuery): Promise<{
        mdxSource: string
        tableOfContents: Toc[]
    }> {
        const pureMdx = z.string().parse(await this.$blogFileParser.getPostFile(postQuery))
        const parsedMdx = await this.$mdxParser.parseMdx(pureMdx)

        return {
            mdxSource: parsedMdx,
            tableOfContents: getToc(pureMdx, this.tocExtractionDepthRange),
        }
    }

    private async getSortedPostFileQueries(): Promise<CategoryPostGroups<PostMetaSchema>[]> {
        const allPostQueries = await this.$blogFileParser.getAllPostFileQueries()

        const allSortedPostFileQueries: CategoryPostGroups<PostMetaSchema>[] = await Promise.all(
            allPostQueries.map(async ({ category, postFileQueries }) => {
                const allFileDataWithMeta = await Promise.all(
                    postFileQueries.map(async (postFileQuery) => {
                        const meta = await this.parsePostMdxMetaWithFileName(postFileQuery)
                        return {
                            postFileQuery,
                            meta,
                        }
                    })
                )

                return {
                    category,
                    posts: allFileDataWithMeta,
                }
            })
        )

        allSortedPostFileQueries.sort((curr, next) => Number(this.categorySorter(curr.category, next.category)))

        allSortedPostFileQueries.forEach((postQueryWithMeta) => {
            postQueryWithMeta.posts.sort((curr, next) => Number(this.postSorter(curr, next)))
        })

        return allSortedPostFileQueries
    }

    private async getOrderedMeta({
        mdxMetaWithFileName,
        category,
        postOrder,
        postCountPerPage,
    }: {
        mdxMetaWithFileName: z.infer<PostMetaSchema> & {
            fileName: string
        }
        category: string
        postOrder: number
        postCountPerPage: number
    }): Promise<Post<PostMetaSchema>['meta']> {
        const pageNumber = Math.ceil(postOrder / postCountPerPage)

        const orderedMeta: PostMetaBuildInfo = {
            ...mdxMetaWithFileName,
            order: postOrder,
            link: this.$blogPath.postLinkPath({
                category,
                pageNumber,
                postFileName: (mdxMetaWithFileName as PostMetaBuildInfo).fileName,
            }),
            pageNumber,
        }

        return orderedMeta
    }

    private async getAllOrderProcessedPostWithQueries(): Promise<
        {
            category: string
            postWithQueries: Array<{
                meta: z.infer<PostMetaSchema>
                postFileQuery: PostFileQuery
            }>
        }[]
    > {
        const sortedPostQueries = await this.getSortedPostFileQueries()

        const orderProcessedPosts = await Promise.all(
            sortedPostQueries.map(async ({ category, posts }) => {
                const orderProcessedPostQueries = await Promise.all(
                    posts.map(async ({ meta, postFileQuery }, index) => ({
                        meta: await this.getOrderedMeta({
                            category,
                            mdxMetaWithFileName: meta,
                            postOrder: index + 1,
                            postCountPerPage: this.postCountPerPage,
                        }),
                        postFileQuery,
                    }))
                )
                return {
                    category,
                    postWithQueries: orderProcessedPostQueries,
                }
            })
        )

        return orderProcessedPosts
    }

    private buildNavigator({
        next,
        prev,
    }: {
        prev: Post<PostMetaSchema>['meta'] | undefined
        next: Post<PostMetaSchema>['meta'] | undefined
    }): PostNavigator {
        const navigatorSchema = z.object({
            link: z.string(),
            // set postTitleFiledMetaName as title to prevent type error
            [this.postTitleFiledMetaName as 'title']: z.string(),
        })

        const prevNavigator = prev ? navigatorSchema.parse(prev as PostMetaBuildInfo) : undefined
        const nextNavigator = next ? navigatorSchema.parse(next as PostMetaBuildInfo) : undefined

        return {
            prev: prevNavigator,
            next: nextNavigator,
        }
    }

    public async getAllPosts(): Promise<
        {
            category: string
            posts: Array<Post<PostMetaSchema>>
        }[]
    > {
        const allOrderProcessedPostWithQueries = await this.getAllOrderProcessedPostWithQueries()

        const allPosts: {
            category: string
            posts: Post<PostMetaSchema>[]
        }[] = await Promise.all(
            allOrderProcessedPostWithQueries.map(async ({ category, postWithQueries }) => {
                const allCategoryPosts = await postWithQueries.reduce<Promise<Post<PostMetaSchema>[]>>(
                    async (allPosts, { meta, postFileQuery }, i) => {
                        const accAllPosts = await allPosts

                        const { mdxSource, tableOfContents } = await this.parsePostMdx(postFileQuery)
                        const navigator = this.buildNavigator({
                            prev: postWithQueries[i - 1]?.meta,
                            next: postWithQueries[i + 1]?.meta,
                        })

                        const post: Post<PostMetaSchema> = {
                            meta,
                            navigator,
                            mdxSource,
                            tableOfContents,
                        }
                        accAllPosts.push(post)

                        return accAllPosts
                    },
                    Promise.resolve([] as Post<PostMetaSchema>[])
                )
                return {
                    category,
                    posts: allCategoryPosts,
                }
            })
        )

        return allPosts
    }

    public async getAllPostAtCategoryGroup(category: string): Promise<Array<Post<PostMetaSchema>>> {
        const targetCategoryPosts =
            (await this.getAllPosts()).find((postInfo) => postInfo.category === category)?.posts ?? []

        return targetCategoryPosts
    }

    public async getSinglePost(postFileQuery: PostFileQuery): Promise<Post<PostMetaSchema>> {
        const targetCategoryPosts = await this.getAllPostAtCategoryGroup(postFileQuery.category)
        const targetPost = targetCategoryPosts.find(({ meta }) => {
            return (meta as PostMetaBuildInfo).fileName === postFileQuery.postFileName
        })

        if (targetPost === undefined)
            throw new Error(
                `Cannot find post with query - [category: "${postFileQuery.category}", postFileName: "${postFileQuery.postFileName}"]`
            )

        return targetPost
    }

    public getAllPostMeta = async (slice?: number): Promise<Array<z.infer<PostMetaSchema> & PostMetaBuildInfo>> =>
        (await this.getAllPosts())
            .flatMap(({ posts }) => posts)
            .map(({ meta }) => meta)
            .slice(0, slice ?? Infinity)

    public getTotalPageNumberOfCategory = async (category: string): Promise<number> => {
        const targetCategoryPosts = await this.getAllPostAtCategoryGroup(category)
        const totalPageCount = Math.ceil(targetCategoryPosts.length / this.postCountPerPage)

        return totalPageCount
    }

    public getAllPostMetaAtCategoryGroup = async (
        category: string,
        slice?: number
    ): Promise<Array<z.infer<PostMetaSchema> & PostMetaBuildInfo>> =>
        (await this.getAllPosts())
            .map(({ posts, category: metaCategory }) =>
                category === metaCategory ? posts.map(({ meta }) => meta) : []
            )
            .flat()
            .slice(0, slice ?? Infinity)
}

export { BlogPost, type BlogPostOption }
