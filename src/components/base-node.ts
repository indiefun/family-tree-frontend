import { HtmlNode, HtmlNodeModel, h } from "@logicflow/core"

export class BaseView extends HtmlNode {
    getAnchorShape(anchorData: any) {
        const { x, y, type } = anchorData;
        return h("rect", {
            x: x - 5,
            y: y - 5,
            width: 10,
            height: 10,
            className: `custom-anchor ${type === "top" ? "incoming-anchor" : "outgoing-anchor"}`
        });
    }
    setHtml(rootEl: HTMLElement): void {
        rootEl.innerHTML = ""
        const container = document.createElement("div")
        this.setContainer(container)
        rootEl.appendChild(container)
    }
    setContainer(container: HTMLElement): void {
    }
}

export class BaseModel extends HtmlNodeModel {
    getOutlineStyle() {
        const style = super.getOutlineStyle();
        const { isSelected } = this
        style.stroke = isSelected ? "blue" : "none"
        if (style.hover) {
            style.hover.stroke = "blue"
        }
        return style;
    }

    getAnchorStyle(anchorInfo: any) {
        const style = super.getAnchorStyle(anchorInfo);
        if (anchorInfo.type === "top") {
            style.fill = "red";
            style.hover.fill = "transparent";
            style.hover.stroke = "transparent";
            style.className = "lf-hide-default";
        } else {
            style.fill = "green";
        }
        return style;
    }

    setAttributes() {
        const {w, h} = this.properties
        this.width = w
        this.height = h
        this.text.editable = false
        this.sourceRules.push({
            message: "只允许从下方的锚点连出",
            validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
                return sourceAnchor?.type === "bottom";
            }
        });
        this.targetRules.push({
            message: "只允许连接上方的锚点",
            validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
                return targetAnchor?.type === "top";
            }
        });
    }

    getDefaultAnchor() {
        const {
            id,
            x, y, height,
            isHovered, isSelected,
            properties: { isConnection }
        } = this;
        const anchors = [] as any;
        // 如果是连出，就不显示上边的锚点
        if (isConnection || !(isHovered || isSelected)) {
            anchors.push({
                x: x,
                y: y - height / 2,
                id: `${id}_parent`,
                edgeAddable: false,
                type: "top"
            })
        }
        if (!isConnection) {
            anchors.push({
                x: x,
                y: y + height / 2,
                id: `${id}_children`,
                type: "bottom"
            })
        }
        return anchors as {
            x: number;
            y: number;
            id: string;
        }[];
    }
}

export default {
    BaseView,
    BaseModel,
}
