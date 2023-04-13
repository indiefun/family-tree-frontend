import { BaseLabelModel, BaseLabelView } from "./base-label"

export class LabelView extends BaseLabelView {
    setContainer(container: HTMLElement) {
        const { properties: { 名 } } = this.props.model
        container.className = "label-container"
        {
            const element = document.createElement("div")
            element.innerHTML = `${名}`
            element.className = "label-line font-lg"
            container.appendChild(element)
        }
    }
}

export class LabelModel extends BaseLabelModel {
}

export default {
    type: "label",
    model: LabelModel,
    view: LabelView,
}
