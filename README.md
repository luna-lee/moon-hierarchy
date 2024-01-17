# moon-hierarchy

### 作者：闰月飞鸟；时间：2024 年 01 月 15 日 13:45:02

### 预览地址：https://www.1724956493.top/demo/html/d3/hierarchy/#/

### 开发目的

-   使用 d3 开发层级数据展示图。且支持各种自定义功能。

### 安装 npm i moon-hierarchy -S

### vue 文件中使用

```javascript
- import hierarchy from 'moon-hierarchy';
- import 'moon-hierarchy/dist/moon-hierarchy.css';
  components: {  hierarchy  }
```

### Props

| 参数             | 说明                                                                       | 类型             | 可选值  | 默认值                               |
| ---------------- | -------------------------------------------------------------------------- | ---------------- | ------- | ------------------------------------ |
| width            | svg 宽度                                                                   | Number           | -       | 1300                                 |
| height           | svg 高度                                                                   | Number           | -       | 800                                  |
| mode             | 渲染模式：水平方向，垂直方向                                               | String           | v,h     | h                                    |
| layout           | 布局：水平方向-左右，右左，蝴蝶，垂直->上下，下上，蝴蝶                    | String           | -       | tb/bt/bf, lr/rl/bf                   |
| limit            | 水平模式，子节点最大展示数，多余的出收起按钮 ，-1 时全部展出               | Number           | -1；1+  | 3                                    |
| treeData         | 扁平化树数据                                                               | Array            | -       | []                                   |
| treeOptions      | 树数据选项                                                                 | Object           | -       | { id: 'id',pId: 'pId',name: 'name',} |
| defaultOpenLevel | 默认展开层级，-1 时全部展开                                                | Number           | -1 ，1+ | 2                                    |
| negativeIds      | 蝴蝶模型，指定负向数据对应的 id，必须是根节点的直接子节点                  | Array            | -       | []                                   |
| listener         | 节点监听 ，详情见下方说明                                                  | Object           | -       | {}                                   |
| config           | 配置节点连线，详情见下方说明                                               | Object           | -       | {}                                   |
| canExpendFold    | 子节点是否可以通过点击，展开和收缩 ,函数接受当前节点数据，返回一个 boolean | Boolean,Function | -       | true                                 |
| expendShape      | 指定点击展开的元素，可以是 id，css 或元素,默认整个节点                     | string           | -       | -                                    |
| foldShape        | 指定点击闭合的元素，可以是 id，css 或元素 ,默认整个节点                    | string           | -       | -                                    |

### Props config

| 参数  | 说明     |
| ----- | -------- |
| node  | 节点配置 |
| arrow | 箭头配置 |
| link  | 连线配置 |
| zoom  | 缩放配置 |

### node 配置

| 参数       | 说明                           | 默认值     |
| ---------- | ------------------------------ | ---------- |
| padding    | 内容区域到边框的距离，详情见下 | h:15,v:10  |
| nodeWidth  | 节点宽度                       | h:60,v:168 |
| nodeHeight | 节点高度                       | h:-,v:68   |
| separation | 节点间距                       | 1.5        |
| rect       | 矩形配置                       | -          |
| text       | 文本配置                       | -          |
| plus       | 折叠图标配置                   | -          |
| exShaps    | 自定义图型配置,                | () => []   |

### padding

-   可以是数字，数组，函数， 函数时接受一个当前节点数据的参数，动态返回一个数组

<!-- 数据类型 -->

```javascript
type=[number,number,number,number]|number|(d)=>{return [number,number,number,number]}
```

### rect 默认组件

<!-- 数据类型 -->

```javascript
{
  attrs:object,
  show:boolean
}
```

| 参数  | 说明                                               | 默认值                                                                               |
| ----- | -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| attrs | 组件样式配置                                       | { attrs:{stroke: '#D4B106',fill: 'rgba(0,0,0,0)','stroke-width': '0.5',} ,show:true} |
| show  | 是否显示，设置为 false 后可以通过 exShaps 自己指定 | true                                                                                 |

### text 默认组件

<!-- 数据类型 -->

```javascript
{
  attrs:object,
  show:boolean
}
```

| 参数  | 说明                                               | 默认值                                                                                                               |
| ----- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| attrs | 组件配置                                           | v:{font-size:16,line-height:10} h:{font-size:10} fill: d =>d.data.children ? 'rgb(18, 139, 237)' : 'rgb(51, 51, 51)' |
| show  | 是否显示，设置为 false 后可以通过 exShaps 自己指定 | true                                                                                                                 |

### plus 默认组件

<!-- 数据类型 -->

```javascript
{
  attrs:object,
  show:boolean
}
```

| 参数  | 说明                                               | 默认值                                                                                      |
| ----- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| attrs | 组件配置                                           | { r: v:10;h:6,stroke: 'rgb(153, 153, 153)', fill: ' rgb(234, 242, 255)', 'stroke-width': 1} |
| show  | 是否显示，设置为 false 后可以通过 exShaps 自己指定 | true                                                                                        |

### exShaps 图形配置

-   一个函数，返回一个图形数组。参数为节点所有配置信息 nodeconfig
-   每个图形，若指定了 class ，会在每次更新时触发整个节点的重新渲染。这在动态设置属性时很有用。
-   图形嵌套，通过指定 children 实现
-   具体配置如下：

```javascript
exShaps = (nodeconfig) => [
    {
        name: 'g',
        // 属性配置
        attrs: {
            stroke: 'rgb(153, 153, 153)',
            fill: 'rgb(234, 242, 255)',
            'stroke-width': 1
        },
        // 链式函数配置。如text
        compose: {
            text(d) {
                return d.name;
            }
        },
        // 监听事件配置。
        on: {
            click(e, d) {}
        },
        children: [
            {
                name: 'circle',
                attrs: {
                    r: 20
                }
            }
        ]
    }
];
```

### arrow 箭头配置

<!-- 数据类型 -->

```javascript
{
  attrs:object,
  path:string
}
```

| 参数  | 说明             | 默认值                                                                                                                             |
| ----- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| attrs | 箭头 marker 配置 | { viewBox: '0 0 10 10', refX: '10', refY: '5', markerWidth: '6', markerHeight: '6', fill: '#128BED', orient: 'auto-start-reverse'} |
| path  | 箭头路径配置     | ’M 0 0 L 10 5 L 0 10 z‘                                                                                                            |

### link 连线配置

<!-- 数据类型 -->

```javascript
{
  [string]:any
}
```

| 参数 | 说明         | 默认值                                                                         |
| ---- | ------------ | ------------------------------------------------------------------------------ |
| link | 路径样式配置 | { stroke: '#D8D8D8', fill: 'none', 'stroke-opacity': '1', 'stroke-width': '1'} |

### zoom 缩放配置

<!-- 数据类型 -->

```javascript
{
  defaultScale:number,
  scaleRange:[number,number]
}
```

| 参数         | 说明       | 默认值  |
| ------------ | ---------- | ------- |
| defaultScale | 默认缩放值 | 1       |
| scaleRange   | 可缩放范围 | [0.2,2] |

### listener 节点监听

| 名称               | 说明                                                   | 参数                      |
| ------------------ | ------------------------------------------------------ | ------------------------- |
| clickFetchChildren | 点击后异步加载子节点。父节点上需要有\_hasChildren 标记 | d:当前节点源数据信息      |
| click              | 鼠标事件                                               | e:鼠标信息,d:当前节点信息 |
| mouseover          | 鼠标事件                                               | e:鼠标信息,d:当前节点信息 |
| mouseout           | 鼠标事件                                               | e:鼠标信息,d:当前节点信息 |

# Demo

```javascript 
<template>
    <div>
        <div class="pannel">
            <div>
                <input type="radio" id="h" value="h" v-model="mode" />
                <label for="h">水平模式</label>
                <input type="radio" id="v" value="v" v-model="mode" />
                <label for="v">垂直模式</label>
            </div>
            <div v-if="mode == 'h'">
                <input type="radio" id="h-lr" value="lr" v-model="layout" />
                <label for="h-lr">左-右布局</label>
                <input type="radio" id="h-rl" value="rl" v-model="layout" />
                <label for="h-rl">右-左布局</label>
                <input type="radio" id="h-bf" value="bf" v-model="layout" />
                <label for="h-bf">蝴蝶布局</label>
            </div>
            <div v-if="mode == 'v'">
                <input type="radio" id="tb" value="tb" v-model="layout" />
                <label for="tb">上-下布局</label>
                <input type="radio" id="bt" value="bt" v-model="layout" />
                <label for="bt">下-上布局</label>
                <input type="radio" id="v-bf" value="bf" v-model="layout" />
                <label for="v-bf">蝴蝶布局</label>
            </div>
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
import hierarchy from 'moon-hierarchy';
import 'moon-hierarchy/dist/moon-hierarchy.css';
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
        fetch('https://www.1724956493.top/files/d3335980e04011ed91b4f7437d34c747/dataTree.js')
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
                node: {}
            },
            listener: {
                clickFetchChildren: (d) => {
                    return new Promise((r) => {
                        setTimeout(() => {
                            d.children = [
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
                                }
                            ];
                            r();
                        }, 2000);
                    });
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
}
</style>

```
