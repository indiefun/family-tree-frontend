import { HtmlNode, HtmlNodeModel } from "@logicflow/core"

export class BaseLabelView extends HtmlNode {
    setHtml(rootEl: HTMLElement): void {
        rootEl.innerHTML = ""
        const container = document.createElement("div")
        this.setContainer(container)
        rootEl.appendChild(container)
    }
    setContainer(container: HTMLElement): void {
    }
}

export class BaseLabelModel extends HtmlNodeModel {
    getOutlineStyle() {
        const style = super.getOutlineStyle();
        const { isSelected } = this
        style.stroke = isSelected ? "blue" : "none"
        if (style.hover) {
            style.hover.stroke = "blue"
        }
        return style;
    }

    setAttributes() {
        this.text.editable = true
        const { w, h } = this.properties
        this.width = w
        this.height = h
    }

    getDefaultAnchor(): { x: number; y: number; id: string; }[] {
        return []
    }
}

export default {
    BaseLabelView,
    BaseLabelModel,
}
