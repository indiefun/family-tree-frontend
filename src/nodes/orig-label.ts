import { BaseLabelView, BaseLabelModel } from "./base-label"
import { toHan } from "../han-num"

export class OrigLabelView extends BaseLabelView {
    setContainer(container: HTMLElement) {
        const { properties: { 世 } } = this.props.model
        container.className = "label-container"
        {
            const element = document.createElement("div")
            element.innerHTML = `始祖`
            element.className =  "label-line"
            container.appendChild(element)
        }
        {
            const element = document.createElement("div")
            element.innerHTML = `•••`
            element.className =  "label-line"
            container.appendChild(element)
        }
        {
            const element = document.createElement("div")
            element.innerHTML = `•••`
            element.className =  "label-line"
            container.appendChild(element)
        }
        {
            const element = document.createElement("div")
            element.innerHTML = `${toHan(世)}世`
            element.className = "label-line"
            container.appendChild(element)
        }
    }
}

export class OrigLabelModel extends BaseLabelModel {
}

export default {
    type: "orig-label",
    model: OrigLabelModel,
    view: OrigLabelView,
}
