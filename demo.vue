<template>
    <div>
        <div class="pannel">
            <div>
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
            <router-link to="/md-view" target="_blank">文档</router-link>
            <a href="https://github.com/luna-lee/moon-hierarchy" target="_blank">github地址</a>
        </div>
        <hierarchy
            :mode="mode"
            :treeData="treeData"
            :treeOptions="{ id: 'code', pId: 'pcode' }"
            :layout="layout"
            :negativeIds="['qydak', 'root1', 'root2', 'root3']"
            :listener="listener"
            :config="config"
            :width="width"
            :height="height"
        ></hierarchy>
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
            mode: 'h',
            layout: 'bf',
            treeData: [],
            width: 0,
            height: 0,
            config: {
                node: {},
                arrow: {
                    show: false
                }
            },
            listener: {
                clickFetchChildren: (data, node, d3) => {
                    console.log(data, node, d3);
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
                click(e, d, node, d3) {
                    // console.log(e, d, node, d3);
                }
            }
        };
    },
    watch: {},
    computed: {},
    methods: {
        setWidthHeight() {
            this.width = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - 10;
            this.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 30;
        }
    }
};
</script>
<style lang="scss">
.pannel {
    position: absolute;
    label {
        cursor: pointer;
    }
    .item {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
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
</style>
