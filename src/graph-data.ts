import { v4 as uuid } from 'uuid'
import omit from 'omit'
import { 族, 谱 } from './family-tree'
import { size, enabled as grid } from './grid'

const w = size * 6 // family node width
const h = size * 4  // family node height
const lw = size * 4 // label width

const hGap = size
const vGap = size * 2
const root = 'root'

type XY = { x: number, y: number }
type WH = { w: number, h: number }
type BaseType = XY & { id: string, properties: WH }
type NodeType = BaseType &
    { parent: string, children: string[], layer: number } &
    (
        { type: 'family', properties: WH & Omit<族, '后'> } |
        { type: 'ancestor', properties: WH & Pick<谱, '始' | '世' | '祖'> }
    )
type LabelType = BaseType &
    (
        {type: 'label', properties: WH & {名: string}} |
        {type: 'orig-label', properties: WH & {世: number}} |
        {type: 'layer-label', properties: WH & {世: number}}
    )
type MixinType = NodeType | LabelType

type EdgeType = {
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

// 填充Nodes
function fillNodes(nodes: Omit<NodeType, 'x' | 'y'>[], parentId: string, parentLayer: number, families: 族[]) {
    const layer = parentLayer + 1
    families.forEach(family => {
        nodes.push({
            id: family.id,
            type: 'family',
            properties: {...omit('后', family), w: w, h: h} ,
            layer,
            parent: parentId,
            children: extract<string>(family.后 ?? [], 'id')
        })
        fillNodes(nodes, family.id, layer, family.后 ?? [])
    })
}

function first<T>(list: T[] | undefined | null): T | null {
    return (list && list.length > 0) ? list[0] : null;
}

export function buildNodes(orig: 谱) {
    const nodes: NodeType[] = []
    const edges: EdgeType[] = []

    // 全部生成ID
    iterate(orig.族, node => node.id = node.id ?? uuid())

    // 插入Node
    fillNodes(nodes, root, orig.世, orig.族)

    // 建立nodes的字典
    const dict = {} as NodeDict
    {
        nodes.forEach(node => dict[node.id] = node)
    }

    // 建立分层结构list
    const list = [] as NodeType[][]
    {
        nodes.forEach(node => {
            const l = node.layer - orig.世 - 1
            if (!list[l]) list[l] = []
            list[l].push(node)
        })
    }

    // 计算Node坐标
    {
        for (let l = list.length - 1; l >= 0; --l) {
            const array = list[l]
            for (let i = 0; i < array.length; ++i) {
                const node = array[i]
                if (l === (list.length - 1)) {
                    node.x = w * i + i * hGap
                } else {
                    const childId = first(node.children)
                    const child = childId ? dict[childId] : null
                    node.x = child?.x ?? 0
                }
                node.y = h * node.layer + node.layer * vGap
            }
        }
    }

    // 添加始祖Node
    {
        const children = extract<string>(orig.族, 'id')
        const childId = first(children)
        const child = childId ? dict[childId] : null
        nodes.push({
            id: root,
            type: 'ancestor',
            parent: '',
            children,
            layer: orig.世,
            properties: { 始: orig.始, 世: orig.世, 祖: orig.祖, w: w, h: h },
            x: child?.x ?? 0,
            y: (child?.y ?? 0) - vGap - h,
        })
    }

    // 添加Edges
    {
        nodes.forEach(node => {
            node.children.forEach((childId: string) => {
                edges.push({
                    type: 'link-line',
                    sourceNodeId: node.id,
                    targetNodeId: childId,
                })
            })
        })
    }

    return {
        nodes,
        edges,
    }
}

function border(nodes: MixinType[]) {
    let top = 10000000, left = 10000000
    let right = -10000000, bottom = -10000000
    nodes.forEach(node => {
        top = Math.min(node.y - node.properties.h * 0.5, top)
        left = Math.min(node.x - node.properties.w * 0.5, left)
        right = Math.max(node.x + node.properties.w * 0.5, right)
        bottom = Math.max(node.y + node.properties.h * 0.5, bottom)
    })
    return { top, left, right, bottom }
}

function corner(nodes: MixinType[]) {
    let top = 10000000, left = 10000000
    let right = -10000000, bottom = -10000000
    nodes.forEach(node => {
        top = Math.min(node.y, top)
        left = Math.min(node.x, left)
        right = Math.max(node.x, right)
        bottom = Math.max(node.y, bottom)
    })
    return { top, left, right, bottom }
}

function buildLabels(orig: 谱, nodes: NodeType[]) {
    const labels: LabelType[] = []

    const dict: NodeDict = {}
    {
        nodes.forEach(node => {
            dict[node.id] = node
        })
    }

    // 添加左侧世数标签
    {
        const {top, left} = corner(nodes);
        const origLabel: LabelType = {
            id: 'orig-label',
            type: 'orig-label',
            x: left - w * 0.5 - hGap - lw * 0.5,
            y: top,
            properties: {
                世: orig.世,
                w: lw,
                h: h + vGap
            }
        }
        labels.push(origLabel)

        const lh = h + vGap
        const layerDict: Record<number, boolean> = {}
        nodes.forEach(node => layerDict[node.layer] = true)
        Object.keys(layerDict)
            .map(layer => Number(layer))
            .filter(layer => layer !== orig.世)
            .forEach(layer => {
                labels.push({
                    id: `layer-label-${layer}`,
                    type: 'layer-label',
                    x: origLabel.x,
                    y: origLabel.y + origLabel.properties.h * 0.5 + lh * (layer - orig.世) - lh * 0.5,
                    properties: {
                        世: layer,
                        w: lw,
                        h: lh,
                    }
                })
            })
    }

    // 添加标题
    {
        const { top, left, right } = corner(nodes)
        const labelWidth = right - left + w + hGap * 2 + lw
        const labelHeight = size * 2
        labels.push({
            id: 'title',
            type: 'label',
            x: left - w * 0.5 - hGap - lw + labelWidth * 0.5,
            y: top - h * 0.5 - vGap * 0.5 - labelHeight * 0.5,
            properties: {
                名: orig.名,
                w: labelWidth,
                h: labelHeight,
            }
        })
    }

    return {
        labels: labels
    }
}

function mixin(nodes: NodeType[], edges: EdgeType[], labels: LabelType[]) {
    return {
        nodes: [...nodes, ...labels],
        edges: edges,
    }
}

type DataType = ReturnType<typeof mixin>

function align(data: DataType, center: XY, id?: string): DataType {
    const { nodes } = data

    const { top, left, right, bottom } = border(nodes)
    const overGrid = {
        x: grid ? left % size : 0,
        y: grid ? top % size : 0,
    }

    const focus = nodes.find(node => node.id === id)
    let focusCenter;
    if (focus) {
        focusCenter = { x: focus.x + focus.properties.w * 0.5, y: focus.y + focus.properties.h * 0.5 }
    } else {
        focusCenter = { x: (left + right) * 0.5, y: (top + bottom) * 0.5 }
    }

    const offset = { x: center.x - focusCenter.x - overGrid.x, y: center.y - focusCenter.y - overGrid.y }
    nodes.forEach(node => {
        node.x = node.x + offset.x
        node.y = node.y + offset.y
    })
    return data
}

export function build(orig: 谱, center: XY, focus?: string) {
    const { nodes, edges } = buildNodes(orig)
    const { labels } = buildLabels(orig, nodes)
    const data = mixin(nodes, edges, labels)
    return align(data, center, focus)
}

export async function defaultBuild(center: XY) {
    const json = await import('./family-tree')
    const focus = await import('./focus-id')
    return build(await json.default(), center, focus.default)
}

export default defaultBuild
