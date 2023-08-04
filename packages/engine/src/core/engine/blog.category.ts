import { z } from 'zod'
import type { SchemaTransformer } from '../../types'
import type { JsonParser } from '../parser/json.parser'
import type { BlogFileParser } from './blog.file.parser'

/**
 * @description Blog category option for blog engine
 */
export interface BlogCategoryOption<CategorySchema extends z.ZodSchema> {
    /**
     * @description category description `json` data schema
     * @example
     * If category description `json` data should look like this below
     * ```json
     * // javascript/description.json
     * {
     *      "description": "javascript is amazing!",
     *      "emoji": "🤯",
     * }
     * ```
     * then category schema should look like this
     * ```ts
     * const categorySchema = z.object({
     *      description: z.string(),
     *      emoji: z.string().emoji(),
     * })
     * ```
     */
    categorySchema: CategorySchema
    /**
     * @description category description `json` data schema transformer
     * @param data category description `object` `json` data
     */
    categorySchemaTransformer?: SchemaTransformer<CategorySchema>
}

interface BlogCategoryConstructorOption<CategorySchema extends z.ZodSchema> extends BlogCategoryOption<CategorySchema> {
    jsonParser: JsonParser
    blogFileParser: BlogFileParser
}

export class BlogCategory<CategorySchema extends z.ZodSchema> {
    private $jsonParser: JsonParser
    private $blogFileParser: BlogFileParser
    public categorySchema: CategorySchema
    public categorySchemaTransformer?: SchemaTransformer<CategorySchema>

    public constructor({
        jsonParser,
        blogFileParser,
        categorySchema,
        categorySchemaTransformer,
    }: BlogCategoryConstructorOption<CategorySchema>) {
        this.$jsonParser = jsonParser
        this.$blogFileParser = blogFileParser
        this.categorySchema = categorySchema
        this.categorySchemaTransformer = categorySchemaTransformer
    }

    public async getAllCategoryDescriptions(): Promise<
        Array<
            z.TypeOf<CategorySchema> & {
                category: string
            }
        >
    > {
        const allCategoryNames = await this.$blogFileParser.getAllCategoryNames()

        const allCategoryInformation: Array<
            z.TypeOf<CategorySchema> & {
                category: string
            }
        > = await Promise.all(
            allCategoryNames.map(async (categoryName) => {
                const descriptionJson = z
                    .string()
                    .parse(await this.$blogFileParser.getCategoryDescriptionFile(categoryName))

                const parsedDescription = this.$jsonParser.parseJson({
                    json: descriptionJson,
                    schema: this.categorySchema,
                    transformer: this.categorySchemaTransformer,
                })

                const description: z.TypeOf<CategorySchema> & {
                    category: string
                } = {
                    ...parsedDescription,
                    category: categoryName,
                }
                return description
            })
        )
        return allCategoryInformation
    }

    public async getCategoryDescription(category: string): Promise<
        z.TypeOf<CategorySchema> & {
            category: string
        }
    > {
        const allCategoryDescriptions = await this.getAllCategoryDescriptions()

        const singleCategoryDescription = allCategoryDescriptions.find(
            (description: { category: string }) => description.category === category
        )

        if (singleCategoryDescription === undefined) throw new Error(`Category ${category} not found`)

        return singleCategoryDescription
    }
}
