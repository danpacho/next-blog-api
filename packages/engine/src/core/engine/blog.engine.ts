import { type ZodSchema } from 'zod'
import { DataExtractor, type DataExtractorOption } from '../../helper/data.extractor'
import { JsonParser, MdxParser, type MdxParserOption, MetaParser } from '../parser'
import { BlogCategory, type BlogCategoryOption } from './blog.category'
import { BlogFileParser, type BlogFileParserOption } from './blog.file.parser'
import { BlogPath, type BlogPathOption, type PostFileQuery } from './blog.path'
import { BlogPost, type BlogPostOption } from './blog.post'
import {
    BlogNextBuildPath,
    type BlogNextBuildPathOption,
    BlogNextSitemapGenerator,
    type BlogNextSitemapGeneratorOption,
} from './next'

/**
 * @description `BlogEngine` option
 */
export interface BlogEngineOption<CategorySchema extends ZodSchema, PostMetaSchema extends ZodSchema>
    extends BlogCategoryOption<CategorySchema>,
        BlogPostOption<PostMetaSchema>,
        BlogFileParserOption,
        BlogPathOption,
        BlogNextBuildPathOption,
        BlogNextSitemapGeneratorOption,
        DataExtractorOption {
    /**
     * @description `mdx` parser option
     * @example
     * ```ts
     * import { someRehypePackage } from "some-rehype-package"
     * import { someRemarkPackage } from "some-remark-package"
     *
     * const mdxParserOption = {
     *      remarkPlugins: [someRemarkPackage],
     *      rehypePlugins: [someRehypePackage],
     * }
     *```
     */
    mdxParserOption?: MdxParserOption
}

export class BlogEngine<CategorySchema extends ZodSchema, PostMetaSchema extends ZodSchema> {
    private $categoryEngine: BlogCategory<CategorySchema>
    private $postEngine: BlogPost<PostMetaSchema>
    private $buildPath: BlogNextBuildPath<PostMetaSchema>
    private $sitemapGenerator: BlogNextSitemapGenerator<PostMetaSchema>

    public constructor({
        // data extractor option
        readFileOption,
        readdirOption,
        fileNameExceptions,
        // blog path option
        sourcePath,
        linkBasePath,
        blogTree,
        // mdx parser
        mdxParserOption,
        // post engine option
        postCountPerPage,
        // category engine option
        categorySchema,
        categorySchemaTransformer,
        // post engine option
        postMetaSchema,
        postMetaSchemaTransformer,
        // sorter
        postGenerationTimeMetaName,
        postTitleMetaName,
        categorySorter,
        postSorter,
        // next-js meta, sitemap generator option
        urlBasePath,
        // toc
        tocExtractionDepthRange,
    }: BlogEngineOption<CategorySchema, PostMetaSchema>) {
        const $jsonParser = new JsonParser()
        const $metaParser = new MetaParser()
        const $mdxParser = new MdxParser({
            ...mdxParserOption,
        })

        const $dataExtractor = new DataExtractor({
            readdirOption,
            readFileOption,
        })

        const $blogPath = new BlogPath({ blogTree, sourcePath, linkBasePath: linkBasePath })
        const $blogFileParser = new BlogFileParser({
            blogPath: $blogPath,
            dataExtractor: $dataExtractor,
            fileNameExceptions,
        })

        this.$categoryEngine = new BlogCategory({
            jsonParser: $jsonParser,
            blogFileParser: $blogFileParser,
            categorySchema,
            categorySchemaTransformer,
        })
        this.$postEngine = new BlogPost({
            blogPath: $blogPath,
            mdxParser: $mdxParser,
            metaParser: $metaParser,
            blogFileParser: $blogFileParser,
            postSorter,
            categorySorter,
            postMetaSchema,
            postCountPerPage,
            postMetaSchemaTransformer,
            postTitleMetaName,
            postGenerationTimeMetaName,
            tocExtractionDepthRange,
        })
        this.$buildPath = new BlogNextBuildPath({
            postEngine: this.$postEngine,
        })
        this.$sitemapGenerator = new BlogNextSitemapGenerator({
            blogPostEngine: this.$postEngine,
            blogNextBuildPath: this.$buildPath,
            urlBasePath,
        })
    }

    /**
     * @param postQuery query to get posts
     */
    public getPost = async (postQuery: PostFileQuery) => await this.$postEngine.getSinglePost(postQuery)

    /**
     * @param slice slice number of meta data
     */
    public getAllPostMeta = async (slice?: number) => await this.$postEngine.getAllPostMeta(slice)

    /**
     * @param category category name
     * @param slice slice number of meta data
     */
    public getAllPostMetaAtCategoryGroup = async (category: string, slice?: number) =>
        await this.$postEngine.getAllPostMetaAtCategoryGroup(category, slice)

    /**
     * @description get total page number of category. Use it if you want to let users know that there is end-page.
     * @example
     * ```ts
     * // app/[category]/[page]/page.tsx
     * export default function PaginatedCategoryPage({
     *      params: { category, page }
     * }) {
     *      const totalPageNumber = await getTotalPageNumberOfCategory(category)
     *      const isLastPage = page === totalPageNumber
     * }
     * ```
     */
    public getTotalPageNumberOfCategory = async (category: string) =>
        await this.$postEngine.getTotalPageNumberOfCategory(category)

    public getAllCategoryDescriptions = async () => await this.$categoryEngine.getAllCategoryDescriptions()

    /**
     * @description get category description
     * @param category name of target category
     */
    public getCategoryDescription = async (category: string) =>
        await this.$categoryEngine.getCategoryDescription(category)

    /**
     * @description generate static build path for `[category]` in `[category]/page.tsx`
     * @see {@link https://nextjs.org/docs/app/api-reference/functions/generate-static-params#generate-params-from-the-top-down generateStaticParams}
     * @example
     * ```tsx
     * // app/[category]/page.tsx
     * export async function generateStaticParams() {
     *    return await blogEngine.generateStaticParamsForCategory()
     * }
     * ```
     */
    public generateStaticParamsForCategory = async () => await this.$buildPath.generateStaticParamsForCategory()

    /**
     * @description generate static build path for `[page]` in `[category]/[page]/page.tsx`
     * @see {@link https://nextjs.org/docs/app/api-reference/functions/generate-static-params#generate-params-from-the-top-down generateStaticParams}
     * @example
     * ```tsx
     * // app/[category]/[page]/page.tsx
     * export async function generateStaticParams() {
     *     return await blogEngine.generateStaticParamsForPage()
     * }
     * ```
     */
    public generateStaticParamsForPage = async () => await this.$buildPath.generateStaticParamsForPage()

    /**
     * @description generate static build path for `[postFileName]` in `[category]/[page]/[postFileName]/page.tsx`
     * @see {@link https://nextjs.org/docs/app/api-reference/functions/generate-static-params#generate-params-from-the-top-down generateStaticParams}
     * @example
     * ```tsx
     * // app/[category]/[page]/[postFileName]/page.tsx
     * export async function generateStaticParams() {
     *    return await blogEngine.generateStaticParamsForPost()
     * }
     * ```
     */
    public generateStaticParamsForPost = async () => this.$buildPath.generateStaticParamsForPost()

    /**
     * @description generate `sitemap.xml`
     * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap#generate-a-sitemap generateSitemap}
     * @example
     * ```ts
     * // app/sitemap.ts
     * import { MetadataRoute } from 'next'
     *
     * export default function sitemap() {
     *     return blogEngine.generateSitemap()
     * }
     * ```
     */
    public generateSitemap = async () => await this.$sitemapGenerator.generateSitemap()
}
