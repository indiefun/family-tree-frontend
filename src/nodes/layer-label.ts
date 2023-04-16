import { BaseLabelView, BaseLabelModel } from "./base-label"
import { toHan } from "../han-num"

export class LayerLabelView extends BaseLabelView {
    setContainer(container: HTMLElement) {
        const { properties: { 世 } } = this.props.model
        container.className = "label-container"
        {
            const element = document.createElement("div")
            element.innerHTML = `${toHan(世)}世`
            element.className = "label-line"
            container.appendChild(element)
        }
    }
}

export class LayerLabelModel extends BaseLabelModel {
}

export default {
    type: "layer-label",
    model: LayerLabelModel,
    view: LayerLabelView,
}
