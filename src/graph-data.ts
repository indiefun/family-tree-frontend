import { v4 as uuid } from 'uuid'
import omit from 'omit'
import json, { 族, 谱 } from './family-tree'
import { width, height } from './components/family'
import { size } from './grid'

const hGap = size
const vGap = size * 3

interface NodeType {
    id: string,
    type: string,
    x?: number,
    y?: number,
    parent: string,
    children: string[],
    layer: number,
    properties: Omit<族, '后'>,
}
interface EdgeType {
    type: string,
    sourceNodeId: string,
    targetNodeId: string,
}
type NodeDict = Record<string, NodeType>

// 遍历树结构
function iterate(tree: 族[], handle: (node: 族) => void) {
    tree.forEach(node => {
        handle(node)
        iterate(node.后 ?? [], handle)
    })
}

// 提取数组元素的prop属性为新的数组
function extract<T>(list: 族[], prop: string): T[] {
    const props: T[] = []
    // @ts-ignore
    list.forEach(node => props.push(node[prop] as T))
    return props
}

// 遍历生成Node
function fillNodes(nodes: NodeType[], parent: string, layer: number, props: 族[]) {
    props.forEach(prop => {
        const node = {
            id: prop.id,
            type: 'family',
            properties: omit('后', prop),
            layer,
            parent,
            children: extract<string>(prop.后 ?? [], 'id')
        }
        nodes.push(node)
        fillNodes(nodes, prop.id, layer + 1, prop.后 ?? [])
    })
}

// 查找第一个子Node
function firstChild(node: NodeType, dict:NodeDict) {
    if (node.children && node.children.length > 0) return dict[node.children[0]]
    return null
}

export function build(orig: 谱) {
    const nodes: NodeType[] = []
    const edges: EdgeType[] = []

    // 全部生成ID
    iterate(orig.族, node => node.id = node.id ?? uuid())

    // 插入Node
    fillNodes(nodes, '', orig.世, orig.族)

    // 建立nodes的字典
    const dict = {} as NodeDict
    nodes.forEach(node => dict[node.id] = node)

    // 建立分层结构list
    const list = [] as NodeType[][]
    nodes.forEach(node => {
        const l = node.layer - orig.世
        if (!list[l]) list[l] = []
        list[l].push(node)
    })
    console.log('list', list)

    // 计算Node坐标
    for (let l = list.length - 1; l >= 0; --l) {
        const array = list[l]
        for (let i = 0; i < array.length; ++i) {
            const node = array[i]
            if (l === (list.length - 1)) {
                node.x = width * i + i * hGap
            } else {
                node.x = firstChild(node, dict)?.x
            }
            node.y = height * node.layer + node.layer * vGap
        }
    }

    // 添加Edges
    nodes.forEach(node => {
        node.children.forEach((childId: string) => {
            edges.push({
                type: 'polyline',
                sourceNodeId: node.id,
                targetNodeId: childId,
            })
        })
    })

    return {
        nodes,
        edges,
    }
}

export default build(json)
