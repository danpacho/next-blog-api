import { z } from 'zod'
import type { BlogPost, PostMetaBuildInfo } from '../blog.post'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BlogNextBuildPathOption {}

interface BlogNextBuildPathConstructorOption<PostMetaSchema extends z.ZodSchema> extends BlogNextBuildPathOption {
    postEngine: BlogPost<PostMetaSchema>
}
export class BlogNextBuildPath<PostMetaSchema extends z.ZodSchema> {
    public $postEngine: BlogPost<PostMetaSchema>

    public constructor({ postEngine }: BlogNextBuildPathConstructorOption<PostMetaSchema>) {
        this.$postEngine = postEngine
    }

    /**
     * @description next-js `generateStaticParams` build path validator
     * @description full path is `[category]/[page]/[postFileName]`
     */
    public static staticParamsValidator = z
        .object({
            category: z.string(),
            page: z.string(),
            postFileName: z.string(),
        })
        .strict()

    private generateStaticParams = async (): Promise<
        Array<z.infer<typeof BlogNextBuildPath.staticParamsValidator>>
    > => {
        const allPosts = await this.$postEngine.getAllPosts()

        const staticBuildPathGroups: Array<z.infer<typeof BlogNextBuildPath.staticParamsValidator>> = allPosts
            .map(({ category, posts }) =>
                posts.map(({ meta }: { meta: PostMetaBuildInfo }) => {
                    const buildPath: z.infer<typeof BlogNextBuildPath.staticParamsValidator> = {
                        category,
                        postFileName: meta.fileName,
                        page: String(meta.pageNumber),
                    }
                    return BlogNextBuildPath.staticParamsValidator.parse(buildPath)
                })
            )
            .flat()

        return staticBuildPathGroups
    }

    public generateStaticParamsForCategory = async () =>
        (await this.generateStaticParams()).map(({ category }) => ({
            category,
        }))

    public generateStaticParamsForPage = async () =>
        (await this.generateStaticParams()).map(({ category, page }) => ({
            category,
            page,
        }))

    public generateStaticParamsForPost = async () => this.generateStaticParams()
}
