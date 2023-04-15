<script setup lang="ts">
import {onMounted, Ref, ref} from "vue"
import LogicFlow from "@logicflow/core"
import { DndPanel, Snapshot } from '@logicflow/extension'
import "@logicflow/core/dist/style/index.css"
import "@logicflow/extension/lib/style/index.css";
import Family from "./components/family"
import Ancestor from "./components/ancestor"
import Label from './components/label'
import OrigLabel from './components/orig-label'
import LayerLabel from './components/layer-label'
import LinkLine from "./components/link-line";
import { readonly } from "./readonly"
import {defaultDecode, decode, encode, createNode, MixinType, DataType, origLabelId, OrigLabelType} from './graph-data'
import grid from './grid'
import { 谱, from } from "./family-tree";

const container = ref();
const logicFlow = ref<LogicFlow>();
const selection = ref<MixinType>();
const importInput = ref();

function center(client: Ref) {
  const value = client.value;
  return {
    x: value.clientLeft + value.clientWidth * 0.5,
    y: value.clientTop + value.clientHeight * 0.5,
  }
}

onMounted(() => {
  const nodeTypes = ['family', 'ancestor']

  const lf = new LogicFlow({
    container: container.value,
    grid: grid,
    keyboard: {
      enabled: true,
    },
    isSilentMode: readonly,
    edgeGenerator: (sourceNode, targetNode, currentEdge) => {
      if (nodeTypes.includes(sourceNode.type)) return 'link-line'
    },
    plugins: [DndPanel, Snapshot]
  })

  lf.register(Family)
  lf.register(Ancestor)
  lf.register(Label)
  lf.register(OrigLabel)
  lf.register(LayerLabel)
  lf.register(LinkLine)

  lf.setTheme({
    snapline: {
      stroke: '#1E90FF', // 对齐线颜色
      strokeWidth: 1, // 对齐线宽度
    }
  })
  lf.extension.dndPanel.setPatternItems([
    {
      icon: '/user-plus-fill.svg',
      ...createNode(),
    }
  ])
  lf.on("anchor:dragstart", ({ nodeModel }) => {
    if (nodeTypes.includes(nodeModel.type)) {
      lf.graphModel.nodes.forEach((node) => {
        if (nodeTypes.includes(node.type) && nodeModel.id !== node.id) {
          node.isShowAnchor = true;
          node.setProperties({
            isConnection: true
          });
        }
      });
    }
  })
  lf.on("anchor:dragend", ({ nodeModel }) => {
    if (nodeTypes.includes(nodeModel.type)) {
      lf.graphModel.nodes.forEach((node) => {
        if (nodeTypes.includes(node.type) && nodeModel.id !== node.id) {
          node.isShowAnchor = false;
          lf.deleteProperty(node.id, "isConnection");
        }
      });
    }
  })
  const editableTypes = [...nodeTypes, 'label']
  lf.on('node:click', ({data}) => {
    if ( editableTypes.includes(data.type) ) {
      selection.value = data
    } else {
      onPropertiesChange()
      selection.value = undefined
    }
  });
  lf.on('blank:click', () => {
    onPropertiesChange()
    selection.value = undefined
  })
  defaultDecode(center(container)).then(data => lf.render(data))
  logicFlow.value = lf;
})

function onRefreshDataClick() {
  const graph = logicFlow.value?.getGraphData();
  const tree = encode(graph)
  const data = decode(tree, center(container), '')
  logicFlow.value?.render(data)
}

function onImportDataClick() {
  importInput.value.click()
}

function onImportFileChange(event: any) {
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = e => {
    try {
      const json = from(e.target?.result as string)
      const data = decode(json, center(container), '')
      logicFlow.value?.render(data)
    } catch (err) {
      alert(err)
    }
    importInput.value.value = null
  }
}

function onExportDataClick() {
  const graphData = logicFlow.value?.getGraphData();
  const familyTree = encode(graphData)
  const json = JSON.stringify(familyTree)
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'family-tree.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function onExportImageClick() {
  logicFlow.value?.getSnapshot('family-tree.png')
}

function onPropertiesChange() {
  if (selection.value?.id) {
    logicFlow.value?.setProperties(selection.value?.id, selection.value?.properties)
  }
}

function onLayerPropertiesChange() {
  onPropertiesChange()
  if (selection.value?.type === 'ancestor') {
    const origLayer = selection.value.properties.世
    const origLabel = logicFlow.value?.getDataById(origLabelId) as OrigLabelType
    const graphData = logicFlow.value?.getGraphData() as DataType
    if (graphData && origLabel) {
      const layerOffset = origLayer - origLabel.properties.世
      graphData.nodes.forEach(node => {
        if (node.type === 'layer-label') {
          node.properties.世 = node.properties.世 + layerOffset
          logicFlow.value?.setProperties(node.id, node.properties)
        }
      })
    }
    if (origLabel) {
      origLabel.properties.世 = origLayer
      logicFlow.value?.setProperties(origLabel.id, origLabel.properties)
    }
  }
}
</script>

<template>
  <div class="tool-bar">
    <button class="tool-btn" type="button" @click="onRefreshDataClick">
      <img class="svg-icon" alt="重绘谱图" src="./assets/svg/redo.svg">
    </button>
    <button class="tool-btn" type="button" @click="onImportDataClick">
      <img class="svg-icon" alt="导入数据" src="./assets/svg/upload.svg">
    </button>
    <button class="tool-btn" type="button" @click="onExportDataClick">
      <img class="svg-icon" alt="导出数据" src="./assets/svg/download.svg">
    </button>
    <button class="tool-btn" type="button" @click="onExportImageClick">
      <img class="svg-icon" alt="导出图片" src="./assets/svg/external-link.svg">
    </button>
    <input class="import-input" type="file" accept="application/json" ref="importInput" @change="onImportFileChange"/>
  </div>
  <div class="panel-box" v-show="selection">
    <label class="panel-title">编辑面板</label>
    <template v-if="selection?.type === 'label'">
      <div class="panel-line">
        <label class="panel-label">名称</label>
        <input class="panel-input" type="text" v-model="selection.properties.名" @change="onPropertiesChange"/>
      </div>
      <div class="panel-line">
        <label class="panel-label">日期</label>
        <input class="panel-input" type="text" v-model="selection.properties.期" @change="onPropertiesChange"/>
      </div>
    </template>
    <template v-if="selection?.type === 'family'">
      <div class="panel-line">
        <label class="panel-label">顺序</label>
        <input class="panel-input" type="number" v-model="selection.properties.序" @change="onPropertiesChange"/>
      </div>
      <div class="panel-line">
        <label class="panel-label">行序</label>
        <input class="panel-input" type="number" v-model="selection.properties.行" @change="onPropertiesChange"/>
      </div>
      <div class="panel-line">
        <label class="panel-label">姓名</label>
        <input class="panel-input" type="text" v-model="selection.properties.名" @change="onPropertiesChange"/>
      </div>
      <div class="panel-line">
        <label class="panel-label">已逝</label>
        <input class="panel-input" type="checkbox" v-model="selection.properties.逝" @change="onPropertiesChange"/>
      </div>
      <div class="panel-line">
        <label class="panel-label">配偶</label>
        <input class="panel-input" type="text" v-model="selection.properties.偶" @change="onPropertiesChange"/>
      </div>
      <div class="panel-line">
        <label class="panel-label">配殉</label>
        <input class="panel-input" type="checkbox" v-model="selection.properties.殉" @change="onPropertiesChange"/>
      </div>
      <div class="panel-line">
        <label class="panel-label">育儿</label>
        <input class="panel-input" type="number" v-model="selection.properties.子" @change="onPropertiesChange"/>
      </div>
      <div class="panel-line">
        <label class="panel-label">育女</label>
        <input class="panel-input" type="number" v-model="selection.properties.女" @change="onPropertiesChange"/>
      </div>
    </template>
    <template v-if="selection?.type === 'ancestor'">
      <div class="panel-line">
        <label class="panel-label">始祖</label>
        <input class="panel-input" type="text" v-model="selection.properties.始" @change="onPropertiesChange"/>
      </div>
      <div class="panel-line">
        <label class="panel-label">世祖</label>
        <input class="panel-input" type="text" v-model="selection.properties.祖" @change="onPropertiesChange"/>
      </div>
      <div class="panel-line">
        <label class="panel-label">世数</label>
        <input class="panel-input" type="number" v-model="selection.properties.世" @change="onLayerPropertiesChange"/>
      </div>
    </template>
  </div>
  <div ref="container" class="container"></div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
.import-input {
  visibility: hidden;
  width: 0;
}
.tool-bar {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 150px;
  z-index: 1;
  padding: 5px 5px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.tool-btn {
  padding: 0;
  width: 31px;
  height: 31px;
  display: flex;
  justify-content: center;
  align-items: stretch;
}
.panel-box {
  position: absolute;
  right: 5px;
  top: 80px;
  z-index: 1;
  padding: 5px 5px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  width: 240px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.panel-title {
  width: auto;
  text-align: center;
}
.panel-line {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
}
.panel-line:first-child {
  margin-top: unset;
}
.panel-label {
  font-size: 15px;
  flex: 0 0 auto;
}
.panel-input {
  flex: auto auto;
}

</style>
