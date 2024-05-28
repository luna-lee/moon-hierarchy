<template>
    <div>
        <div class="pannel">
            <div class="button-group">
                <button @click="$refs.hierarchy.moveToCenter()">移动到中心</button>
                <button @click="$refs.hierarchy.zoom(1.5)">放大</button>
                <button @click="$refs.hierarchy.zoom(0.5)">缩小</button>
                <button @click="$refs.hierarchy.pauseZoom()">暂停缩放</button>
                <button @click="$refs.hierarchy.continueZoom()">恢复缩放</button>
                <button @click="$refs.hierarchy.moveToNode('qyfxsbpggl', ['click', 'contextmenu'])">
                    移动到指定节点，并触发contextmenu
                </button>
                <button @click="$refs.hierarchy.expendAllNode()">展开全部节点</button>
                <button @click="$refs.hierarchy.foldAllNode()">折叠全部节点</button>
            </div>
            <div style="margin-top: 10px">
                <input type="radio" id="h" value="h" v-model="mode" />
                <label for="h">水平模式</label>
                <input type="radio" id="v" value="v" v-model="mode" />
                <label for="v">垂直模式</label>
            </div>
            <div class="item" v-if="mode == 'h'">
                <div><input type="radio" id="h-lr" value="lr" v-model="layout" /> <label for="h-lr">左-右布局</label></div>
                <div><input type="radio" id="h-rl" value="rl" v-model="layout" /> <label for="h-rl">右-左布局</label></div>
                <div><input type="radio" id="h-bf" value="bf" v-model="layout" /> <label for="h-bf">蝴蝶布局</label></div>
            </div>
            <div class="item" v-if="mode == 'v'">
                <div><input type="radio" id="tb" value="tb" v-model="layout" /> <label for="tb">上-下布局</label></div>
                <div><input type="radio" id="bt" value="bt" v-model="layout" /> <label for="bt">下-上布局</label></div>
                <div><input type="radio" id="v-bf" value="bf" v-model="layout" /> <label for="v-bf">蝴蝶布局</label></div>
            </div>
        </div>
        <div class="document">
            <!-- <router-link to="/md-view" target="_blank">文档</router-link> -->
            <a href="https://github.com/luna-lee/moon-hierarchy" target="_blank">github地址</a>
        </div>

        <hierarchy
            ref="hierarchy"
            class="moon-hierarchy"
            :mode="mode"
            :treeData="treeData"
            :treeOptions="treeOptions"
            :layout="layout"
            :negativeIds="['qydak', 'root1', 'root2', 'root3']"
            :config="config"
            :width="width"
            :height="height"
            expendShape=".moon-hierarchy-plus"
            foldShape=".moon-hierarchy-plus"
            @draw-done="onDrawDone"
        >
            <div>
                <ul>
                    <li class="contentmenu-item" @click="onAdd">新增子节点</li>
                    <li class="contentmenu-item" @click="onRemove">删除节点</li>
                    <li class="contentmenu-item" @click="onUpdate">更新数据</li>
                </ul>
            </div>
        </hierarchy>
    </div>
</template>
<script>
import hierarchy from '@/components/moon-hierarchy/index.vue';
export default {
    inheritAttrs: false,
    name: '',
    props: {},
    components: {
        hierarchy
    },
    created() {
        this.setWidthHeight();
        window.addEventListener('resize', () => {
            // 窗口大小改变时执行的操作
            this.setWidthHeight();
        });
    },
    mounted() {
        let _this = this;
        fetch('https://www.fste.top/files/d3335980e04011ed91b4f7437d34c747/dataTree.js')
            .then((response) => {
                return response.text();
            })
            .then((data) => {
                _this.treeData = eval(data);
            });
    },
    data() {
        return {
            mode: 'v',
            layout: 'bf',
            treeData: [],
            currentNode: {},
            treeOptions: { id: 'code', pId: 'pcode' },
            width: 0,
            height: 0
        };
    },
    watch: {},
    computed: {
        config() {
            return {
                node: {
                    on: {
                        clickFetchChildren: (data, node, svg) => {
                            console.log(data, node, svg);
                            return new Promise((r) => {
                                setTimeout(() => {
                                    r([
                                        {
                                            id: '32323',
                                            name: '金融贷款余额test',
                                            code: '980eccec9a23237b49e488c10f8fa70f9c2d'
                                        },
                                        {
                                            id: '3233',
                                            name: '金融贷款余额test',
                                            code: '980444eccec9a23237b49e488c10f8fa70f9c2d'
                                        },
                                        {
                                            id: '323243333',
                                            name: '金融贷款余额test',
                                            code: '1980eccec9a23237b49e488c10f8fa70f9c2d'
                                        },
                                        {
                                            id: '323323',
                                            name: '金融贷款余额test',
                                            code: '2980eccec9a23237b49e488c10f8fa70f9c2d'
                                        },
                                        {
                                            id: '323223',
                                            name: '金融贷款余额test',
                                            code: '3980eccec9a23237b49e488c10f8fa70f9c2d'
                                        },
                                        {
                                            id: '323123',
                                            name: '金融贷款余额test',
                                            code: '480eccec9a23237b49e488c10f8fa70f9c2d'
                                        },
                                        {
                                            id: '323232',
                                            name: '金融贷款余额test',
                                            code: '94580eccec9a23237b49e488c10f8fa70f9c2d'
                                        },
                                        {
                                            id: '3333',
                                            name: 'lv-2',
                                            code: '94580eccec9a23237b49e488c10f8fa70f9c2d11',
                                            pcode: '94580eccec9a23237b49e488c10f8fa70f9c2d'
                                        }
                                    ]);
                                }, 2000);
                            });
                        },
                        click: (e, d, el, svg) => {
                            svg.selectAll('.active-node').classed('active-node', false);
                            el.classed('active-node', true);
                            this.$emit('node-click', d.data);
                            this.$refs.hierarchy.hiddenCustomView();
                        },
                        contextmenu: (e, d, node, svg) => {
                            e.preventDefault();
                            this.currentNode = d.data;
                            this.$refs.hierarchy.showCustomView(e, d);
                        }
                    },
                    exShaps: this.mode == 'h' ? this.exShaps() : [],
                    plus: {
                        artts: {},
                        show: this.mode != 'h'
                    }
                },
                customView: {
                    width: 120,
                    height: 110,
                    duration: 400
                },
                arrow: {
                    // show: false
                }
            };
        }
    },
    methods: {
        setWidthHeight() {
            this.width = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - 10;
            this.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 30;
        },
        addNew() {
            this.$refs.hierarchy.addNode('root', [
                {
                    id: 'new' + new Date().getTime(),
                    name: '企业信息' + 'new' + new Date().getTime(),
                    code: 'new' + new Date().getTime(),
                    modelType: '',
                    domainId: '',
                    pcode: 'root'
                }
            ]);
        },
        onDrawDone({ svg, container }) {
            svg.on('click', () => {
                console.log('这是画布');
                this.$refs.hierarchy.hiddenCustomView();
            });
            this.svg = svg;
            this.container = container;
        },
        onAdd() {
            this.$refs.hierarchy.addNode(
                this.currentNode[this.treeOptions.id],
                [
                    {
                        id: 'new' + new Date().getTime(),
                        name: '企业信息' + 'new' + new Date().getTime(),
                        code: 'new' + new Date().getTime(),
                        modelType: '',
                        domainId: '',
                        pcode: this.currentNode[this.treeOptions.id]
                    }
                ],
                -1
            );
        },
        onRemove() {
            this.$refs.hierarchy.removeNodeById(this.currentNode[this.treeOptions.id]);
        },
        onUpdate() {
            this.$refs.hierarchy.updateNodeByData({ ...this.currentNode, name: 'hello', children: [] });
        },
        exShaps() {
            let plusCircleWidth = 15;
            function isNonEmptyArray(arr) {
                return arr && arr.length;
            }
            return [
                {
                    name: 'text',
                    attrs: {
                        fill: (d) => {
                            if (d.data.children?.length) return 'red';
                        },
                        'font-size': 19,
                        transform: (d) => {
                            return d.data._sign == 1
                                ? `translate(${d.data._nodeConfig.nodeWidth},${d.data._nodeConfig.nodeHeight / 2 + 5})`
                                : `translate(-20,${d.data._nodeConfig.nodeHeight / 2 + 5})`;
                        }
                    },
                    compose: {
                        text(d) {
                            if (typeof d.data._isexpend == 'boolean') {
                                return d.data._isexpend ? '🤩' : '🤓';
                            }
                            return d.data?.children?.length ? '😝' : '😃';
                        }
                    }
                },

                {
                    name: 'g',
                    on: {
                        click: (e) => {
                            this.$refs.hierarchy.hiddenCustomView();
                        }
                    },
                    attrs: {
                        class: 'moon-hierarchy-plus',
                        display: (d) => {
                            if (
                                (!isNonEmptyArray(d.data.children) && !isNonEmptyArray(d.data._children)) ||
                                d.data.track.length == 1
                            ) {
                                return 'none';
                            }
                        },
                        transform: (d) =>
                            `translate(${
                                d.data._sign == 1 ? d.data._nodeConfig.nodeWidth + 2 + plusCircleWidth / 2 : -plusCircleWidth
                            },${d.data._nodeConfig.nodeHeight / 2 + 1})`
                    },
                    children: [
                        {
                            name: 'circle',
                            attrs: {
                                class: 'moon-hierarchy-plus-circle',
                                r: plusCircleWidth / 2
                            }
                        },
                        {
                            name: 'line',
                            attrs: {
                                x1: -plusCircleWidth / 4,
                                y1: '0',
                                x2: plusCircleWidth / 4,
                                y2: '0'
                            }
                        },
                        /*  {
                            name: 'text',
                            attrs: {
                                display: (d) => {
                                    if (d.data?.children?.length) {
                                        return 'none';
                                    }
                                },
                                x: -4,
                                y: 5
                            },
                            compose: {
                                text(d) {
                                    return 22 + d.data?._children?.length;
                                }
                            }
                        }, */
                        {
                            name: 'line',
                            attrs: {
                                display: (d) => {
                                    if (d.data?.children?.length) {
                                        return 'none';
                                    }
                                },
                                x1: '0',
                                y1: -plusCircleWidth / 4,
                                x2: '0',
                                y2: plusCircleWidth / 4
                            }
                        },
                        {
                            name: 'circle',
                            attrs: {
                                r: plusCircleWidth / 2,
                                'fill-opacity': 0,
                                'stroke-width': '0.5'
                            }
                        }
                    ]
                }
            ];
        }
    }
};
</script>
<style lang="scss" scoped>
.moon-hierarchy {
    background: #edf0fd;
    ul {
        margin: 0;
        padding: 0;
        list-style: none;
    }
    li {
        display: list-item;
        text-align: -webkit-match-parent;
        unicode-bidi: isolate;
    }
    .contentmenu-item {
        font-size: 14px;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        color: #606266;
        height: 34px;
        line-height: 34px;
        box-sizing: border-box;
        cursor: pointer;
        &:hover {
            background-color: #f5f7fa;
        }
    }
    ::v-deep(.moon-hierarchy-node-root) {
        .moon-hierarchy-rect {
            fill: #003bc1;
        }
    }
    ::v-deep(.moon-hierarchy-link) {
        stroke: #1961f5;
        stroke-opacity: 1;
        stroke-width: 1.3;
    }
    ::v-deep(.moon-hierarchy-node) {
        &.moon-hierarchy-node-expend:not(.moon-hierarchy-node-root):not(.active-node) {
            .moon-hierarchy-text {
                fill: rgb(51, 51, 51);
            }
        }
        &.deep-1-node:not(.active-node) {
            .moon-hierarchy-rect {
                fill: #0044fe !important;
            }
            .moon-hierarchy-text {
                fill: #fff !important;
            }
        }
        &.active-node {
            &:not(.moon-hierarchy-node-root) {
                .moon-hierarchy-rect {
                    fill: #003bc1;
                }
                .moon-hierarchy-text {
                    fill: #fff;
                }
            }
        }
        .moon-hierarchy-plus {
            stroke: #1961f5;
            &:hover {
                circle {
                    fill: #5984f1;
                }
                line {
                    stroke: #fff;
                }
            }
        }
    }
    .contentmenu-item {
        font-size: 14px;
        padding: 0 20px;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        color: #606266;
        height: 34px;
        line-height: 34px;
        box-sizing: border-box;
        cursor: pointer;
        &:hover {
            background-color: #f5f7fa;
        }
    }
}
.button-group {
    display: flex;
    gap: 10px;
}
.pannel {
    left: 0;
    top: 0;
    padding: 10px;
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    background-color: rgba(250, 250, 250, 0.5);
    label {
        cursor: pointer;
    }
    .item {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        border-top: 1px solid;
        div {
            padding: 5px;
        }
    }
}
.document {
    position: absolute;
    right: 10px;
    display: flex;
    gap: 20px;
}
.contextmenu {
    background-color: antiquewhite;
    width: 100%;
    height: 100%;
    background-color: #fff;
    padding: 5px;
    border-radius: 8px;
    box-sizing: border-box;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
}
</style>
