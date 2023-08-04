import type { Dirent } from 'fs'
import { z } from 'zod'
import { DataExtractor } from '../../helper/data.extractor'
import { type BlogPath, type PostFileQuery } from './blog.path'

type FileName = string
type File = string | Buffer

export interface BlogFileParserOption {
    /**
     * @description blog parsing target file name exceptions. If you want to exclude some files from parsing, you can add file name exceptions.
     */
    fileNameExceptions?: string[]
}
interface BlogFileParserConstructorOption extends BlogFileParserOption {
    dataExtractor: DataExtractor
    blogPath: BlogPath
}
export class BlogFileParser {
    private fileNameExceptions: string[]
    private $blogPath: BlogPath
    private $extractor: DataExtractor

    public constructor({ dataExtractor, blogPath, fileNameExceptions = [] }: BlogFileParserConstructorOption) {
        this.fileNameExceptions = fileNameExceptions

        this.$extractor = dataExtractor
        this.$blogPath = blogPath
    }

    private async getAllFileNames(path: string): Promise<FileName[]> {
        try {
            const allFileNames = (await this.$extractor.readDirectory(path)).filter(
                (fileName) => this.fileNameExceptions.includes(fileName.name) === false
            )
            return allFileNames.map((fileDirent: Dirent) => fileDirent.name)
        } catch (e) {
            throw Error(`file name extraction error\n\n${e}`)
        }
    }

    public async getAllCategoryNames(): Promise<string[]> {
        const allCategoryNames = (await this.getAllFileNames(this.$blogPath.categoryFileBasePath)).map((category) =>
            category.trim()
        )

        return allCategoryNames
    }

    public async getCategoryDescriptionFile(category: string): Promise<File> {
        const categoryDescription = await this.$extractor.readFile(this.$blogPath.categoryDescriptionFilePath(category))
        return categoryDescription
    }

    public async getAllPostFileNames(category: string): Promise<FileName[]> {
        return await this.getAllFileNames(this.$blogPath.postFileBasePath(category))
    }

    public async getAllPostFileQueries(): Promise<
        {
            category: string
            postFileQueries: PostFileQuery[]
        }[]
    > {
        const allCategoryNames = await this.getAllCategoryNames()

        const allPostStructure = await Promise.all(
            allCategoryNames.map(async (category) => {
                const allPostTitles = await this.getAllPostFileNames(category)
                const postFileQueries: PostFileQuery[] = allPostTitles.map((postFileName) => ({
                    category,
                    postFileName: z.string().parse(postFileName),
                }))
                return {
                    category,
                    postFileQueries,
                }
            })
        )
        return allPostStructure
    }

    public async getPostFile(postQuery: PostFileQuery): Promise<File> {
        const postFile = await this.$extractor.readFile(this.$blogPath.postFilePath(postQuery))
        return postFile
    }
}
