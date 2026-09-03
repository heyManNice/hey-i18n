# hey-i18n 设计文档

> 本文用于向（尤其是 AI）协作者说明项目的**设计目标、关键取舍与架构脉络**。
> 动手改代码前，请先阅读本文、根目录 README.md 与 AGENTS.md。

## 1. 产品目标

hey-i18n 是一套面向 **Vite 项目**的轻量国际化方案，核心主张是**「源码即文案」**：

- 开发者在代码中直接书写原文（`T\`Hello, ${name}!\``），**不设计、不维护 key**；
- 原文是唯一事实来源，语言资源文件里不存放原文；
- 翻译者通过 hey-i18n-studio 的对照表格完成翻译，产物写回 `i18n/*.json`；
- 运行时按当前语言加载译文，找不到时回退原文。

目标用户是文案量不大、希望低成本国际化的小型 Vite 项目，工作流把「开发者」与「翻译者」两个角色分开。

## 2. 核心设计决策

### 2.1 源码即 key（key 骨架）

`T\`Hello, ${name}!\`` 的 key 是**源码模板去掉变量后拼接的骨架**（`Hello, !`），语言文件里存骨架到译文的映射：

```json
// i18n/zh-CN.json
{
    "Hello, !": {
        "texts": ["你好，", "！"],
        "varIndexes": [0]
    }
}
```

运行时的查找 key 与扫描器生成的 key 必须使用同一归一化规则（模板字符串片段拼接），改动任何一侧都要同步另一侧。

**已知边界**：归一化后不同原文可能碰撞（如带变量的句子与恰好相同的字面量），纯变量文本甚至会产生空 key。修复方向是保留变量占位信息，而不是放弃源码即 key 的思路。

### 2.2 译文使用 texts + varIndexes 分段存储

`texts` 是译文文本片段，`varIndexes` 是每个片段间隙对应的**源码插值参数下标**（从 0 开始）。运行时按位置取参拼接：

```ts
texts[0] + values[varIndexes[0]] + texts[1] + ...
```

这是一个经过反复权衡的决定（见提交历史：性能优化 → 因可读性回退 → 为未来条件翻译最终保留），理由有二：

1. 避免运行时反复做字符串正则替换，性能更好；
2. 片段结构便于将来叠加"条件分支"（复数）。

因此**不要**在未与仓库所有者确认的情况下，把 MessageValue 换成朴素的 `{name}` 内插字符串格式。

### 2.3 复数模型是"other 为基底"的预留结构

```ts
type PluralCategories = 'zero' | 'one' | 'two' | 'few' | 'many';

type MessageValue = {
    texts: string[]; // 即 other 分支
    varIndexes: number[];
    isPlural?: boolean; // 预留
    pluralVarIndex?: number; // 参与复数判断的参数下标，预留
    pluralCategory?: {
        // 各复数类别的覆盖分支，预留
        [key in PluralCategories]?: {
            texts: string[];
            varIndexes: number[];
        };
    };
};
```

设计意图：顶层 `texts/varIndexes` 就是 other；`pluralCategory` 只存条件分支的覆盖，缺失分支回落到 other。运行时分发与编辑器目前**尚未实现**，实现时应按此语义扩展，并配合 `Intl.PluralRules` 之类规则选择分支。

### 2.4 源语言零开销

`sourcesLocale === currentLocale` 时直接短路返回原文（translate.ts），因此：

- **不需要**为源语言创建语言包，原文即代码；
- `availableLocales` 会补上 `sourcesLocale`，即使没有对应文件；
- 用户默认语言（`system` 或固定值）与语言包不匹配时，目前会回退原文，尚无"就近语言回退"。

### 2.5 语言元数据单源

语言代码/名称表与 RTL 集合只定义在 `src/hey-i18n/languages.ts`，studio 前端通过 `studio/frontend/consts/languages.ts` 直接 re-export，**不要**在 studio 侧另维护一份。

### 2.6 集成形态依赖 Vite 编译期转换（待验证）

运行时通过 `import.meta.glob('/i18n/*.json')` 与 `'/i18n/.hey-i18n-config'` 发现语言包（config.ts）。该 API 需要 Vite 在编译期处理。仓库内的 [demo/](../demo/) 与 Playwright 测试已在 Vite 7 下验证两种安装方式（`file:` 本地链接与 `npm pack` 打包安装）均可正常加载语言包；尚未覆盖全部 Vite 版本与 SSR 场景，后续发布前仍建议补充 `exports`/`types` 等包字段。

## 3. studio 架构

### 3.1 定位：贴着项目跑的本地工具

studio 通过 `process.cwd()` 将当前目录视为目标项目：

- 检测目标 `package.json` 中是否声明 `vite`；
- 扫描其 `./src`（路径目前写死）；
- 读写其 `i18n/` 目录；
- 首次使用通过向导生成 `i18n/.hey-i18n-config` 并建立扫描缓存。

因此必须在目标项目根目录执行 `hey-i18n-studio`。

### 3.2 数据流与文件格式

```
源码 T`...`
  → 扫描器 scaner（正则提取 texts / variables / 位置）
  → 缓存 i18n/.hey-i18n-key-cache
      { metadata: { timestamp, project }, entries: [{ file, line, column, raw, texts, variables }] }
  → 编辑器加载 getAssetsAndCache(filename)
  → 对照表格编辑（内存修改集 mChangeData，* 号标记）
  → 保存 saveTranslation → assets.saveI18nFile
      （后端归一化 texts 长度、空译文删除键、合并回文件）
  → i18n/<locale>.json
  → 运行时 import.meta.glob 按需加载
```

配置文件 `i18n/.hey-i18n-config` 由 studio 生成/改写，格式为带注释头的 `export default { sourcesLocale, defaultLocale }`；读取时用正则提取 JSON 部分。

**翻译者不应手工编辑 JSON**；缓存是编辑器把 `varIndexes` 还原为变量名的依据，缓存缺失或过期会直接影响编辑正确性。

### 3.3 类型安全的 RPC

- 后端以命名空间对象暴露能力：`explorer`、`editor`、`settings.project`、`config`（rpc/rpc-expose.ts）；
- 前端用 Proxy 按路径调用并返回 Promise（rpc/backend.ts）；
- 类型通过 `Asyncify<T>` 从后端推导到前端；
- 接口层（backend/interface/_）是薄封装，服务层（backend/services/_）持有真正的文件逻辑；
- 新增后端能力时：在 `services/` 实现 → `interface/` 暴露 → 挂到 `rpc-expose.ts`，前端类型即可用。

### 3.4 前端模式：集中模型 + 薄组件

- 状态集中在 `models/` 的 reactive 单例：`mExplorer`、`mEditor`、`mSystemBar`；
- 异步数据统一用 `useReactivePromise`，返回 `{ d, e, l, update }`；
- 用户提示统一走 `Notify`（ok / fail / progress / loading），驱动底部状态栏的状态机；
- 命名约定：`mXxx` 数据、`fXxx` 方法、`cXxx` 常量/选项；
- 编辑修改集为 `mEditor.mChangeData[filename][key]`，未保存标记 `*` 同时出现在标签页与资源树。

### 3.5 编辑器的变量语义

- 变量在编辑器中是不可编辑的 chip（`{name}`），输入 `{` 触发源码变量联想；
- 保存时把译文变量名映射回源码参数下标（`varIndexes`）——译文**按位置取参**，允许省略变量，但不校验错拼的变量名；
- 资源文件不存变量名，变量名展示依赖扫描缓存重建。

### 3.6 持久化策略

- IndexedDB `savedTabs`：按项目路径恢复上次打开的标签页；
- localStorage：`hey-i18n-locale`（运行时语言）、`settings:open`（刷新后恢复设置弹窗）、`settings:activeMenuIndex`；
- `@vueuse/core` 的 `useDark` 负责深色模式。

### 3.7 构建布局

- 运行时库：根目录 `tsc` 编译 `src/` → `dist/`；
- studio：`vite build` 出前端、`node backend.build.ts`（esbuild，需 Node 22.18+ 原生运行 TS）出后端，统一落到根目录 `dist/hey-i18n-studio/`；
- 根 `package.json` 的 bin 指向该后端入口；发布前的 `prepare/prepack` 自动化尚未补齐。

## 4. 目录职责速查

```text
src/hey-i18n/
├── config.ts        # 读取 /i18n 配置与语言包 glob
├── locales.ts       # 语言包加载、语言切换、RTL/lang 处理
├── languages.ts     # 语言元数据（唯一来源）
└── translate.ts     # T`` 模板标签实现与回退

studio/backend/
├── http/            # Node 原生 HTTP：静态资源 + POST /rpc
├── rpc/             # RPC 执行器与能力命名空间
├── interface/       # RPC 薄封装
└── services/        # project / scaner / assets / config 文件逻辑

studio/frontend/
├── models/          # 集中式 reactive 状态与数据加载
├── views/           # Explorer / Editor / SystemBar 等视图
├── dialogs/         # 自定义对话框框架与设置页
├── rpc/backend.ts   # Proxy 类型化 RPC 客户端
└── utils/           # IndexedDB / promise / 文本工具
```

## 5. 状态与已知缺口

仓库处于 v0.0.1 原型阶段。AI 翻译、复数分发与编辑目前是**占位或未实现**（详见 README Roadmap），涉及这些功能时不要声称"已支持"。失效 key 的统计/筛选/清理、扫描去重与语言文件名校验已实现。其余已知问题（key 碰撞、`--expose` 安全等）均记录在 README 的 Roadmap 中。

## 6. 风格约定

- 注释与文档以中文为主，代码标识符用英文；
- 提交信息遵循 `type：描述`（全角冒号），type 用 feat / fix / style / refactor / docs / chore / perf / build；
- 服务层方法同步抛错，RPC 层负责转成 `{ error }` 响应；
- 不引入新的状态管理方案或 HTTP 框架，除非先讨论。
