import { join as pathJoin } from 'path'
import { bundleMDX } from 'mdx-bundler'
import { type Pluggable } from 'unified'

type MdxBundlerOption = Partial<Omit<Parameters<typeof bundleMDX>[0], 'mdxOptions' | 'source' | 'file'>>

export interface MdxParserOption extends MdxBundlerOption {
    rehypePlugins?: Readonly<Pluggable[]>
    remarkPlugins?: Readonly<Pluggable[]>
}
export class MdxParser {
    private rehypePlugins?: Readonly<Pluggable[]>
    private remarkPlugins?: Readonly<Pluggable[]>
    private mdxBundlerOption?: MdxBundlerOption

    constructor({ rehypePlugins, remarkPlugins, ...mdxBundlerOption }: MdxParserOption) {
        this.rehypePlugins = rehypePlugins
        this.remarkPlugins = remarkPlugins
        this.mdxBundlerOption = mdxBundlerOption
    }

    /**
     * @description setup `ESBUILD_BINARY_PATH` for ES-Build
     * @see ES-Build `env` [config](https://www.alaycock.co.uk/2021/03/mdx-bundler#esbuild-executable)
     */
    private setupEnv(): void {
        const win32EnvException = process.platform === 'win32'
        if (win32EnvException) {
            process.env.ESBUILD_BINARY_PATH = pathJoin(process.cwd(), 'node_modules', 'esbuild', 'esbuild.exe')
            return
        }

        process.env.ESBUILD_BINARY_PATH = pathJoin(process.cwd(), 'node_modules', 'esbuild', 'bin', 'esbuild')
    }

    public async parseMdx(pureMdx: string): Promise<string> {
        this.setupEnv()

        const { code, errors } = await bundleMDX({
            source: pureMdx,
            mdxOptions: (options, _) => {
                options.remarkPlugins = [...(options.remarkPlugins ?? []), ...(this.remarkPlugins ?? [])]
                options.rehypePlugins = [...(options.rehypePlugins ?? []), ...(this.rehypePlugins ?? [])]
                return options
            },
            ...this.mdxBundlerOption,
        })

        const isErrorOccurred = errors.length > 0
        if (isErrorOccurred) {
            throw new Error(
                errors.map((e) => `${e.text}, plugin at ${e.pluginName}, location at ${e.location}`).join('\n')
            )
        }

        const parsedMdx: string = code

        return parsedMdx
    }
}
