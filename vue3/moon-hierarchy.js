import { cloneDeep, flattenDeep, intersection, maxBy } from "lodash-es";
import * as d3 from "d3";
import { openBlock, createElementBlock, withDirectives, createElementVNode, renderSlot, vShow, resolveComponent, normalizeClass, normalizeStyle, createBlock, mergeProps, withCtx } from "vue";
const urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let nanoid = (size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size |= 0));
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
};
const isType = (obj, type) => {
  if (typeof type === "string")
    return Object.prototype.toString.call(obj) == `[object ${type}]`;
  if (Array.isArray(type))
    return type.some(
      (t) => Object.prototype.toString.call(obj) == `[object ${t}]`
    );
};
const getUUID = (prefix = "uuid") => {
  return prefix + nanoid();
};
const flatToTree = (source, id = "id", pId = "pId", children = "children", deepClone = true) => {
  if (!isType(source, "Array")) {
    console.error("\u6570\u636E\u6E90\u5FC5\u987B\u662F\u6570\u7EC4");
    return;
  }
  let flatData = deepClone ? cloneDeep(source) : source.map((v) => {
    delete v.children;
    delete v.track;
    delete v.trigger;
    return v;
  });
  try {
    let treeData = flatData.reduce((arr, item) => {
      if (!item.hasOwnProperty(id))
        throw `${JSON.stringify(
          item
        )}\u6811\u5F62\u7ED3\u6784\u6570\u636E\u4E0D\u51C6\u786E,\u6570\u636E\u9879\u4E2D\u6CA1\u6709\u6307\u5B9A\u7684id:${id}`;
      item[children] = item[children] || [];
      item.track = item.track || [item[id]];
      item.trigger = item.trigger || [];
      let parent = flatData.find((node) => node[id] == item[pId]);
      if (!parent)
        arr.push(item);
      else {
        parent.track = parent.track || [parent[id]];
        item.track.push(parent.track);
        parent.trigger = parent.trigger || [];
        parent.trigger.push(item[id]);
        parent.trigger.push(item.trigger);
        parent[children] = parent[children] ? [...parent[children], item] : [item];
      }
      return arr;
    }, []);
    let leafs = [];
    let objById = flatData.reduce((obj, item) => {
      item.trigger = flattenDeep(item.trigger);
      item.track = flattenDeep(item.track).reverse();
      item.level = item.track.length;
      obj[item[id]] = item;
      if (!item[children].length)
        leafs.push(item);
      return obj;
    }, {});
    return {
      treeData,
      leafs,
      objById,
      flatData
    };
  } catch (error) {
    console.error(error);
    return {
      treeData: [],
      leafs: [],
      objById: {},
      flatData: []
    };
  }
};
const arrayRemoveItem = (arr, fun) => {
  if (isType(arr, "Array") && isType(fun, "Function")) {
    let stay = arr.filter((v, i) => {
      return !fun(v, i);
    });
    arr.splice(0, arr.length);
    stay.forEach((v) => {
      arr.push(v);
    });
  } else
    throw "arrayRemoveItem \u53C2\u6570\u7C7B\u578B\u4E0D\u6B63\u786E\uFF0Carr\u5FC5\u987B\u662F\u6570\u7EC4\uFF0Cfun\u5FC5\u987B\u662F\u51FD\u6570";
};
function isNonEmptyArray$2(arr) {
  return arr && arr.length;
}
const mixins = {
  props: {
    width: {
      type: Number,
      default: 1366
    },
    height: {
      type: Number,
      default: 768
    },
    treeData: {
      type: Array,
      default: () => []
    },
    treeOptions: {
      type: Object,
      default: () => ({})
    },
    defaultOpenLevel: {
      type: Number,
      default: 2
    },
    duration: {
      type: Number,
      default: 400
    },
    negativeIds: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: () => ({})
    },
    canExpendFold: {
      type: [Boolean, Function],
      default: true
    },
    expendShape: {
      type: String
    },
    foldShape: {
      type: String
    }
  },
  mounted() {
    var _a, _b;
    this.currentScale = ((_b = (_a = this.config) == null ? void 0 : _a.zoom) == null ? void 0 : _b.defaultScale) || 1;
    this.drawSvg();
    this.$watch(
      () => [this.treeData, this.layout],
      () => {
        if (isNonEmptyArray$2(this.treeData))
          this.drawContainer();
      },
      {
        deep: true,
        immediate: true
      }
    );
  },
  data() {
    return {
      svg: null,
      zoom: null,
      container: null,
      hierarchyLayoutData: null,
      lastClickNode: null,
      nodesContainer: null,
      linksContainer: null,
      currentScale: 1,
      treeDataFactory: { treeData: [], leafs: [], objById: {}, flatData: [] },
      exceptListener: ["click", "clickFetchChildren", "mouseover", "mouseout"],
      showCustomView: false,
      InnerChangeTreeData: false
    };
  },
  computed: {
    nodeListener() {
      var _a, _b;
      return ((_b = (_a = this.config) == null ? void 0 : _a.node) == null ? void 0 : _b.on) || {};
    },
    symbolKey() {
      return this.inner_treeOptions.id;
    },
    inner_treeOptions() {
      return {
        id: "id",
        pId: "pId",
        name: "name",
        ...this.treeOptions
      };
    },
    centerPosition() {
      return { x: this.width / 2, y: this.height / 2 };
    },
    linkConifg() {
      var _a, _b, _c;
      return {
        fill: "none",
        ...((_a = this.config) == null ? void 0 : _a.link) || {},
        class: "moon-hierarchy-link",
        "marker-end": ((_c = (_b = this.config) == null ? void 0 : _b.arrow) == null ? void 0 : _c.show) === false ? "none" : "url(#moon-hierarchy-arrow)"
      };
    },
    defsNodeConfig() {
      var _a, _b;
      const loadingSize = 16;
      return {
        loadingSize,
        nodeList: [
          {
            name: "marker",
            attrs: {
              viewBox: "0 0 10 10",
              refX: "10",
              refY: "5",
              markerWidth: "6",
              markerHeight: "6",
              orient: "auto-start-reverse",
              ...((_a = this.config.arrow) == null ? void 0 : _a.attrs) || {},
              id: "moon-hierarchy-arrow",
              class: "moon-hierarchy-arrow"
            },
            children: [
              {
                name: "path",
                attrs: {
                  d: ((_b = this.config.arrow) == null ? void 0 : _b.path) || "M 0 0 L 10 5 L 0 10 z"
                }
              }
            ]
          },
          {
            name: "symbol",
            attrs: {
              viewBox: "0 0 1024 1024",
              width: "16",
              height: "16",
              id: "loading"
            },
            children: [
              {
                name: "path",
                attrs: {
                  d: "M475.428571 97.52381h73.142858v219.428571h-73.142858z m0 609.523809h73.142858v219.428571h-73.142858zM926.47619 475.428571v73.142858h-219.428571v-73.142858z m-609.523809 0v73.142858H97.52381v-73.142858zM779.215238 193.072762l51.712 51.687619-155.136 155.184762-51.736381-51.736381zM348.208762 624.054857l51.736381 51.736381-155.160381 155.136-51.712-51.687619zM193.097143 244.784762l51.687619-51.712 155.184762 155.136-51.736381 51.736381z m430.982095 431.006476l51.736381-51.736381 155.136 155.160381-51.687619 51.712z"
                }
              }
            ]
          }
        ]
      };
    }
  },
  methods: {
    formatToArray(target) {
      if (target) {
        if (Array.isArray(target))
          return target;
        else
          return [target];
      } else
        return [];
    },
    initTreeData() {
      this.treeDataFactory = flatToTree(
        this.treeData,
        this.inner_treeOptions.id,
        this.inner_treeOptions.pId
      );
      let removedId = [];
      if (this.treeDataFactory.treeData.length > 1) {
        this.treeDataFactory.treeData.slice(1).forEach((item) => {
          removedId.push(item[this.symbolKey], ...item.trigger);
        });
      }
      arrayRemoveItem(this.treeDataFactory.flatData, (item) => {
        return removedId.includes(item[this.symbolKey]);
      });
      removedId.forEach((id) => {
        delete this.treeDataFactory.objById[id];
      });
      this.setSign();
    },
    createSvg() {
      this.svg = d3.create("svg").attr("class", "moon-hierarchy-svg").attr("width", this.width).attr("height", this.height).attr("cursor", "move");
    },
    createContainDom() {
      this.container = this.svg.append("g").attr("class", "moon-hierarchy-container").attr("font-family", "sans-serif").attr(
        "transform",
        `translate(${this.width / 2},${this.height / 2}) scale(1)`
      );
    },
    drawSvg() {
      this.$watch(
        () => [this.width, this.height],
        () => {
          var _a;
          if (this.svg) {
            this.svg.attr("width", this.width).attr("height", this.height);
            if (((_a = this.treeData) == null ? void 0 : _a.length) && this.treeLayout)
              this.moveToCenter();
          } else
            this.createSvg();
        },
        {
          deep: true,
          immediate: true
        }
      );
      this.addDefs();
      this.$refs.svg.append(this.svg.node());
    },
    drawContainer() {
      if (this.InnerChangeTreeData) {
        this.InnerChangeTreeData = false;
        return;
      }
      this.container && this.container.remove();
      Object.assign(this.$data, this.$options.data(), { svg: this.svg });
      this.createContainDom();
      this.initTreeData();
      this.defaultExpendLevel();
      this.drawView();
      this.initZoom();
      this.moveToCenter();
      this.$emit("draw-done", {
        svg: this.svg,
        container: this.container
      });
    },
    defaultExpendLevel() {
      if (this.defaultOpenLevel > 0)
        this.treeDataFactory.flatData.forEach((item) => {
          if (item.level >= this.defaultOpenLevel) {
            item._children = item.children;
            item.children = null;
          }
        });
    },
    setLayoutData() {
      let root = this.treeDataFactory.treeData[0];
      this.hierarchyLayoutData = this.treeLayout(d3.hierarchy(root));
      if (this.layout == "bf" && root.children) {
        let positive = root.children.filter((v) => v._sign == 1);
        let negative = root.children.filter((v) => v._sign == -1);
        let _positive = this.treeLayout(
          d3.hierarchy({ ...root, children: positive })
        );
        let _negative = this.treeLayout(
          d3.hierarchy({ ...root, children: negative })
        );
        this.hierarchyLayoutData.children = [
          ...(_positive == null ? void 0 : _positive.children) || [],
          ...(_negative == null ? void 0 : _negative.children) || []
        ];
      }
    },
    setNodeClassAttr(selectionNode) {
      var _a;
      const customNodeAttrs = ((_a = this.config.node) == null ? void 0 : _a.attrs) || {};
      selectionNode.attr("class", function(d) {
        const currentClass = d3.select(this).attr("class") || "";
        const classList = currentClass.split(" ");
        classList.push("moon-hierarchy-node");
        if (d.data.track.length == 1)
          classList.push("moon-hierarchy-node-root");
        if (typeof d.data._isexpend == "boolean")
          classList.push("moon-hierarchy-node-limit-button");
        if (isNonEmptyArray$2(d.data.children))
          classList.push("moon-hierarchy-node-expend");
        else
          arrayRemoveItem(
            classList,
            (item) => item == "moon-hierarchy-node-expend"
          );
        if (isNonEmptyArray$2(d.data.children) || isNonEmptyArray$2(d.data._children) || d.data._hasChildren)
          classList.push("moon-hierarchy-node-haschildren");
        let classContent = customNodeAttrs.class;
        if (classContent) {
          if (typeof classContent == "function") {
            classList.push(classContent(d) || "");
          }
          if (typeof classContent == "string")
            return classList.push(classContent);
        }
        return [...new Set(classList)].join(" ");
      });
    },
    setNodeDefaultAttr(selectionNode) {
      var _a;
      const getNodeId = this.getNodeId;
      const symbolKey = this.symbolKey;
      const lastClickNode = this.lastClickNode;
      const customNodeAttrs = ((_a = this.config.node) == null ? void 0 : _a.attrs) || {};
      const nodeDefaultAttrs = {
        cursor: "pointer",
        ...customNodeAttrs,
        id: (d) => getNodeId(d.data[symbolKey]),
        transform: (d) => {
          return this.onNodeFoldTranslate(lastClickNode, d);
        }
      };
      Object.keys(nodeDefaultAttrs).reduce((_, attr) => {
        return _.attr(attr, nodeDefaultAttrs[attr]);
      }, selectionNode);
      this.setNodeClassAttr(selectionNode);
    },
    addNode(nodeList) {
      if (!this.nodesContainer)
        this.nodesContainer = this.container.append("g").attr("stroke-linejoin", "round").attr("stroke-width", 3).attr("class", "moon-hierarchy-nodes");
      const selectionNode = this.nodesContainer.selectAll().data(nodeList).join("g").on("click", (_, d) => {
        var _a, _b;
        _.stopPropagation();
        this.onNodeClick(d);
        if (typeof d.data._isexpend == "boolean")
          return;
        const id = this.getNodeId(d.data[this.symbolKey]);
        const node = this.svg.select(`#${id}`);
        (_b = (_a = this.nodeListener)["click"]) == null ? void 0 : _b.call(_a, _, d, node, this.svg);
      }).on("mouseover", (_, d) => {
        var _a, _b;
        if (typeof d.data._isexpend == "boolean")
          return;
        this.onNodeMouseOver(d);
        const id = this.getNodeId(d.data[this.symbolKey]);
        const node = this.svg.select(`#${id}`);
        (_b = (_a = this.nodeListener)["mouseover"]) == null ? void 0 : _b.call(_a, _, d, node, this.svg);
      }).on("mouseout", (_, d) => {
        var _a, _b;
        if (typeof d.data._isexpend == "boolean")
          return;
        this.onNodeMouseOut(d);
        const id = this.getNodeId(d.data[this.symbolKey]);
        const node = this.svg.select(`#${id}`);
        (_b = (_a = this.nodeListener)["mouseout"]) == null ? void 0 : _b.call(_a, _, d, node, this.svg);
      });
      this.setNodeDefaultAttr(selectionNode);
      this.addListener(selectionNode, this.nodeListener, this.exceptListener);
      selectionNode.transition().duration(this.duration).attr("transform", (d) => {
        return this.onNodeExpendTranslate(d);
      });
      this.iteratorAddNode(selectionNode, this.nodeConfig.shaps);
      this.addShapEexpendFold(selectionNode);
    },
    updateNodeByData(dataList) {
      dataList = this.formatToArray(dataList);
      let exAttrs = [
        this.inner_treeOptions.id,
        this.inner_treeOptions.pId,
        "children",
        "level",
        "track",
        "trigger"
      ];
      dataList.forEach((data) => {
        let old = this.treeDataFactory.objById[data[this.symbolKey]];
        if (!old) {
          throw `moon-hierarchy\u7EC4\u4EF6\uFF1A\u753B\u5E03\u4E2D\u6CA1\u6709\u5339\u914D\u5230${this.symbolKey}=${data[this.symbolKey]}\u7684\u8282\u70B9`;
        }
        let backup = Object.keys(old).reduce((obj, key) => {
          if (exAttrs.includes(key) || key.startsWith("_"))
            obj[key] = old[key];
          return obj;
        }, {});
        Object.assign(old, data, backup);
        this.InnerChangeTreeData = true;
        let sourceData = this.treeData.find(
          (v) => v[this.symbolKey] == data[this.symbolKey]
        );
        Object.keys(sourceData).forEach((key) => {
          sourceData[key] = old[key];
        });
      });
      this.drawView();
    },
    updateNode(nodeList) {
      for (let i = 0; i < nodeList.length; i++) {
        let node = nodeList[i];
        const id = this.getNodeId(node.data[this.symbolKey]);
        const selectionNode = this.svg.select(`#${id}`);
        this.addListener(
          selectionNode,
          this.nodeListener,
          this.exceptListener,
          node
        );
        selectionNode.on("click", (_) => {
          var _a, _b;
          _.stopPropagation();
          this.onNodeClick(node);
          if (typeof node.data._isexpend == "boolean")
            return;
          (_b = (_a = this.nodeListener)["click"]) == null ? void 0 : _b.call(_a, _, node, selectionNode, this.svg);
        }).on("mouseover", (_) => {
          var _a, _b;
          if (typeof node.data._isexpend == "boolean")
            return;
          this.onNodeMouseOver(node);
          (_b = (_a = this.nodeListener)["mouseover"]) == null ? void 0 : _b.call(_a, _, node, selectionNode, this.svg);
        }).on("mouseout", (_) => {
          var _a, _b;
          if (typeof node.data._isexpend == "boolean")
            return;
          this.onNodeMouseOut(node);
          (_b = (_a = this.nodeListener)["mouseout"]) == null ? void 0 : _b.call(_a, _, node, selectionNode, this.svg);
        }).transition().duration(this.duration).attr("transform", () => {
          return this.onNodeExpendTranslate(node);
        });
        selectionNode.selectAll("*").remove();
        this.setNodeClassAttr(selectionNode);
        this.iteratorAddNode(selectionNode, this.nodeConfig.shaps);
        this.addShapEexpendFold(selectionNode, node);
      }
    },
    removeNode(targetNodeId, redraw = true, canRemoveExpendNode = false) {
      if (!targetNodeId)
        throw `moon-hierarchy\u7EC4\u4EF6\uFF1A\u8BF7\u4F20\u5165\u76EE\u6807\u8282\u70B9\u6570\u636E\u4E2D${this.symbolKey}\u7684\u503C`;
      let rootId = this.hierarchyLayoutData.data[this.symbolKey];
      if (targetNodeId == rootId) {
        throw `moon-hierarchy\u7EC4\u4EF6\uFF1A\u6839\u8282\u70B9\u4E0D\u80FD\u5220\u9664`;
      }
      const sourceData = this.treeDataFactory.objById[targetNodeId];
      if (!sourceData) {
        throw `moon-hierarchy\u7EC4\u4EF6\uFF1A\u753B\u5E03\u4E2D\u6CA1\u6709\u5339\u914D\u5230${this.symbolKey}=${targetNodeId}\u7684\u8282\u70B9`;
      }
      if (typeof sourceData._isexpend == "boolean" && !canRemoveExpendNode) {
        throw `moon-hierarchy\u7EC4\u4EF6\uFF1A\u5C55\u5F00/\u6536\u8D77\u8282\u70B9\u4E0D\u80FD\u624B\u52A8\u5220\u9664\uFF01`;
      }
      let toRemoveId = [...sourceData.trigger, targetNodeId];
      for (let i = 0; i < toRemoveId.length; i++) {
        let n = this.treeDataFactory.objById[toRemoveId[i]];
        this.svg.select(`#${this.getNodeId(n[this.symbolKey])}`).remove();
        const id = this.getLinkId(
          n[this.inner_treeOptions.pId],
          n[this.symbolKey]
        );
        this.svg.select(`#${id}`).remove();
      }
      let parentNode = this.treeDataFactory.objById[sourceData[this.inner_treeOptions.pId]];
      if (parentNode) {
        if (parentNode._exChildren) {
          let index2 = parentNode._exChildren.findIndex(
            (v) => v[this.symbolKey] == targetNodeId
          );
          if (index2 >= 0)
            parentNode._exChildren.splice(index2, 1);
        }
        const pChildren = (childrenName) => {
          let arr = parentNode[childrenName];
          if (arr) {
            arr.splice(
              arr.findIndex((v) => v[this.symbolKey] == targetNodeId),
              1
            );
            if (this.limit > 0 && parentNode._exChildren) {
              let _sameList = parentNode._exChildren.filter(
                (v) => v._sign == sourceData._sign
              );
              let sameList = arr.filter(
                (v) => v._sign == sourceData._sign && typeof v._isexpend != "boolean"
              );
              if (sameList.length < this.limit) {
                let insert = _sameList.slice(0, this.limit - sameList.length);
                let expendNodeIndex = arr.findIndex(
                  (v) => typeof v._isexpend == "boolean" && v._sign == sourceData._sign
                );
                arr.splice(expendNodeIndex, 0, ...insert);
                arrayRemoveItem(parentNode._exChildren, (item) => {
                  return insert.find(
                    (v) => v[this.symbolKey] == item[this.symbolKey]
                  );
                });
              }
              _sameList = parentNode._exChildren.filter(
                (v) => v._sign == sourceData._sign
              );
              sameList = arr.filter(
                (v) => v._sign == sourceData._sign && typeof v._isexpend != "boolean"
              );
              if (sameList.length + _sameList.length <= this.limit) {
                let expendNode = arr.find(
                  (v) => typeof v._isexpend == "boolean" && v._sign == sourceData._sign
                );
                if (expendNode)
                  this.removeNode(expendNode[this.symbolKey], false, true);
              }
            }
          }
        };
        pChildren("children");
        pChildren("_children");
      }
      arrayRemoveItem(this.treeDataFactory.flatData, (item) => {
        return [...sourceData.trigger, targetNodeId].includes(
          item[this.symbolKey]
        );
      });
      [...sourceData.trigger, targetNodeId].forEach((id) => {
        delete this.treeDataFactory.objById[id];
      });
      parentNode.track.map((id) => {
        arrayRemoveItem(this.treeDataFactory.objById[id].trigger, (_id) => {
          return [...sourceData.trigger, targetNodeId].includes(_id);
        });
      });
      this.InnerChangeTreeData = true;
      arrayRemoveItem(this.treeData, (item) => {
        return [...sourceData.trigger, targetNodeId].includes(
          item[this.symbolKey]
        );
      });
      if (redraw)
        this.drawView();
    },
    removeNodeById(ids) {
      ids = this.formatToArray(ids);
      ids.forEach((id) => {
        this.removeNode(id, false);
      });
      this.drawView();
    },
    addShapEexpendFold(selectionNode, qt) {
      if (this.expendShape != this.foldShape) {
        if (this.expendShape) {
          selectionNode.select(this.expendShape).on("click.customEvent", (e, d) => {
            e.stopPropagation();
            this.onNodeExpendOrFold(qt || d, true);
          });
        }
        if (this.foldShape) {
          selectionNode.select(this.foldShape).on("click.customEvent", (e, d) => {
            e.stopPropagation();
            this.onNodeExpendOrFold(qt || d, false);
          });
        }
      } else {
        if (this.expendShape) {
          selectionNode.select(this.expendShape).on("click.customEvent", (e, d) => {
            e.stopPropagation();
            const id = qt ? qt.data[this.symbolKey] : d.data[this.symbolKey];
            const sourceData = this.treeDataFactory.objById[id];
            this.onNodeExpendOrFold(
              qt || d,
              !isNonEmptyArray$2(sourceData.children)
            );
          });
        }
      }
    },
    addListener(selectionNode, listener = {}, except = [], qd) {
      Object.keys(listener).forEach((key) => {
        if (!except.includes(key)) {
          let svg = this.svg;
          selectionNode.on(key, function(e, d) {
            if (qd)
              d = qd;
            if (typeof d.data._isexpend == "boolean")
              return;
            listener[key](e, d, this, svg);
          });
        }
      });
    },
    addOrUpdateNode() {
      const nodeList = this.hierarchyLayoutData.descendants();
      let addList = [];
      let updateList = [];
      for (let i = 0; i < nodeList.length; i++) {
        let item = nodeList[i];
        const id = this.getNodeId(item.data[this.symbolKey]);
        const selectionNode = this.svg.select(`#${id}`);
        if (selectionNode.node()) {
          updateList.push(item);
        } else {
          addList.push(item);
        }
      }
      this.addNode(addList);
      this.updateNode(updateList);
    },
    async onNodeClick(d) {
      this.lastClickNode = d;
      const symbolKey = this.symbolKey;
      const sourceData = this.treeDataFactory.objById[this.lastClickNode.data[symbolKey]];
      if (isNonEmptyArray$2(sourceData.children)) {
        if (!this.foldShape)
          this.onNodeExpendOrFold(d, false);
      } else if (!this.expendShape)
        this.onNodeExpendOrFold(d, true);
      if (typeof sourceData._isexpend === "boolean") {
        this.onLimitNodeExpendOrFold && this.onLimitNodeExpendOrFold(sourceData);
      }
    },
    async onNodeExpendOrFold(node, expend = false) {
      const symbolKey = this.symbolKey;
      this.lastClickNode = node;
      const sourceData = this.treeDataFactory.objById[this.lastClickNode.data[symbolKey]];
      if (typeof this.canExpendFold == "boolean" && !this.canExpendFold)
        return;
      if (typeof this.canExpendFold == "function" && !this.canExpendFold(sourceData))
        return;
      if (expend) {
        if (isNonEmptyArray$2(sourceData._children)) {
          sourceData.children = sourceData._children;
          sourceData._children = void 0;
        } else {
          if (sourceData._hasChildren) {
            await this.onClickFetchChildren(sourceData);
            this.setLimtNode && this.setLimtNode();
          }
        }
      } else if (isNonEmptyArray$2(sourceData.children)) {
        sourceData._children = sourceData.children;
        sourceData.children = void 0;
      }
      this.drawView();
      let isFold = isNonEmptyArray$2(sourceData._children);
      const afterCalcuNode = this.hierarchyLayoutData.find(
        (n) => n.data[symbolKey] == this.lastClickNode.data[symbolKey]
      );
      if (isFold) {
        this.foldLinksAndNodes(this.lastClickNode, afterCalcuNode);
      }
      this.moveToCenter({
        ...this.nodeToCenterXY(afterCalcuNode),
        d: this.duration
      });
    },
    onNodeMouseOver(node) {
      node.links().forEach((link) => {
        const id = this.getLinkId(
          link.source.data[this.symbolKey],
          link.target.data[this.symbolKey]
        );
        this.svg.select(`#${id}`).classed("moon-hierarchy-node-hover-link", true);
      });
    },
    onNodeMouseOut(node) {
      node.links().forEach((link) => {
        const id = this.getLinkId(
          link.source.data[this.symbolKey],
          link.target.data[this.symbolKey]
        );
        let line = this.svg.select(`#${id}`);
        line.classed("moon-hierarchy-node-hover-link", false);
      });
    },
    addNodeToTargetNode(targetNodeId, childrenList, _sign) {
      var _a;
      if (!targetNodeId)
        throw `moon-hierarchy\u7EC4\u4EF6\uFF1A\u8BF7\u4F20\u5165\u76EE\u6807\u8282\u70B9\u6570\u636E\u4E2D${this.symbolKey}\u7684\u503C`;
      const sourceData = this.treeDataFactory.objById[targetNodeId];
      if (!sourceData) {
        throw `moon-hierarchy\u7EC4\u4EF6\uFF1A\u753B\u5E03\u4E2D\u6CA1\u6709\u5339\u914D\u5230${this.symbolKey}=${targetNodeId}\u7684\u8282\u70B9`;
      }
      if (typeof sourceData._isexpend == "boolean") {
        throw "\u5C55\u5F00/\u6536\u8D77\u8282\u70B9\u4E0D\u80FD\u65B0\u589E\u5B50\u8282\u70B9\uFF01";
      }
      let root = this.treeDataFactory.treeData[0];
      if (targetNodeId == root[this.symbolKey]) {
        if (this.layout == "bf" && [-1, 1].includes(_sign))
          _sign = _sign || sourceData._sign;
        else if (this.layout == "bt" || this.layout == "rl")
          _sign = -1;
        else
          _sign = 1;
      } else
        _sign = sourceData._sign;
      let node = this.hierarchyLayoutData.find(
        (item) => item.data[this.symbolKey] == targetNodeId
      );
      this.lastClickNode = node;
      childrenList = this.formatToArray(childrenList);
      if (childrenList.length) {
        sourceData.track.map((id) => {
          this.treeDataFactory.objById[id].trigger.push(
            ...childrenList.map((v) => v[this.symbolKey])
          );
        });
        let list = childrenList.map((v) => {
          v._sign = _sign;
          v[this.inner_treeOptions.pId] = sourceData[this.symbolKey];
          return v;
        });
        let rootIndex = list.findIndex(
          (v) => v[this.symbolKey] == sourceData[this.symbolKey]
        );
        if (rootIndex != -1)
          list.splice(rootIndex, 1);
        const copySourceData = { ...sourceData };
        copySourceData.children = [];
        list.push(copySourceData);
        let { objById, flatData } = flatToTree(
          list,
          this.symbolKey,
          this.inner_treeOptions.pId
        );
        let sutTree = objById[sourceData[this.symbolKey]].children;
        if ((_a = sourceData._exChildren) == null ? void 0 : _a.length) {
          let children = sourceData.children || sourceData._children;
          let lastExpendNodeIndex = children.findIndex(
            (v) => typeof v._isexpend == "boolean" && v._sign == _sign
          );
          let lastExpendNode = children[lastExpendNodeIndex];
          sourceData._exChildren.push(...sutTree);
          if (lastExpendNode == null ? void 0 : lastExpendNode._isexpend) {
            sourceData.children.splice(lastExpendNodeIndex, 0, ...sutTree);
          }
          if (!lastExpendNode._isexpend) {
            lastExpendNode._isexpend = true;
            children.splice(
              children.indexOf(lastExpendNode),
              0,
              ...node.data._exChildren.filter(
                (v) => v._sign == lastExpendNode._sign
              )
            );
          }
        } else {
          if (sourceData.children) {
            sourceData.children.push(...sutTree);
          } else if (sourceData._children) {
            sourceData._children.push(...sutTree);
          } else
            sourceData.children = sutTree;
        }
        flatData.filter((v) => v[this.symbolKey] != sourceData[this.symbolKey]).forEach((v) => {
          let id = v[this.symbolKey];
          this.treeDataFactory.objById[id] = v;
          this.treeDataFactory.flatData.push(v);
        });
      }
      this.onNodeExpendOrFold(node, true);
      this.InnerChangeTreeData = true;
      this.treeData.push(...childrenList);
    },
    async onClickFetchChildren(sourceData) {
      var _a, _b;
      if (sourceData._hasChildren && !sourceData._loading) {
        try {
          this.setLoadingIcon(sourceData);
          let childrenList = await ((_b = (_a = this.nodeListener)["clickFetchChildren"]) == null ? void 0 : _b.call(
            _a,
            sourceData,
            this.svg.select(`#${this.getNodeId(sourceData[this.symbolKey])}`),
            this.svg
          ));
          childrenList = this.formatToArray(childrenList);
          if (childrenList.length) {
            sourceData.track.map((id) => {
              this.treeDataFactory.objById[id].trigger.push(
                ...childrenList.map((v) => v[this.symbolKey])
              );
            });
            let list = childrenList.map((v) => {
              v._sign = sourceData._sign;
              if (!v[this.inner_treeOptions.pId])
                v[this.inner_treeOptions.pId] = sourceData[this.symbolKey];
              return v;
            });
            let rootIndex = list.findIndex(
              (v) => v[this.symbolKey] == sourceData[this.symbolKey]
            );
            if (rootIndex != -1)
              list.splice(rootIndex, 1);
            list.push(sourceData);
            let { objById, flatData } = flatToTree(
              list,
              this.symbolKey,
              this.inner_treeOptions.pId
            );
            sourceData.children = objById[sourceData[this.symbolKey]].children;
            flatData.filter((v) => v[this.symbolKey] != sourceData[this.symbolKey]).forEach((v) => {
              let id = v[this.symbolKey];
              this.treeDataFactory.objById[id] = v;
              this.treeDataFactory.flatData.push(v);
            });
          }
          this.setLoadingIcon(sourceData, false);
        } catch (error) {
          this.setLoadingIcon(sourceData, false);
          throw error;
        }
      }
    },
    addOrUpdateLinks() {
      const links = this.hierarchyLayoutData.links();
      let addList = [];
      let updateList = [];
      for (let i = 0; i < links.length; i++) {
        let item = links[i];
        const id = this.getLinkId(
          item.source.data[this.symbolKey],
          item.target.data[this.symbolKey]
        );
        const selectionNode = this.svg.select(`#${id}`);
        if (selectionNode.node()) {
          updateList.push(item);
        } else {
          addList.push(item);
        }
      }
      this.addLinks(addList);
      this.updateLinks(updateList);
    },
    foldLinksAndNodes(node, newNode, filter) {
      const getLinkId = this.getLinkId;
      const getNodeId = this.getNodeId;
      const symbolKey = this.symbolKey;
      node.links().forEach((link) => {
        if (typeof filter == "function" && !filter(link)) {
          return;
        }
        const nodeId = getNodeId(link.target.data[symbolKey]);
        const selectionNode = this.svg.select(`#${nodeId}`);
        selectionNode.transition().duration(this.duration).attr("transform", () => {
          return this.onNodeFoldTranslate(newNode, link.target);
        });
        const linkId = getLinkId(
          link.source.data[symbolKey],
          link.target.data[symbolKey]
        );
        const selectionLink = this.svg.select(`#${linkId}`);
        selectionLink.transition().duration(this.duration).attr("transform", () => {
          return this.onNodeFoldTranslate(newNode, link.target);
        }).on("end", () => {
          selectionLink.attr("d", null);
        });
      });
    },
    drawView() {
      this.initLayoutData();
      this.addOrUpdateLinks();
      this.addOrUpdateNode();
      this.updateCustomView();
    },
    addDefs() {
      const defs = this.svg.append("defs");
      this.iteratorAddNode(defs, this.defsNodeConfig.nodeList);
    },
    iteratorAddNode(selectionNode, nodeConfigList) {
      nodeConfigList.forEach((shap) => {
        const selectionShap = selectionNode.append(shap.name);
        this.setAttrByOpt(selectionShap, shap.attrs);
        this.setComposeOpt(selectionShap, shap.compose);
        this.addListener(selectionShap, shap.on);
        if (shap.children)
          this.iteratorAddNode(selectionShap, shap.children);
      });
    },
    moveToCenter(opt) {
      if (!opt) {
        let rootNode = this.hierarchyLayoutData;
        opt = {
          ...this.nodeToCenterXY(rootNode),
          d: this.duration
        };
      }
      let { x, y, d } = opt;
      const inverseScale = 1 / this.currentScale;
      let _x = this.centerPosition.x * inverseScale - x;
      let _y = this.centerPosition.y * inverseScale - y;
      let xw = d3.zoomIdentity.scale(this.currentScale).translate(_x, _y);
      xw.d = d;
      this.svg.call(this.zoom.transform, xw);
    },
    initZoom() {
      var _a, _b;
      let scaleRange = ((_b = (_a = this.config) == null ? void 0 : _a.zoom) == null ? void 0 : _b.scaleRange) || [0.2, 2];
      let zoomEvent = (e) => {
        var _a2, _b2, _c, _d;
        if ((_b2 = (_a2 = this.config) == null ? void 0 : _a2.zoom) == null ? void 0 : _b2.callback) {
          (_d = (_c = this.config) == null ? void 0 : _c.zoom) == null ? void 0 : _d.callback(e);
        }
        let zoom = e.transform;
        this.currentScale = zoom.k;
        this.container.transition().duration(zoom.d).attr(
          "transform",
          `translate(${Number(zoom.x)},${zoom.y}) scale(${zoom.k})`
        );
      };
      this.zoom = d3.zoom().scaleExtent(scaleRange).on("zoom", zoomEvent);
      this.zoom.zoomEvent = zoomEvent;
      this.zoom.scaleRange = scaleRange;
      this.svg.call(this.zoom).on("dblclick.zoom", null);
    },
    pauseZoom() {
      this.zoom.scaleExtent([this.currentScale, this.currentScale]);
    },
    continueZoom() {
      this.zoom.scaleExtent(this.zoom.scaleRange);
    },
    scale(scale) {
      var _a, _b;
      if (typeof scale === "number") {
        this.currentScale = this.currentScale * Math.abs(scale);
        let scaleRange = ((_b = (_a = this.config) == null ? void 0 : _a.zoom) == null ? void 0 : _b.scaleRange) || [0.2, 2];
        if (this.currentScale < scaleRange[0])
          this.currentScale = scaleRange[0];
        if (this.currentScale > scaleRange[1])
          this.currentScale = scaleRange[1];
        this.moveToCenter();
      } else
        throw "\u7F29\u653E\u53C2\u6570\u5FC5\u987B\u6570\u5B57";
    },
    setAttrByOpt(selectionNode, opt = {}) {
      Object.keys(opt).map((key) => {
        selectionNode.attr(key, opt[key]);
      });
    },
    setComposeOpt(selectionNode, opt = {}) {
      Object.keys(opt).reduce((n, key) => {
        if (Array.isArray(opt[key]))
          n[key](...opt[key]);
        else
          n[key](opt[key]);
        return n;
      }, selectionNode);
    },
    getNodeById(id) {
      return {
        data: this.treeDataFactory.objById[id],
        el: this.svg.select(`#${this.getNodeId(id)}`)
      };
    },
    getAllNode() {
      const idList = Object.keys(this.treeDataFactory.objById);
      const nodeList = [];
      for (let i = 0; i < idList.length; i++) {
        const id = idList[i];
        let data = this.treeDataFactory.objById[id];
        if (typeof data._isexpend != "boolean")
          nodeList.push({
            data,
            el: this.svg.select(`#${this.getNodeId(id)}`)
          });
      }
      return nodeList;
    },
    getNodeId(id) {
      return "node-" + id;
    },
    getLinkId(sId, tId) {
      return "link-" + sId + "-" + tId;
    },
    setPaddingFormat(inputValue) {
      let padding = () => [0, 0, 0, 0];
      let paddingValue = inputValue;
      if (typeof paddingValue == "number") {
        padding = () => [
          paddingValue,
          paddingValue,
          paddingValue,
          paddingValue
        ];
      }
      if (Array.isArray(paddingValue)) {
        if (paddingValue.length == 2) {
          padding = () => [
            paddingValue[0],
            paddingValue[1],
            paddingValue[0],
            paddingValue[1]
          ];
        }
        if (paddingValue.length == 4) {
          padding = () => paddingValue;
        }
      }
      if (typeof paddingValue == "function") {
        padding = paddingValue;
      }
      return padding;
    },
    setShapClass(d, sharpName, nodeconfig) {
      let classContent = nodeconfig[sharpName].attrs.class;
      let defaultClass = `moon-hierarchy-${sharpName}`;
      if (typeof classContent == "function")
        return `${defaultClass} ${classContent(d) || ""}`;
      if (typeof classContent == "string" && classContent) {
        return `${defaultClass} ${classContent}`;
      }
      return defaultClass;
    },
    calculateTextWidth(text, fontSize, fontFamily) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = `${fontSize}px ${fontFamily}`;
      const textWidth = context.measureText(text).width;
      return textWidth;
    },
    createOrUpdateForeignObject(attrs) {
      var _a, _b;
      attrs = {
        width: 100,
        height: 50,
        transform_begin: "translate(0,0) scale(0)",
        transform: "translate(0,0) scale(1)",
        ...attrs
      };
      if (!this.foreignObject) {
        this.foreignObject = this.container.append("foreignObject");
      }
      this.showCustomView = true;
      Object.keys(attrs).reduce((_, attr) => {
        if (attr != "transform")
          return _.attr(attr, attrs[attr]);
        else
          return _;
      }, this.foreignObject);
      if (attrs.hasChangeNode)
        this.foreignObject.attr("transform", attrs.transform_begin);
      this.foreignObject.transition().duration(
        attrs.duration || ((_b = (_a = this.config) == null ? void 0 : _a.customView) == null ? void 0 : _b.duration) || this.duration
      ).attr("transform", attrs.transform);
      this.foreignObject.on("click", (e) => e.stopPropagation());
      this.foreignObject.node().append(this.$refs.CoustomView);
    },
    updateCustomView() {
      if (this.foreignObject && this.drawCustomViewLastConfig.d) {
        let item = this.drawCustomViewLastConfig.d;
        const selectionNode = this.svg.select(
          `#${this.getNodeId(item.data[this.symbolKey])}`
        );
        if (selectionNode.node()) {
          let id = this.drawCustomViewLastConfig.d.data[this.symbolKey];
          let node = this.hierarchyLayoutData.find(
            (item2) => item2.data[this.symbolKey] == id
          );
          let { e, width, height, priority } = this.drawCustomViewLastConfig;
          if (node) {
            this.drawCustomView(e, node, width, height, priority);
          } else {
            this.hiddenCustomView();
          }
        } else {
          this.hiddenCustomView();
        }
      }
    },
    hiddenCustomView() {
      this.showCustomView = false;
      this.drawCustomViewLastConfig = {};
      if (this.foreignObject) {
        this.foreignObject.remove();
        this.foreignObject = null;
      }
    },
    expendAllNode() {
      this.lastClickNode = this.hierarchyLayoutData;
      this.treeDataFactory.flatData.forEach((item) => {
        var _a;
        if (item._children) {
          item.children = item._children;
          item._children = null;
        }
        if (typeof item._isexpend == "boolean" && item._isexpend === false) {
          item._isexpend = true;
          let p = this.treeDataFactory.objById[item[this.inner_treeOptions.pId]];
          let children = p.children || p._children;
          if ((_a = p._exChildren) == null ? void 0 : _a.length) {
            let c = p._exChildren.filter((v) => v._sign == item._sign);
            children.splice(children.indexOf(item), 0, ...c);
          }
        }
      });
      this.drawView();
    },
    foldAllNode() {
      let foldTargetNode = [];
      this.treeDataFactory.flatData.forEach((item) => {
        let obj = {};
        if (this.defaultOpenLevel > 0) {
          if (item.level >= this.defaultOpenLevel) {
            if (item.children) {
              item._children = item.children;
              item.children = null;
            }
          }
          if (item.level == this.defaultOpenLevel) {
            let node = this.hierarchyLayoutData.find(
              (v) => v.data[this.symbolKey] == item[this.symbolKey]
            );
            obj.node = node;
          }
        }
        if (typeof item._isexpend == "boolean" && item._isexpend) {
          item._isexpend = false;
          let p = this.treeDataFactory.objById[item[this.inner_treeOptions.pId]];
          let children = p.children || p._children;
          let exChildrenIds = p._exChildren.filter((v) => v._sign == item._sign).map((v) => v[this.symbolKey]);
          if (item.level == this.defaultOpenLevel) {
            obj.parentNode = this.hierarchyLayoutData.find(
              (v) => v.data[this.symbolKey] == p[this.symbolKey]
            );
            obj.exChildrenIds = exChildrenIds;
          }
          arrayRemoveItem(
            children,
            (v) => exChildrenIds.includes(v[this.symbolKey])
          );
        }
        if (obj.node)
          foldTargetNode.push(obj);
      });
      this.drawView();
      if (foldTargetNode.length)
        foldTargetNode.forEach(
          ({ node: oldNode, parentNode, exChildrenIds }) => {
            let node = this.hierarchyLayoutData.find(
              (v) => v.data[this.symbolKey] == oldNode.data[this.symbolKey]
            );
            this.foldLinksAndNodes(oldNode, node);
            if (parentNode && exChildrenIds) {
              node = this.hierarchyLayoutData.find(
                (v) => v.data[this.symbolKey] == parentNode.data[this.symbolKey]
              );
              this.foldLinksAndNodes(parentNode, node, (link) => {
                return exChildrenIds.includes(link.target.data[this.symbolKey]);
              });
            }
          }
        );
      else
        this.foldLinksAndNodes(
          this.hierarchyLayoutData,
          this.hierarchyLayoutData
        );
      this.moveToCenter();
    },
    expendToNode(sourceData) {
      sourceData.track.forEach((id, index2) => {
        var _a;
        if (id != sourceData[this.symbolKey]) {
          let node = this.treeDataFactory.objById[id];
          if (!this.lastClickNode) {
            if (isNonEmptyArray$2(node._children)) {
              this.lastClickNode = this.hierarchyLayoutData.find(
                (item) => item.data[this.symbolKey] == id
              );
            }
          }
          if (isNonEmptyArray$2(node._children)) {
            node.children = node._children;
            node._children = void 0;
          }
          if (index2 < sourceData.track.length - 1) {
            let nextId = sourceData.track[index2 + 1];
            let children = node.children || node._children;
            let ifInExChildren = (_a = node == null ? void 0 : node._exChildren) == null ? void 0 : _a.find(
              (v) => v[this.symbolKey] == nextId
            );
            if (ifInExChildren) {
              let expendNode = children.find(
                (v) => typeof v._isexpend == "boolean" && v._sign == ifInExChildren._sign
              );
              if (!expendNode._isexpend) {
                expendNode._isexpend = true;
                children.splice(
                  children.indexOf(expendNode),
                  0,
                  ...node._exChildren.filter((v) => v._sign == expendNode._sign)
                );
              }
            }
          }
        }
      });
      this.drawView();
    },
    moveToNode(targetNodeId, eventList = []) {
      if (!targetNodeId)
        throw `moon-hierarchy\u7EC4\u4EF6\uFF1A\u8BF7\u4F20\u5165\u76EE\u6807\u8282\u70B9\u6570\u636E\u4E2D${this.symbolKey}\u7684\u503C`;
      const sourceData = this.treeDataFactory.objById[targetNodeId];
      if (!sourceData) {
        throw `moon-hierarchy\u7EC4\u4EF6\uFF1A\u753B\u5E03\u4E2D\u6CA1\u6709\u5339\u914D\u5230${this.symbolKey}=${targetNodeId}\u7684\u8282\u70B9`;
      }
      let node = this.hierarchyLayoutData.find(
        (item) => item.data[this.symbolKey] == sourceData[this.symbolKey]
      );
      if (!node) {
        this.expendToNode(sourceData);
        node = this.hierarchyLayoutData.find(
          (item) => item.data[this.symbolKey] == sourceData[this.symbolKey]
        );
      }
      this.moveToCenter({
        ...this.nodeToCenterXY(node),
        d: this.duration
      });
      eventList = this.formatToArray(eventList);
      if (eventList.length) {
        let selectionNode = this.svg.select(`#${this.getNodeId(targetNodeId)}`);
        eventList.forEach((event) => {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          const _ = {
            preventDefault() {
            }
          };
          if (event == "clickFetchChildren") {
            this.onClickFetchChildren(sourceData);
            return;
          }
          if (event == "click") {
            console.log("click");
            (_b = (_a = this.nodeListener)["click"]) == null ? void 0 : _b.call(_a, _, node, selectionNode, this.svg);
            return;
          }
          if (event == "mouseover") {
            this.onNodeMouseOver(node);
            (_d = (_c = this.nodeListener)["mouseover"]) == null ? void 0 : _d.call(_c, _, node, selectionNode, this.svg);
            return;
          }
          if (event == "mouseover") {
            this.onNodeMouseOut(node);
            (_f = (_e = this.nodeListener)["mouseout"]) == null ? void 0 : _f.call(_e, _, node, selectionNode, this.svg);
            return;
          }
          (_h = (_g = this.nodeListener)[event]) == null ? void 0 : _h.call(_g, _, node, node, this.svg);
        });
      }
    }
  }
};
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
function isNonEmptyArray$1(arr) {
  return arr && arr.length;
}
const _sfc_main$2 = {
  mixins: [mixins],
  inheritAttrs: false,
  props: {
    layout: {
      type: String,
      default: "lr"
    },
    limit: {
      type: Number,
      default: 3
    }
  },
  computed: {
    nodeConfig() {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      let plusCircleWidth = (((_c = (_b = (_a = this.config.node) == null ? void 0 : _a.plus) == null ? void 0 : _b.attrs) == null ? void 0 : _c.r) || 6) * 2;
      if (typeof ((_e = (_d = this.config.node) == null ? void 0 : _d.plus) == null ? void 0 : _e.show) == "boolean" && !((_g = (_f = this.config.node) == null ? void 0 : _f.plus) == null ? void 0 : _g.show))
        plusCircleWidth = 0;
      let nodeconfig = {
        padding: (data) => {
          let value = [15, 15, 15, 15];
          if (data) {
            if (isNonEmptyArray$1(data.children) || isNonEmptyArray$1(data._children) || data._hasChildren) {
              if (data._sign == 1 && data.track.length > 1)
                value[1] = plusCircleWidth + value[1];
              if (data._sign == -1)
                value[3] = plusCircleWidth + value[3];
            }
          }
          return value;
        },
        nodeWidth: 60,
        nodeHeight: 16,
        separation: 1.5,
        exShaps: [],
        ...this.config.node || {},
        rect: {
          attrs: {},
          show: true,
          on: {},
          ...((_h = this.config.node) == null ? void 0 : _h.rect) || {}
        },
        text: {
          attrs: {},
          show: true,
          on: {},
          compose: {},
          ...((_i = this.config.node) == null ? void 0 : _i.text) || {}
        },
        plus: {
          attrs: {},
          show: true,
          on: {},
          ...((_j = this.config.node) == null ? void 0 : _j.plus) || {}
        }
      };
      let padding = this.setPaddingFormat(nodeconfig.padding);
      let paddingList = padding();
      nodeconfig.padding = padding;
      let fontSize = nodeconfig.text.attrs["font-size"] || 16;
      nodeconfig.text.attrs["font-size"] = fontSize;
      let fontFamily = nodeconfig.text.attrs["font-family"] || null;
      nodeconfig.text.attrs["font-family"] = fontFamily;
      let nodeHeight = nodeconfig.nodeHeight + paddingList[0] + paddingList[2];
      let nodeWidth = nodeconfig.nodeWidth;
      nodeconfig.plus.attrs.r = plusCircleWidth / 2;
      let separation = nodeconfig.separation;
      let nameKey = this.inner_treeOptions.name;
      const rectShap = {
        name: "rect",
        attrs: {
          ...nodeconfig.rect.attrs,
          class: (d) => this.setShapClass(d, "rect", nodeconfig),
          height: nodeHeight,
          width: (d) => d.data._nodeConfig.nodeWidth
        }
      };
      const frontRectShap = {
        name: "rect",
        attrs: {
          stroke: "none",
          fill: "black",
          "fill-opacity": 0,
          "stroke-width": "0",
          height: nodeHeight,
          width: (d) => d.data._nodeConfig.nodeWidth
        },
        on: nodeconfig.rect.on
      };
      const textShap = {
        name: "text",
        attrs: {
          "font-size": fontSize,
          transform: (d) => {
            let textH = fontSize + 4;
            return `translate(${padding(d.data)[3]},${(nodeHeight - textH) / 2 + fontSize})`;
          },
          ...nodeconfig.text.attrs,
          class: (d) => this.setShapClass(d, "text", nodeconfig)
        },
        compose: {
          text(d) {
            return d.data._isexpend === void 0 ? d.data[nameKey] : d.data._isexpend === true ? "\u6536\u8D77" : "\u5C55\u5F00";
          },
          ...nodeconfig.text.compose
        },
        on: nodeconfig.text.on
      };
      const plusShap = {
        name: "g",
        attrs: {
          ...nodeconfig.plus.attrs,
          class: (d) => this.setShapClass(d, "plus", nodeconfig),
          transform: (d) => `translate(${d.data._sign == 1 ? d.data._nodeConfig.nodeWidth - padding(d.data)[1] + plusCircleWidth : padding(d.data)[3] - plusCircleWidth},${nodeHeight / 2})`
        },
        on: nodeconfig.plus.on,
        children: [
          {
            name: "circle",
            attrs: {
              r: plusCircleWidth / 2
            }
          },
          {
            name: "line",
            attrs: {
              x1: -plusCircleWidth / 4,
              y1: "0",
              x2: plusCircleWidth / 4,
              y2: "0"
            }
          },
          {
            name: "line",
            attrs: {
              x1: "0",
              y1: -plusCircleWidth / 4,
              x2: "0",
              y2: plusCircleWidth / 4
            }
          }
        ]
      };
      return {
        fontSize,
        padding,
        plusCircleWidth,
        nodeHeight,
        nodeSize: [nodeHeight, nodeWidth],
        separation,
        shaps: [
          ...nodeconfig.rect.show ? [rectShap] : [],
          ...nodeconfig.text.show ? [textShap] : [],
          ...nodeconfig.plus.show ? [plusShap] : [],
          ...nodeconfig.rect.show ? [frontRectShap] : [],
          ...nodeconfig.exShaps
        ]
      };
    }
  },
  methods: {
    setSign() {
      var _a;
      const negativeIds = ((_a = this.treeDataFactory.treeData[0].children || this.treeDataFactory.treeData[0]._children) == null ? void 0 : _a.filter((v) => this.negativeIds.includes(v[this.symbolKey])).map((v) => v[this.symbolKey])) || [];
      this.treeDataFactory.flatData.forEach((item) => {
        item._sign = 1;
        if (this.layout == "rl") {
          item._sign = -1;
        }
        if (this.layout == "bf") {
          item._sign = intersection(item.track, negativeIds).length > 0 ? -1 : 1;
        }
      });
      this.treeDataFactory.treeData[0]._sign = 1;
      this.setLimtNode();
    },
    setLimtNode() {
      if (this.limit > 0)
        this.treeDataFactory.flatData.forEach((item) => {
          var _a, _b;
          let flag = !item.children || typeof ((_b = (_a = item.children) == null ? void 0 : _a[item.children.length - 1]) == null ? void 0 : _b._isexpend) == "boolean";
          if (flag)
            return;
          let children = [];
          let _exChildren = [];
          const setLimt = (list, _sign = 1) => {
            if (list.length > this.limit && typeof list[list.length - 1]._isexpend != "boolean") {
              let id = getUUID();
              let expendNode = {
                [this.symbolKey]: id,
                [this.inner_treeOptions.name]: "\u5C55\u5F00",
                [this.inner_treeOptions.pId]: item[this.symbolKey],
                track: [...item.track, id],
                trigger: [],
                level: item.level + 1,
                _isexpend: false,
                _sign
              };
              item.trigger.push(id);
              this.treeDataFactory.flatData.push(expendNode);
              this.treeDataFactory.objById[id] = expendNode;
              _exChildren.push(...list.slice(this.limit));
              children.push(...list.slice(0, this.limit));
              children.push(expendNode);
            } else
              children.push(...list);
          };
          let p = item.children.filter((v) => v._sign == 1);
          let n = item.children.filter((v) => v._sign == -1);
          setLimt(p, 1);
          setLimt(n, -1);
          item.children = children;
          item._exChildren = _exChildren;
        });
    },
    initLayoutData() {
      this.addNodeWidthToData(this.treeDataFactory.treeData);
      this.addNodeOffset(this.treeDataFactory.treeData);
      this.setLayoutData();
    },
    onLimitNodeExpendOrFold(sourceData) {
      const symbolKey = this.symbolKey;
      let exChildrenIds = [];
      let exChildrenNode = [];
      this.lastClickNode = this.lastClickNode.parent;
      sourceData._isexpend = !sourceData._isexpend;
      let parent = this.treeDataFactory.objById[this.lastClickNode.data[symbolKey]];
      if (sourceData._isexpend) {
        parent.children.splice(
          parent.children.indexOf(sourceData),
          0,
          ...parent._exChildren.filter((v) => v._sign == sourceData._sign)
        );
      } else {
        exChildrenIds = parent._exChildren.filter((v) => v._sign == sourceData._sign).map((v) => v[this.symbolKey]);
        exChildrenNode = this.hierarchyLayoutData.descendants().filter((n) => exChildrenIds.includes(n.data[symbolKey]));
        parent.children = parent.children.filter(
          (v) => !exChildrenIds.includes(v[this.symbolKey])
        );
      }
      this.drawView();
      const afterCalcuNode = this.hierarchyLayoutData.find(
        (n) => n.data[symbolKey] == this.lastClickNode.data[symbolKey]
      );
      if (!sourceData._isexpend) {
        exChildrenNode.forEach((node) => {
          this.foldLinksAndNodes(node, afterCalcuNode);
        });
        this.foldLinksAndNodes(this.lastClickNode, afterCalcuNode, (link) => {
          return exChildrenIds.includes(link.target.data[this.symbolKey]);
        });
      }
      this.moveToCenter({
        ...this.nodeToCenterXY(afterCalcuNode),
        d: this.duration
      });
    },
    onNodeExpendTranslate(d) {
      if (!d)
        d = { x: 0, y: 0, data: { _nodeConfig: { nodeWidth: 0 } } };
      if (d.data._sign == 1)
        return `translate(${d.y},${d.x}) scale(1)`;
      if (d.data._sign == -1) {
        return `translate(${-d.y - d.data._nodeConfig.nodeWidth + this.getTranslateOffset(d)},${d.x}) scale(1)`;
      }
    },
    onNodeFoldTranslate(d, source) {
      if (!d) {
        return `translate(${0},${this.nodeConfig.nodeHeight / 2}) scale(0)`;
      }
      return `translate(${(d.y + d.data._nodeConfig.nodeWidth - this.getTranslateOffset(source)) * d.data._sign},${d.x + this.nodeConfig.nodeHeight / 2}) scale(0)`;
    },
    addLinks(links) {
      const getLinkId = this.getLinkId;
      const symbolKey = this.symbolKey;
      if (!this.linksContainer)
        this.linksContainer = this.container.append("g").attr("class", "moon-hierarchy-links");
      let path = this.linksContainer.selectAll().data(links).join("path");
      this.setAttrByOpt(path, this.linkConifg);
      path.attr(
        "id",
        ({ source, target }) => getLinkId(source.data[symbolKey], target.data[symbolKey])
      );
      path.attr("d", (d) => {
        return this.setLinkPath(d);
      }).attr("transform", ({ target }) => {
        return this.onNodeFoldTranslate(this.lastClickNode, target);
      }).transition().duration(this.duration).attr(
        "transform",
        ({ target }) => `translate(${this.getTranslateOffset(target)},0) scale(1)`
      );
    },
    updateLinks(links) {
      for (let i = 0; i < links.length; i++) {
        let item = links[i];
        const id = this.getLinkId(
          item.source.data[this.symbolKey],
          item.target.data[this.symbolKey]
        );
        const path = this.svg.select(`#${id}`);
        path.transition().duration(this.duration).attr(
          "transform",
          ` translate(${this.getTranslateOffset(item.target)},0)  scale(1)`
        ).attr("d", () => {
          return this.setLinkPath(item);
        });
      }
    },
    setLinkPath({ source, target }) {
      let offsetY = this.nodeConfig.nodeHeight / 2;
      let x0 = target.data._sign * (source.y + source.data._nodeConfig.nodeWidth), y0 = source.x + offsetY, x1 = target.data._sign * target.y, y1 = target.x + offsetY;
      let insertW = x1 - x0;
      let inserH = y1 - y0;
      let nodeInsertW = target.data._sign * this.nodeConfig.nodeSize[1];
      return `M${x0},${y0}h${insertW - nodeInsertW / 2}v${inserH}h${nodeInsertW / 2}`;
    },
    nodeToCenterXY(node) {
      let x = 0;
      if (node.data._sign == 1) {
        x = node.y + node.data._nodeConfig.nodeWidth / 2;
      } else {
        x = -node.y - node.data._nodeConfig.nodeWidth / 2 + this.hierarchyLayoutData.data._nodeConfig.nodeWidth;
      }
      return {
        x,
        y: node.x + this.nodeConfig.nodeHeight / 2
      };
    },
    treeLayout(data) {
      let layoutData = d3.tree().separation(() => this.nodeConfig.separation).nodeSize(this.nodeConfig.nodeSize)(data);
      function modifyXY(list) {
        for (let i = 0; i < list.length; i++) {
          let item = list[i];
          item.y = item.y + item.data.offset;
          if (isNonEmptyArray$1(item.children))
            modifyXY(item.children);
        }
      }
      modifyXY(layoutData.children || []);
      return layoutData;
    },
    addNodeWidthToData(list) {
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        item._nodeConfig = {
          ...this.nodeConfig,
          nodeWidth: this.getNodeWidth(item)
        };
        if (isNonEmptyArray$1(item.children))
          this.addNodeWidthToData(item.children);
      }
    },
    addNodeOffset(treeData) {
      const findTreeSameLevelData = this.findTreeSameLevelData;
      function iterator(treeList, offset = 0) {
        for (let i = 0; i < treeList.length; i++) {
          let item = treeList[i];
          item.offset = offset;
          if (isNonEmptyArray$1(item.children)) {
            let maxNode = maxBy(
              findTreeSameLevelData(treeData, item),
              function(o) {
                return o._nodeConfig.nodeWidth;
              }
            );
            iterator(
              item.children,
              item.offset + maxNode._nodeConfig.nodeWidth
            );
          }
        }
      }
      iterator(treeData);
    },
    findTreeSameLevelData(treeList, item) {
      let arr = [];
      let level = item.level;
      let _sign = item._sign;
      function iterator(treeList2, level2, currentLevel) {
        for (let i = 0; i < treeList2.length; i++) {
          let item2 = treeList2[i];
          if (currentLevel == level2 && item2._sign == _sign) {
            arr.push(item2);
            continue;
          }
          if (isNonEmptyArray$1(item2.children)) {
            iterator(item2.children, level2, currentLevel + 1);
          }
        }
      }
      iterator(treeList, level, 1);
      return arr;
    },
    getTranslateOffset(d) {
      if (d.data._sign == -1 && d.data[this.symbolKey] != this.hierarchyLayoutData.data[this.symbolKey])
        return this.hierarchyLayoutData.data._nodeConfig.nodeWidth;
      return 0;
    },
    getNodeWidth(item) {
      let width = this.calculateTextWidth(
        item[this.inner_treeOptions.name],
        this.nodeConfig.fontSize,
        this.nodeConfig.fontFamily
      );
      let padding = this.nodeConfig.padding(item);
      return width + padding[1] + padding[3];
    },
    setLoadingIcon(source, flag = true) {
      source._loading = flag;
      const nodeId = this.getNodeId(source[this.symbolKey]);
      const x = (d) => d.data._sign == 1 ? d.data._nodeConfig.nodeWidth : -this.defsNodeConfig.loadingSize;
      const y = () => this.nodeConfig.nodeHeight / 2 - this.defsNodeConfig.loadingSize / 2;
      if (flag) {
        const use = d3.select(`#${nodeId}`).append("use").attr("class", "moon-hierarchy-loading").attr("xlink:href", "#loading");
        use.attr("x", x).attr("y", y).attr(
          "transform-origin",
          (d) => `${x(d) + this.defsNodeConfig.loadingSize / 2} ${y() + this.defsNodeConfig.loadingSize / 2}`
        );
      } else
        this.svg.select(`#${nodeId}`).select("use").remove();
    },
    drawCustomView(e, d, width, height, priority, duration) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      width = width || ((_b = (_a = this.config) == null ? void 0 : _a.customView) == null ? void 0 : _b.width) || 100;
      height = height || ((_d = (_c = this.config) == null ? void 0 : _c.customView) == null ? void 0 : _d.height) || 50;
      priority = priority || ((_f = (_e = this.config) == null ? void 0 : _e.customView) == null ? void 0 : _f.priority) || ["rb", "rt", "lb", "lt"];
      const svgRect = this.svg.node().getBoundingClientRect();
      const nodeId = this.getNodeId(d.data[this.symbolKey]);
      const elementRect = this.svg.select(`#${nodeId}`).node().getBoundingClientRect();
      let mapObjJudge = {
        rb: svgRect.bottom - elementRect.bottom >= height && svgRect.right - elementRect.right >= width,
        rt: elementRect.top - svgRect.top >= height && svgRect.right - elementRect.right >= width,
        lb: svgRect.bottom - elementRect.bottom >= height && elementRect.left - svgRect.left >= width,
        lt: elementRect.top - svgRect.top >= height && elementRect.left - svgRect.left >= width
      };
      let mapPath = priority.find((p) => mapObjJudge[p]) || "rb";
      let transform = "";
      let transform_begin = "";
      let { nodeHeight, nodeWidth } = d.data._nodeConfig;
      let offset = this.getTranslateOffset(d);
      let xy_node = {
        positive: {
          rt: [d.y + nodeWidth, d.x],
          lt: [d.y, d.x],
          rb: [d.y + nodeWidth, d.x + nodeHeight],
          lb: [d.y, d.x + nodeHeight]
        },
        negative: {
          rt: [-d.y + offset, d.x],
          rb: [-d.y + offset, d.x + nodeHeight],
          lt: [-d.y + offset - nodeWidth, d.x],
          lb: [-d.y + offset - nodeWidth, d.x + nodeHeight]
        }
      };
      let xy = {
        positive: {
          rt: [d.y + nodeWidth, d.x - height],
          lt: [d.y - width, d.x - height],
          rb: [d.y + nodeWidth, d.x + nodeHeight],
          lb: [d.y - width, d.x + nodeHeight]
        },
        negative: {
          rt: [-d.y + offset, d.x - height],
          rb: [-d.y + offset, d.x + nodeHeight],
          lt: [-d.y + offset - nodeWidth - width, d.x - height],
          lb: [-d.y + offset - nodeWidth - width, d.x + nodeHeight]
        }
      };
      if (d.data._sign == 1) {
        transform_begin = `translate(${xy_node.positive[mapPath][0]},${xy_node.positive[mapPath][1]}) scale(0)`;
        transform = `translate(${xy.positive[mapPath][0]},${xy.positive[mapPath][1]}) scale(1)`;
      }
      if (d.data._sign == -1) {
        transform_begin = `translate(${xy_node.negative[mapPath][0]},${xy_node.negative[mapPath][1]}) scale(0)`;
        transform = `translate(${xy.negative[mapPath][0]},${xy.negative[mapPath][1]}) scale(1)`;
      }
      let hasChangeNode = d.data[this.symbolKey] != ((_i = (_h = (_g = this.drawCustomViewLastConfig) == null ? void 0 : _g.d) == null ? void 0 : _h.data) == null ? void 0 : _i[this.symbolKey]);
      this.drawCustomViewLastConfig = {
        e,
        d,
        width,
        height,
        priority
      };
      this.createOrUpdateForeignObject({
        width,
        height,
        transform,
        transform_begin,
        hasChangeNode,
        duration
      });
    }
  }
};
const _hoisted_1$1 = { ref: "svg" };
const _hoisted_2$1 = {
  ref: "CoustomView",
  class: "moon-hierarchy-custom-view"
};
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1$1, [
    withDirectives(createElementVNode("div", _hoisted_2$1, [
      renderSlot(_ctx.$slots, "default")
    ], 512), [
      [vShow, _ctx.showCustomView]
    ])
  ], 512);
}
const horizontal = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2]]);
function isNonEmptyArray(arr) {
  return arr && arr.length;
}
const _sfc_main$1 = {
  mixins: [mixins],
  inheritAttrs: false,
  props: {
    layout: {
      type: String,
      default: "tb"
    }
  },
  computed: {
    nodeConfig() {
      var _a, _b, _c, _d, _e;
      let nodeconfig = {
        padding: 10,
        nodeWidth: 168,
        nodeHeight: 68,
        lineHeight: 10,
        separation: 1.5,
        exShaps: [],
        ...((_a = this.config) == null ? void 0 : _a.node) || {},
        rect: {
          attrs: {},
          show: true,
          on: {},
          ...((_b = this.config.node) == null ? void 0 : _b.rect) || {}
        },
        text: {
          attrs: {},
          show: true,
          on: {},
          ...((_c = this.config.node) == null ? void 0 : _c.text) || {}
        },
        plus: {
          attrs: {},
          show: true,
          on: {},
          ...((_d = this.config.node) == null ? void 0 : _d.plus) || {}
        }
      };
      nodeconfig.padding = this.setPaddingFormat(nodeconfig.padding);
      let nodeWidth = nodeconfig.nodeWidth;
      let nodeHeight = nodeconfig.nodeHeight;
      let plusCircleWidth = 0;
      if (nodeconfig.plus.show) {
        plusCircleWidth = (((_e = nodeconfig.plus.attrs) == null ? void 0 : _e.r) || 10) * 2;
        nodeconfig.plus.attrs.r = plusCircleWidth / 2;
      }
      let fontSize = nodeconfig.text.attrs["font-size"] || 16;
      nodeconfig.text.attrs["font-size"] = fontSize;
      let fontFamily = nodeconfig.text.attrs["font-family"] || null;
      nodeconfig.text.attrs["font-family"] = fontFamily;
      let lineHeight = nodeconfig.text.attrs["line-height"] || 10;
      nodeconfig.text.attrs["line-height"] = lineHeight;
      let separation = nodeconfig.separation;
      const rectShap = {
        name: "rect",
        attrs: {
          ...nodeconfig.rect.attrs,
          class: (d) => this.setShapClass(d, "rect", nodeconfig),
          height: nodeHeight,
          width: (d) => d.data._nodeConfig.nodeWidth
        }
      };
      const frontRectShap = {
        name: "rect",
        attrs: {
          stroke: "none",
          fill: "black",
          "fill-opacity": 0,
          "stroke-width": "0",
          height: nodeHeight,
          width: (d) => d.data._nodeConfig.nodeWidth
        },
        on: nodeconfig.rect.on
      };
      const textShap = {
        name: "g",
        attrs: {
          transform: (d) => `translate(${nodeWidth / 2},${nodeHeight / 2 - (d.data._name[1] ? (fontSize + lineHeight) / 2 : 0)})`
        },
        on: nodeconfig.text.on,
        children: [
          {
            name: "text",
            attrs: {
              ...nodeconfig.text.attrs,
              class: (d) => this.setShapClass(d, "text", nodeconfig),
              "font-size": fontSize,
              "text-anchor": "middle",
              "dominant-baseline": "middle"
            },
            children: [
              {
                name: "tspan",
                attrs: {},
                compose: {
                  text(d) {
                    return d.data._name[0];
                  }
                }
              },
              {
                name: "tspan",
                attrs: {
                  x: 0,
                  dy: fontSize + lineHeight
                },
                compose: {
                  text(d) {
                    return d.data._name[1];
                  }
                }
              }
            ]
          }
        ]
      };
      const plusShap = {
        name: "g",
        attrs: {
          ...nodeconfig.plus.attrs,
          class: (d) => this.setShapClass(d, "plus", nodeconfig),
          transform: (d) => `translate(${d.data._nodeConfig.nodeWidth / 2},${(d.data._sign == 1 ? nodeHeight : 0) + d.data._sign * plusCircleWidth / 2})`
        },
        on: nodeconfig.plus.on,
        children: [
          {
            name: "circle",
            attrs: {
              r: plusCircleWidth / 2
            }
          },
          {
            name: "line",
            attrs: {
              x1: -plusCircleWidth / 4,
              y1: "0",
              x2: plusCircleWidth / 4,
              y2: "0"
            }
          },
          {
            name: "line",
            attrs: {
              x1: "0",
              y1: -plusCircleWidth / 4,
              x2: "0",
              y2: plusCircleWidth / 4
            }
          }
        ]
      };
      return {
        fontSize,
        padding: nodeconfig.padding,
        nodeHeight,
        nodeWidth,
        nodeSize: [nodeWidth, nodeHeight * 2],
        separation,
        plusCircleWidth,
        shaps: [
          ...nodeconfig.rect.show ? [rectShap] : [],
          ...nodeconfig.text.show ? [textShap] : [],
          ...nodeconfig.plus.show ? [plusShap] : [],
          ...nodeconfig.rect.show ? [frontRectShap] : [],
          ...nodeconfig.exShaps
        ]
      };
    }
  },
  methods: {
    setSign() {
      var _a;
      const negativeIds = ((_a = this.treeDataFactory.treeData[0].children || this.treeDataFactory.treeData[0]._children) == null ? void 0 : _a.filter((v) => this.negativeIds.includes(v[this.symbolKey])).map((v) => v[this.symbolKey])) || [];
      this.treeDataFactory.flatData.forEach((item) => {
        item._sign = 1;
        if (this.layout == "bt") {
          item._sign = -1;
        }
        if (this.layout == "bf") {
          item._sign = intersection(item.track, negativeIds).length > 0 ? -1 : 1;
        }
      });
      this.treeDataFactory.treeData[0]._sign = 1;
    },
    initLayoutData() {
      this.addNodeWidthToData(this.treeDataFactory.treeData);
      this.setLayoutData();
    },
    onNodeExpendTranslate(d) {
      if (!d)
        d = { x: 0, y: 0, data: { _nodeConfig: { nodeWidth: 0 } } };
      if (d.data._sign == 1)
        return `translate(${d.x - d.data._nodeConfig.nodeWidth / 2},${d.y}) scale(1)`;
      if (d.data._sign == -1) {
        return `translate(${d.x - d.data._nodeConfig.nodeWidth / 2},${-d.y}) scale(1)`;
      }
    },
    onNodeFoldTranslate(d, source) {
      if (!d) {
        if (source.data._sign == -1)
          return `translate(0,${this.nodeConfig.nodeHeight}) scale(0)`;
        else
          return `translate(0,${this.nodeConfig.nodeHeight}) scale(0)`;
      }
      if (source.data._sign == -1)
        return `translate(${d.x},${d.y * d.data._sign}) scale(0)`;
      else
        return `translate(${d.x},${d.y + this.nodeConfig.nodeHeight}) scale(0)`;
    },
    addLinks(links) {
      const getLinkId = this.getLinkId;
      const symbolKey = this.symbolKey;
      if (!this.linksContainer)
        this.linksContainer = this.container.append("g").attr("class", "moon-hierarchy-links");
      let path = this.linksContainer.selectAll().data(links).join("path");
      this.setAttrByOpt(path, this.linkConifg);
      path.attr(
        "id",
        ({ source, target }) => getLinkId(source.data[symbolKey], target.data[symbolKey])
      );
      path.attr("d", (d) => {
        return this.setLinkPath(d);
      }).attr("transform", ({ target }) => {
        return this.onNodeFoldTranslate(this.lastClickNode, target);
      }).transition().duration(this.duration).attr(
        "transform",
        ({ target }) => `translate(0,${this.getTranslateOffset(target)}) scale(1)`
      );
    },
    updateLinks(links) {
      for (let i = 0; i < links.length; i++) {
        let item = links[i];
        const id = this.getLinkId(
          item.source.data[this.symbolKey],
          item.target.data[this.symbolKey]
        );
        const path = this.svg.select(`#${id}`);
        path.transition().duration(this.duration).attr(
          "transform",
          ` translate(0,${this.getTranslateOffset(item.target)} )  scale(1)`
        ).attr("d", () => {
          return this.setLinkPath(item);
        });
      }
    },
    setLinkPath({ source, target }) {
      let x0 = source.x, y0 = target.data._sign * (source.y + this.nodeConfig.nodeHeight), x1 = target.x, y1 = target.data._sign * target.y;
      let insertW = x1 - x0;
      let inserH = y1 - y0;
      return `M${x0},${y0}v${inserH / 2}h${insertW}v${inserH / 2}`;
    },
    nodeToCenterXY(node) {
      return {
        x: node.x + node.data._nodeConfig.nodeWidth / 2,
        y: node.data._sign * node.y + this.nodeConfig.nodeHeight / 2
      };
    },
    treeLayout(data) {
      return d3.tree().separation(() => this.nodeConfig.separation).nodeSize(this.nodeConfig.nodeSize)(data);
    },
    addNodeWidthToData(list) {
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        item._nodeConfig = {
          ...this.nodeConfig,
          nodeWidth: this.nodeConfig.nodeWidth
        };
        item["_" + this.inner_treeOptions.name] = this.getFormatTextArr(item);
        if (isNonEmptyArray(item.children))
          this.addNodeWidthToData(item.children);
      }
    },
    getTranslateOffset(d) {
      if (d.data._sign == -1 && d.data[this.symbolKey] != this.hierarchyLayoutData.data[this.symbolKey])
        return this.nodeConfig.nodeHeight;
      return 0;
    },
    setLoadingIcon(source, flag = true) {
      const nodeId = this.getNodeId(source[this.symbolKey]);
      const x = (d) => d.data._nodeConfig.nodeWidth / 2 - this.defsNodeConfig.loadingSize / 2;
      const y = (d) => d.data._sign == 1 ? this.nodeConfig.nodeHeight + this.nodeConfig.plusCircleWidth : -this.defsNodeConfig.loadingSize - this.nodeConfig.plusCircleWidth;
      if (flag) {
        source._loading = flag;
        const use = d3.select(`#${nodeId}`).append("use").attr("class", "moon-hierarchy-loading").attr("xlink:href", "#loading");
        use.attr("x", x).attr("y", y).attr(
          "transform-origin",
          (d) => `${x(d) + this.defsNodeConfig.loadingSize / 2} ${y(d) + this.defsNodeConfig.loadingSize / 2}`
        );
      } else {
        delete source._loading;
        this.svg.select(`#${nodeId}`).select("use").remove();
      }
    },
    getFormatTextArr(item, lineNum = 2, ellipse = "\u2026") {
      const text = item[this.inner_treeOptions.name];
      const padding = this.nodeConfig.padding(item);
      const textWidth = this.nodeConfig.nodeWidth - padding[1] - padding[3];
      let lineList = [];
      const calculateTextWidth = this.calculateTextWidth;
      function textSplit(text2, maxWidth, fontSize, fontFamily, lineList2 = []) {
        for (let i = text2.length; i >= 0; i--) {
          const str = text2.slice(0, i);
          const tw = calculateTextWidth(str, fontSize, fontFamily);
          if (maxWidth >= tw) {
            lineList2.push(str);
            let nextStr = text2.slice(i);
            if (nextStr) {
              textSplit(nextStr, maxWidth, fontSize, fontFamily, lineList2);
            }
            break;
          }
        }
      }
      textSplit(
        text,
        textWidth,
        this.nodeConfig.fontSize,
        this.nodeConfig.fontFamily,
        lineList
      );
      if (lineNum && lineList.length > lineNum) {
        lineList = lineList.slice(0, lineNum);
        const str = lineList[lineNum - 1];
        for (let i = str.length; i >= 0; i--) {
          const str2 = str.slice(0, i) + ellipse;
          const tw2 = calculateTextWidth(
            str2,
            this.nodeConfig.fontSize,
            this.nodeConfig.fontFamily
          );
          if (textWidth >= tw2) {
            lineList[lineNum - 1] = str2;
            break;
          }
        }
      }
      if (lineList.length < lineNum) {
        for (let i = lineList.length + 1; i <= lineNum; i++) {
          lineList.push("");
        }
      }
      return lineList;
    },
    drawCustomView(e, d, width, height, priority, duration) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      width = width || ((_b = (_a = this.config) == null ? void 0 : _a.customView) == null ? void 0 : _b.width) || 100;
      height = height || ((_d = (_c = this.config) == null ? void 0 : _c.customView) == null ? void 0 : _d.height) || 50;
      priority = priority || ((_f = (_e = this.config) == null ? void 0 : _e.customView) == null ? void 0 : _f.priority) || ["rb", "rt", "lb", "lt"];
      const svgRect = this.svg.node().getBoundingClientRect();
      const nodeId = this.getNodeId(d.data[this.symbolKey]);
      const elementRect = this.svg.select(`#${nodeId}`).node().getBoundingClientRect();
      let mapObjJudge = {
        rb: svgRect.bottom - elementRect.bottom >= height && svgRect.right - elementRect.right >= width,
        rt: elementRect.top - svgRect.top >= height && svgRect.right - elementRect.right >= width,
        lb: svgRect.bottom - elementRect.bottom >= height && elementRect.left - svgRect.left >= width,
        lt: elementRect.top - svgRect.top >= height && elementRect.left - svgRect.left >= width
      };
      let mapPath = priority.find((p) => mapObjJudge[p]) || "rb";
      let transform = "";
      let transform_begin = "";
      let { nodeHeight, nodeWidth } = d.data._nodeConfig;
      let xy_node = {
        positive: {
          rt: [d.x + nodeWidth / 2, d.y],
          lt: [d.x - nodeWidth / 2, d.y],
          rb: [d.x + nodeWidth / 2, d.y + nodeHeight],
          lb: [d.x - nodeWidth / 2, d.y + nodeHeight]
        },
        negative: {
          rt: [d.x + nodeWidth / 2, -d.y],
          rb: [d.x + nodeWidth / 2, -d.y + nodeHeight],
          lt: [d.x - nodeWidth / 2, -d.y],
          lb: [d.x - nodeWidth / 2, -d.y + nodeHeight]
        }
      };
      let xy = {
        positive: {
          rt: [d.x + nodeWidth / 2, d.y - height],
          lt: [d.x - nodeWidth / 2 - width, d.y - height],
          rb: [d.x + nodeWidth / 2, d.y + nodeHeight],
          lb: [d.x - nodeWidth / 2 - width, d.y + nodeHeight]
        },
        negative: {
          rt: [d.x + nodeWidth / 2, -d.y - height],
          rb: [d.x + nodeWidth / 2, -d.y + nodeHeight],
          lt: [d.x - nodeWidth / 2 - width, -d.y - height],
          lb: [d.x - nodeWidth / 2 - width, -d.y + nodeHeight]
        }
      };
      if (d.data._sign == 1) {
        transform_begin = `translate(${xy_node.positive[mapPath][0]},${xy_node.positive[mapPath][1]}) scale(0)`;
        transform = `translate(${xy.positive[mapPath][0]},${xy.positive[mapPath][1]}) scale(1)`;
      }
      if (d.data._sign == -1) {
        transform_begin = `translate(${xy_node.negative[mapPath][0]},${xy_node.negative[mapPath][1]}) scale(0)`;
        transform = `translate(${xy.negative[mapPath][0]},${xy.negative[mapPath][1]}) scale(1)`;
      }
      let hasChangeNode = d.data[this.symbolKey] != ((_i = (_h = (_g = this.drawCustomViewLastConfig) == null ? void 0 : _g.d) == null ? void 0 : _h.data) == null ? void 0 : _i[this.symbolKey]);
      this.drawCustomViewLastConfig = {
        e,
        d,
        width,
        height,
        priority
      };
      this.createOrUpdateForeignObject({
        width,
        height,
        transform,
        transform_begin,
        hasChangeNode,
        duration
      });
    }
  }
};
const _hoisted_1 = { ref: "svg" };
const _hoisted_2 = {
  ref: "CoustomView",
  class: "moon-hierarchy-custom-view"
};
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1, [
    withDirectives(createElementVNode("div", _hoisted_2, [
      renderSlot(_ctx.$slots, "default")
    ], 512), [
      [vShow, _ctx.showCustomView]
    ])
  ], 512);
}
const vertical = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1]]);
const index_vue_vue_type_style_index_0_lang = "";
const _sfc_main = {
  name: "MoonHierarchy",
  components: { horizontal, vertical },
  inheritAttrs: false,
  props: {
    mode: {
      type: String,
      default: "h"
    }
  },
  data() {
    return {
      show: false
    };
  },
  methods: {
    getNodeById(id) {
      return this.$refs.MoonHierarchy.getNodeById(id);
    },
    getAllNode() {
      return this.$refs.MoonHierarchy.getAllNode();
    },
    moveToCenter() {
      this.$refs.MoonHierarchy.moveToCenter(null);
    },
    zoom(scale) {
      this.$refs.MoonHierarchy.scale(scale);
    },
    addNode(targetNodeId, childrenNode, _sign) {
      this.$refs.MoonHierarchy.addNodeToTargetNode(
        targetNodeId,
        childrenNode,
        _sign
      );
    },
    removeNodeById(id) {
      this.$refs.MoonHierarchy.removeNodeById(id);
    },
    pauseZoom() {
      this.$refs.MoonHierarchy.pauseZoom();
    },
    continueZoom() {
      this.$refs.MoonHierarchy.continueZoom();
    },
    showCustomView(e, d, width, height, priority) {
      this.$refs.MoonHierarchy.drawCustomView(e, d, width, height, priority);
    },
    hiddenCustomView() {
      this.$refs.MoonHierarchy.hiddenCustomView();
    },
    updateNodeByData(data) {
      this.$refs.MoonHierarchy.updateNodeByData(data);
    },
    moveToNode(targetNodeId, eventList) {
      this.$refs.MoonHierarchy.moveToNode(targetNodeId, eventList);
    },
    expendAllNode() {
      this.$refs.MoonHierarchy.expendAllNode();
    },
    foldAllNode() {
      this.$refs.MoonHierarchy.foldAllNode();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_horizontal = resolveComponent("horizontal");
  const _component_vertical = resolveComponent("vertical");
  return openBlock(), createElementBlock("div", {
    class: normalizeClass(_ctx.$attrs.class),
    style: normalizeStyle(_ctx.$attrs.style)
  }, [
    $props.mode == "h" ? (openBlock(), createBlock(_component_horizontal, mergeProps({
      key: 0,
      ref: "MoonHierarchy"
    }, _ctx.$attrs), {
      default: withCtx(() => [
        renderSlot(_ctx.$slots, "default")
      ]),
      _: 3
    }, 16)) : (openBlock(), createBlock(_component_vertical, mergeProps({
      key: 1,
      ref: "MoonHierarchy"
    }, _ctx.$attrs), {
      default: withCtx(() => [
        renderSlot(_ctx.$slots, "default")
      ]),
      _: 3
    }, 16))
  ], 6);
}
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
export {
  index as default
};
