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

export async function defaultBuild() {
    const data = await import('./assets/family-tree.json')
    return data.default as 谱
}

export default defaultBuild
