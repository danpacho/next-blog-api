import { remark } from 'remark'
import type { Node } from 'unist'
import { findMarkdownNode } from './find.markdown.node.ts'

export type MarkdownHeaderNode = {
    depth: number
    text: string
}
export type TocExtractionDepthRangeOption = {
    /**
     * @description min depth to extract
     */
    min: number
    /**
     * @description max depth to extract
     */
    max: number
}

const isDepthInRange = (depth: number, depthRange: TocExtractionDepthRangeOption) => {
    return depth >= depthRange.min && depth <= depthRange.max
}

export const extractHeaderNodes = (
    pureMarkdownSource: string,
    depthRange: TocExtractionDepthRangeOption = {
        min: 1,
        max: 5,
    }
) => {
    if (depthRange.min < 1 || depthRange.max > 5) throw new Error('toc depth range must be between 1 and 5')
    if (depthRange.max < depthRange.min) throw new Error('toc depth range max must be bigger than min')
    if (depthRange.min > depthRange.max) throw new Error('toc depth range min must be smaller than max')

    const extractedHeaderNodes: MarkdownHeaderNode[] = []

    const extractionRemarkPlugin = () => (tree: Node) => {
        const { matchedNode, notFound } = findMarkdownNode(tree, ['heading'])
        if (notFound) return

        const headerNode = matchedNode.reduce<MarkdownHeaderNode[]>((acc, curr) => {
            if ('depth' in curr && typeof curr.depth === 'number') {
                acc.push({ depth: curr.depth, text: curr.children?.[0]?.value ?? 'empty header' })
            }
            return acc
        }, [])

        // save extracted header nodes
        extractedHeaderNodes.push(...headerNode)
    }

    remark().use(extractionRemarkPlugin).process(pureMarkdownSource)

    return extractedHeaderNodes.filter(({ depth }) => isDepthInRange(depth, depthRange))
}
