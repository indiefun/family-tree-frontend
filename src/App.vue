<script setup lang="ts">
import {onMounted, ref} from "vue"
import LogicFlow from "@logicflow/core"
import "@logicflow/core/dist/style/index.css"
import Family from "./components/family"
import { readonly } from "./readonly"
import graphData from './graph-data'
import grid from './grid'

const container = ref();
const logicFlow = ref<LogicFlow>();

onMounted(() => {
  const lf = new LogicFlow({
    container: container.value,
    grid: grid,
    keyboard: {
      enabled: true,
    },
    isSilentMode: readonly,
  })

  lf.register(Family)
  lf.setTheme({
    snapline: {
      stroke: '#1E90FF', // 对齐线颜色
      strokeWidth: 1, // 对齐线宽度
    }
  })
  lf.on("anchor:dragstart", ({ nodeModel }) => {
    if (nodeModel.type === "family") {
      lf.graphModel.nodes.forEach((node) => {
        if (node.type === "family" && nodeModel.id !== node.id) {
          node.isShowAnchor = true;
          node.setProperties({
            isConnection: true
          });
        }
      });
    }
  })
  lf.on("anchor:dragend", ({ nodeModel }) => {
    if (nodeModel.type === "family") {
      lf.graphModel.nodes.forEach((node) => {
        if (node.type === "family" && nodeModel.id !== node.id) {
          node.isShowAnchor = false;
          lf.deleteProperty(node.id, "isConnection");
        }
      });
    }
  })
  lf.render(graphData)
  logicFlow.value = lf;
})

function onExportClick() {
  let data = logicFlow.value?.getGraphData();
  console.log(JSON.stringify(data));
}

</script>

<template>
  <button class="export-button" type="button" @click="onExportClick">Export</button>
  <div ref="container" class="container"></div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
.export-button {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}
</style>
