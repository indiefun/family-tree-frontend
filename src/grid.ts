import { GridOptions } from "@logicflow/core/types/view/overlay/Grid";

export const enabled = true
export const size = 20

export default enabled ? {
    size: size,
    visible: true,
    type: "dot",
    config: {
      color: "#ababab",
      thickness: 1
    }
} as GridOptions : false
