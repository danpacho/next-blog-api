import type { MetadataRoute } from 'next'
import type { z, ZodSchema } from 'zod'
import type { BlogPost, PostMetaBuildInfo } from '../blog.post'
import { BlogNextBuildPath } from './blog.next.build.path'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BlogNextSitemapGeneratorOption {
    urlBasePath: string
}

interface BlogNextSitemapGeneratorConstructorOption<PostMetaSchema extends ZodSchema>
    extends BlogNextSitemapGeneratorOption {
    blogNextBuildPath: BlogNextBuildPath<PostMetaSchema>
    blogPostEngine: BlogPost<PostMetaSchema>
}

export class BlogNextSitemapGenerator<PostMetaSchema extends ZodSchema> {
    private urlBasePath: string
    private $buildPath: BlogNextBuildPath<PostMetaSchema>
    private $postEngine: BlogPost<PostMetaSchema>

    public constructor({
        blogNextBuildPath,
        urlBasePath,
        blogPostEngine,
    }: BlogNextSitemapGeneratorConstructorOption<PostMetaSchema>) {
        const validatedUrlBasePath = urlBasePath.endsWith('/') ? urlBasePath.slice(0, -1) : urlBasePath
        this.urlBasePath = validatedUrlBasePath
        this.$buildPath = blogNextBuildPath
        this.$postEngine = blogPostEngine
    }

    private transformBuildPathToUrl = (buildPath: Partial<z.infer<typeof BlogNextBuildPath.staticParamsValidator>>) => {
        const url = `${this.urlBasePath}/${Object.values(buildPath).join('/')}`
        return url
    }

    public generateSitemap = async (): Promise<MetadataRoute.Sitemap> => {
        const postSitemap: MetadataRoute.Sitemap = await Promise.all(
            (
                await this.$buildPath.generateStaticParamsForPost()
            ).map(async (buildPath) => {
                const allPostMeta = await this.$postEngine.getAllPostMeta()
                const targetMeta = allPostMeta.find((postMeta: PostMetaBuildInfo) => {
                    const [_, category, page, postFileName] = postMeta.link.split('/')
                    const currentBuildPath = {
                        category,
                        page,
                        postFileName,
                    }
                    return this.transformBuildPathToUrl(currentBuildPath) === this.transformBuildPathToUrl(buildPath)
                })
                const lastModified = new Date(targetMeta?.[this.$postEngine.postGenerationFiledMetaName])

                const sitemap: MetadataRoute.Sitemap[number] = {
                    url: this.transformBuildPathToUrl(buildPath),
                    lastModified,
                }
                return sitemap
            })
        )
        const categorySitemap: MetadataRoute.Sitemap = (await this.$buildPath.generateStaticParamsForCategory()).map(
            (buildPath) => ({
                url: this.transformBuildPathToUrl(buildPath),
            })
        )
        const pageSitemap: MetadataRoute.Sitemap = (await this.$buildPath.generateStaticParamsForPage()).map(
            (buildPath) => ({
                url: this.transformBuildPathToUrl(buildPath),
            })
        )

        const blogSitemap: MetadataRoute.Sitemap = [...categorySitemap, ...pageSitemap, ...postSitemap]

        return blogSitemap
    }
}
