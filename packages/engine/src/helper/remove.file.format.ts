/**
 * @description Get pure `fileName` without extension
 * @param fileName
 */
export const removeFileFormat = (fileName: string): string => {
    const fileNameWithoutFormat = fileName.split('.').slice(0, -1).join('.')
    return fileNameWithoutFormat
}
