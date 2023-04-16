import { BaseModel, BaseView } from "./base-node"
import { toHan, toHanXu } from "../han-num"

class FamilyView extends BaseView {
    setContainer(container: HTMLElement) {
        const { properties: { 序,行,名,逝,偶,殉,子,女 } } = this.props.model
        container.className = "node-container"
        {
            const element = document.createElement("div")
            const suffix = 行 ? `【行${toHan(行)}】` : ''
            element.innerHTML = `${toHanXu(序)}${suffix}`
            element.className = "node-line p-l-sm"
            container.appendChild(element)
        }
        {
            const element = document.createElement("div")
            element.innerHTML = `${名}`
            element.className = `node-line ${逝?'bg-black':'bg-white'}`
            container.appendChild(element)
        }
        {
            const element = document.createElement("div")
            element.innerHTML = `${偶}`
            element.className = `node-line ${殉?'bg-black':'bg-white'}`
            container.appendChild(element)
        }
        {
            const element = document.createElement("div")
            const prefix = 子 ? `${toHan(子)}子` : '';
            const suffix = 女 ? `${toHan(女)}女` : '';
            element.innerHTML = `${prefix}${suffix}`
            element.className = `node-line`
            container.appendChild(element)
        }
    }
}

class FamilyModel extends BaseModel {
}

export default {
    type: "family",
    model: FamilyModel,
    view: FamilyView,
};
