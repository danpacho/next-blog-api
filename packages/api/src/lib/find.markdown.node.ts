import type { Node, Position } from 'unist'
import { visit } from 'unist-util-visit'

export interface NodeChildrenType {
    type: string
    value: string
    position?: Position
}

type MarkdownNodeType = 'text' | 'paragraph' | 'heading' | 'inlineCode' | 'thematicBreak' | 'image'

export interface MarkdownNode extends Node {
    type: MarkdownNodeType
    value: string
    children?: MarkdownNode[]
    position?: Position
}

const findMarkdownNode = (tree: Node, markdownNodes: MarkdownNodeType[]) => {
    const matchedNode: MarkdownNode[] = []

    visit(tree, (node: unknown) => {
        const { type } = node as MarkdownNode
        if (markdownNodes.includes(type)) {
            matchedNode.push(node as MarkdownNode)
        }
    })

    return {
        matchedNode,
        notFound: matchedNode.length === 0,
    }
}

export { findMarkdownNode }
