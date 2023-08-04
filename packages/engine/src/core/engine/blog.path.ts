type BlogTree = Readonly<{
    blogFolderName: string
    postFolderName: string
    categoryDescriptionFileName: string
}>

const defaultBlogTree = {
    blogFolderName: 'blog',
    postFolderName: 'posts',
    categoryDescriptionFileName: 'description.json',
} satisfies BlogTree

interface PostFileQuery {
    category: string
    postFileName: string
}

interface PostPathQuery extends PostFileQuery {
    pageNumber: string
}

interface BlogPathOption {
    /**
     * @description blog source path
     * @example
     * If project structure is:
     * ```mdx
     * your-blog-project
     * ├── blog <── source path
     * │
     * └── blog-project-app
     * ```
     * Then, source path is:
     * ```ts
     * const blogSourcePath = `${cwd()}/blog`
     * ```
     */
    sourcePath: string
    /**
     * @description blog source tree structure
     * @example
     * ```mdx
     * [blogFolderName = "blog"] <── blog source folder
     * ├── category1
     * │   ├── [categoryDescriptionFileName = "description"].json
     * │   └── [postsFolderName = "posts"]
     * │       ├── post1.mdx
     * │       └── post2.mdx
     * └── category2
     *     └── ...
     * ```
     */
    blogTree?: BlogTree
    /**
     * @description blog link base path
     */
    linkBasePath?: string
}
class BlogPath {
    private blogTree: BlogTree
    private sourcePath: string
    private linkBasePath?: string

    public constructor({ blogTree = defaultBlogTree, sourcePath, linkBasePath }: BlogPathOption) {
        this.blogTree = blogTree
        this.sourcePath = sourcePath
        this.linkBasePath = linkBasePath
    }

    private combinePath(...fileNames: string[]): string {
        return fileNames.join('/')
    }
    private toLinkPath(...fileNames: string[]): string {
        const combinedPath = this.combinePath(...fileNames)
        const isAlreadyLinkPath = combinedPath.startsWith('/')
        return isAlreadyLinkPath ? combinedPath : `/${this.combinePath(...fileNames)}`
    }
    /**
     * @param fileNames
     * @example
     * ```ts
     * const path = this.resolveFilePath("blog", "category", "post")
     * // Users/username/Projects/blog/category/post
     * ```
     */
    private resolveFilePath(...fileNames: string[]): string {
        const filePath: string = this.combinePath(...fileNames)

        const withSourcePath = `${this.sourcePath}/${filePath}`
        return withSourcePath
    }

    public get categoryFileBasePath(): string {
        return this.resolveFilePath(this.blogTree.blogFolderName)
    }

    /**
     * @param category Name of category
     * @example
     * `blog/javascript/description.json`
     */
    public categoryDescriptionFilePath = (category: string) =>
        this.resolveFilePath(this.blogTree.blogFolderName, category, this.blogTree.categoryDescriptionFileName)

    /**
     * @description Get base file path of post file
     * @param category Name of category
     * @example
     * `Users/username/Projects/blog/javascript/posts`
     */
    public postFileBasePath = (category: string) =>
        this.resolveFilePath(this.blogTree.blogFolderName, category, this.blogTree.postFolderName)

    /**
     * @description Get file path of post file
     * @example
     * `Users/username/Projects/blog/javascript/posts`
     */
    public postFilePath = ({ category, postFileName }: PostFileQuery) =>
        this.combinePath(this.postFileBasePath(category), postFileName)

    /**
     * @description Get base link path of post
     * @param category Name of category
     * @example
     * `/javascript`
     */
    public postLinkBasePath = (category: string) =>
        this.linkBasePath ? this.toLinkPath(this.linkBasePath, category) : this.toLinkPath(category)

    /**
     * @description Get path link of specific post
     * @example
     * `/javascript/1/post-title-1`
     */
    public postLinkPath = ({ category, postFileName, pageNumber }: PostFileQuery & { pageNumber: number }) =>
        this.toLinkPath(this.postLinkBasePath(category), String(pageNumber), postFileName)
}

export { BlogPath, type BlogPathOption, type PostFileQuery, type PostPathQuery }
