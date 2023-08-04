import { describe, expect, it } from 'vitest'
import { removeFileFormat } from '../remove.file.format'

describe('remove file format', () => {
    it('should remove .md format', () => {
        const fileName = 'test.md'
        const fileNameWithoutFormat = removeFileFormat(fileName)

        expect(fileNameWithoutFormat).toBe('test')
    })

    it('should remove nested . formats', () => {
        const nestedFormat = 'one.two.three.md'
        const fileNameWithoutFormat = removeFileFormat(nestedFormat)

        expect(fileNameWithoutFormat).toBe('one.two.three')
    })
})
