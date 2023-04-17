import { BaseModel, BaseView } from "./base-node";
import {toHan} from "../han-num";

class AncestorView extends BaseView {
    setContainer(container: HTMLElement) {
        const { properties: { 始, 世, 祖  } } = this.props.model
        container.className = "node-container"
        {
            const element = document.createElement("div")
            element.innerHTML = `始祖 ${始}`
            element.className = "node-line bg-black"
            container.appendChild(element)
        }
        {
            const element = document.createElement("div")
            element.innerHTML = `···`
            element.className = `node-line bg-black`
            container.appendChild(element)
        }
        {
            const element = document.createElement("div")
            element.innerHTML = `···`
            element.className = `node-line bg-black`
            container.appendChild(element)
        }
        {
            const element = document.createElement("div")
            element.innerHTML = `${toHan(世)}世祖 ${祖}`
            element.className = `node-line bg-black`
            container.appendChild(element)
        }
    }
}

class AncestorModel extends BaseModel {
    setAttributes() {
        super.setAttributes();
        this.menu = []
    }
}

export default {
    type: "ancestor",
    model: AncestorModel,
    view: AncestorView
};
