import { readdir, readFile } from 'fs/promises'

type ReadFileOption = Parameters<typeof readFile>[1]
type ReaddirOption = Parameters<typeof readdir>[1]

interface DataExtractorOption {
    readFileOption?: ReadFileOption
    readdirOption?: ReaddirOption
}
const defaultExtractorOption = {
    readFileOption: {
        encoding: 'utf-8',
    },
    readdirOption: {
        withFileTypes: true,
        encoding: 'utf-8',
    },
} as const satisfies DataExtractorOption

class DataExtractor {
    private readFileOption: ReadFileOption
    private readdirOption: ReaddirOption

    public constructor({
        readFileOption = defaultExtractorOption.readFileOption,
        readdirOption = defaultExtractorOption.readdirOption,
    }: DataExtractorOption) {
        this.readFileOption = readFileOption
        this.readdirOption = readdirOption
    }

    public async readFile(path: string) {
        return await readFile(path, this.readFileOption)
    }

    public async readDirectory(path: string) {
        return await readdir(path, this.readdirOption)
    }
}

export { DataExtractor, type DataExtractorOption }
