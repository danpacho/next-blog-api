import {
    extractHeaderNodes,
    type MarkdownHeaderNode,
    type TocExtractionDepthRangeOption,
} from './extract.header.node.ts'

/**
 * @description Table of contents for given markdown source, range of depth to extract, min `1` ~ max `5`
 * @example
 * ```md
 * # h1-1
 * ## h2-1
 * ### h3-1
 * ## h2-2
 * # h1-2
 * ## h2-3
 * ```
 * extract toc from above markdown source
 * ```ts
 * const toc = getToc(mdSource)
   const result = [
    {
        depth: 1,
        text: "h1-1",
        href: "#h1-1",
        children: [
        {
            depth: 2,
            text: "h2-1",
            href: "#h2-1",
            children: [
            {
                depth: 3,
                text: "h3-1",
                href: "#h3-1",
            },
            ],
        },
        {
            depth: 2,
            text: "h2-2",
            href: "#h2-2",
        },
        ],
    },
    {
        depth: 1,
        text: "h1-2",
        href: "#h1-2",
        children: [
        {
            depth: 2,
            text: "h2-3",
            href: "#h2-3",
        },
        ],
    },
    ];

 * ```
 */
export interface Toc extends MarkdownHeaderNode {
    href: string
    children?: Toc[]
}

/**
 * @description get table of contents from markdown source
 * @param src markdown source
 * @param depthRange header depth range to extract, min `1` ~ max `5`
 * @returns table of contents
 */
export const getToc = (
    src: string,
    depthRange: TocExtractionDepthRangeOption = {
        min: 1,
        max: 5,
    }
) => {
    const rootHeaderNodes = extractHeaderNodes(src, depthRange)
    const toc = rootHeaderNodes.reduce<Toc[]>((acc, curr) => {
        const isFirstHeading = curr.depth === 1
        if (isFirstHeading === false) return acc

        const targetNodes = rootHeaderNodes.slice(rootHeaderNodes.indexOf(curr), rootHeaderNodes.length)
        acc.push({
            ...curr,
            href: `#${curr.text}`,
            children: getTocChildren(targetNodes),
        })

        return acc
    }, [])

    return toc
}

const getTocChildren = (nodes: MarkdownHeaderNode[]): Toc[] | undefined => {
    const headNode = nodes[0]
    const searchEndIndex = nodes.slice(1).findIndex(({ depth }) => depth <= headNode.depth) + 1
    const safeSearchEndIndex = searchEndIndex === 0 ? nodes.length : searchEndIndex

    // toc generation nodes
    const searchNodes = nodes.slice(0, safeSearchEndIndex)

    const tocChildren = searchNodes.reduce<Toc[]>((acc, _, i, tot) => {
        const nextNode = tot[i + 1]

        const isLastNode = i === tot.length - 1
        if (isLastNode) return acc

        const isNextNodeChildren = headNode.depth + 1 === nextNode.depth || headNode.depth === nextNode.depth
        if (isNextNodeChildren) {
            acc.push({
                ...nextNode,
                href: `#${nextNode.text}`,
                children: getTocChildren(nodes.slice(i + 1)),
            })
            return acc
        }

        return acc
    }, [])

    const nullableChildren = tocChildren.length === 0 ? undefined : tocChildren
    return nullableChildren
}

export { type TocExtractionDepthRangeOption }
