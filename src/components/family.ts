import { HtmlNode, HtmlNodeModel, h } from "@logicflow/core"
import { toHan, toHanXu } from "../han-num";

export const width = 80;
export const height = 80;

class FamilyView extends HtmlNode {
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

    setHtml(rootEl: HTMLElement) {
        rootEl.innerHTML = ""
        const {
            properties: { 序,行,名,逝,偶,殉,子,女 }
        } = this.props.model
        rootEl.setAttribute("class", "family-container")
        {
            const element = document.createElement("div")
            const suffix = 行 ? `【行${toHan(行)}】` : ''
            element.innerHTML = `${toHanXu(序)}${suffix}`
            element.className = "family-order"
            rootEl.appendChild(element)
        }
        {
            const element = document.createElement("div")
            element.innerHTML = `${名}`
            element.className = `family-name ${逝?'bg-black':'bg-white'}`
            rootEl.appendChild(element)
        }
        {
            const element = document.createElement("div")
            element.innerHTML = `${偶}`
            element.className = `family-name ${殉?'bg-black':'bg-white'}`
            rootEl.appendChild(element)
        }
        {
            const element = document.createElement("div")
            const prefix = 子 ? `${toHan(子)}子` : '';
            const suffix = 女 ? `${toHan(女)}女` : '';
            element.innerHTML = `${prefix}${suffix}`
            element.className = `family-children`
            rootEl.appendChild(element)
        }
    }
}

class FamilyModel extends HtmlNodeModel {

    getOutlineStyle() {
        const style = super.getOutlineStyle();
        style.stroke = "none"
        if (style.hover) {
            style.hover.stroke = "none"
        }
        return style;
    }

    getAnchorStyle(anchorInfo: any) {
        const style = super.getAnchorStyle(anchorInfo);
        if (anchorInfo.type === "top") {
            style.fill = "red";
            style.hover.fill = "transparent";
            style.hover.stroke = "transpanrent";
            style.className = "lf-hide-default";
        } else {
            style.fill = "green";
        }
        return style;
    }

    setAttributes() {
        this.width = width
        this.height = height
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
    type: "family",
    model: FamilyModel,
    view: FamilyView
};
