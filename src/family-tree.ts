export interface 族 {
    id: string,   // ID
    序?: number,  // 长次三四
    行?: number,  // 行一行二
    名: string,   // 族长名字
    逝?: boolean, // 族长已逝否
    偶?: string,  // 配偶名字
    殉?: boolean, // 配偶已逝否
    子?: number,  // 育有几子
    女?: number,  // 育有几女
    后?: 族[],    // 子嗣后代
}

export interface 谱 {
    名: string, // 名称
    期: string, // 更新日期
    始: string, // 刘成富
    世: number, // 四
    祖: string, // 刘温
    族: 族[],
}

function validateRequired(obj: any, required: any) {
    Object.keys(required).forEach(key => {
        if (!Object.hasOwn(obj, key) || (typeof obj[key]) !== (typeof required[key])) {
            throw `property \`${key}\` required`
        }
    })
}

function validateFamily(obj: any, key: string) {
    const required = { 名: '' } as any
    validateRequired(obj, required)
    validateFamilies(obj, key)
}

function validateFamilies(obj: any, key: string) {
    const arr = obj[key]
    if (arr) {
        if (arr instanceof Array) {
            arr.forEach(o => validateFamily(o, '族'))
        } else {
            throw `property \`${key}\` not array`
        }
    }
}

function validateTree(obj: any) {
    const required = { 名: '', 期: '', 始: '', 世: 1, 祖: '' } as any
    validateRequired(obj, required)
    validateFamilies(obj, '族')
}

export function from(json: string): 谱 {
    const obj = JSON.parse(json)
    validateTree(obj)
    return obj as 谱
}

export async function defaultBuild() {
    const data = await import('./assets/family-tree.json')
    return data.default as 谱
}

export default defaultBuild
