# hey-i18n

> 面向 Vite 项目的「源码即文案」轻量国际化方案 + 可视化翻译工作台。

`hey-i18n` 是一个运行时国际化库，`hey-i18n-studio` 是配套的可视化翻译工具。

当前版本：**v0.0.1（原型阶段）**，尚未发布，部分功能仍在开发中，详见 [Roadmap](#roadmap--已知限制)。

---

## 设计目标

传统的 i18n 方案需要开发者先维护一套 key（如 `t('hello.world')`），翻译者再对照 key 翻译，key 与源码、与译文之间容易出现漂移。

hey-i18n 的思路是 **「源码即文案」**：

1. 开发者在代码里直接写原文：`T\`Hello, ${name}!\``，不需要设计 key；
2. 翻译者在 `hey-i18n-studio` 的对照表格里直接看到原文并填写译文，无需接触代码；
3. 译文写回项目的 `i18n/*.json`，运行时按当前语言自动加载，找不到译文时回退原文。

这样文案只有一个来源（代码），翻译工作流与源码改动天然同步，适合文案量不大、希望低成本国际化的小型 Vite 项目。

## 功能特性

### 运行时库（hey-i18n）

- 标签模板语法 `T\`...\``，支持插值变量；
- 按需动态加载 `i18n/*.json` 语言包（基于 Vite `import.meta.glob`）；
- 语言跟随系统或手动切换（持久化在 `localStorage`）；
- 自动设置 `<html lang>` 与 RTL 书写方向；
- 内置约 180 个 BCP-47 语言代码表，支持 `defineLocaleNames` 自定义语言名称；
- 无 key 管理成本：匹配不到译文时自动回退原文。

### 翻译工作台（hey-i18n-studio）

- 扫描源码中的 `T\`...\`` 字符串并建立 key 缓存；
- 多语言资源文件管理（创建语言、进度统计、删除）；
- 原文/译文对照编辑，支持变量补全提示；
- 未保存修改的 `*` 标记、关闭确认与 IndexedDB 标签页恢复；
- 项目配置（源语言 / 默认语言）可视化修改；
- 首次进入自动初始化向导。

## 目录结构

```text
hey-i18n/
├── src/                      # 运行时库源码
│   ├── main.ts               # 库入口
│   └── hey-i18n/
│       ├── config.ts         # 读取 /i18n 配置
│       ├── locales.ts        # 语言包加载与语言管理
│       ├── languages.ts      # 语言代码/名称表、RTL 集合
│       └── translate.ts      # T`` 标签模板实现
├── studio/                   # hey-i18n-studio（Vue 3 + Vite + Element Plus）
│   ├── backend/              # Node HTTP 服务、RPC、扫描/资源服务
│   └── frontend/             # 翻译工作台前端
├── docs/
├── package.json
└── LICENSE
```

## 快速开始

> 包尚未发布，以下安装步骤按本地/发布后的通用流程描述；集成形态（npm 包预编译产物如何配合 Vite 的 `import.meta.glob`）仍在验证中，见 [Roadmap](#roadmap--已知限制)。

### 1. 安装

```bash
npm install hey-i18n
```

### 2. 准备 i18n 目录

在 Vite 项目根目录创建 `i18n/` 目录，包含语言包与配置文件：

```text
i18n/
├── .hey-i18n-config   # 项目国际化配置
├── en-US.json         # 英文语言包
└── zh-CN.json         # 简体中文语言包
```

`.hey-i18n-config` 由 studio 生成，内容为：

```ts
// 该文件是自动生成的，请在 hey-i18n-studio 中修改。

export default {
    "sourcesLocale": "en-US",
    "defaultLocale": "system"
};
```

配置项：

| 字段 | 说明 |
| --- | --- |
| `sourcesLocale` | 源码中书写原文的语言，如 `en-US` |
| `defaultLocale` | 用户首次访问时的语言；`system` 表示跟随浏览器系统语言，也可固定为某个语言代码 |

### 3. 在代码中使用

```ts
import T, { switchLocale } from 'hey-i18n';

// 直接写原文，变量用 ${} 插值
const tip = T`Hello, ${name}!`;

// 切换语言（默认会刷新页面）
switchLocale('zh-CN');
```

更多导出：

```ts
import {
    availableLocales, // 当前可用语言列表
    currentLocale,    // 当前语言
    isRtlLocale,      // 当前语言是否 RTL
    localeNames,      // 语言代码 -> 语言名称
    defineLocaleNames // 自定义/合并语言名称
} from 'hey-i18n';
```

### 4. 使用 hey-i18n-studio 翻译

在目标 Vite 项目根目录运行：

```bash
# 启动图形界面（默认 http://localhost:3034）
hey-i18n-studio

# 指定端口并自动打开浏览器
hey-i18n-studio -p 4000 -o

# 扫描 ./src 中的 T`` 字符串并更新 key 缓存
hey-i18n-studio lint
```

首次打开时，如果没有 `i18n/` 目录，会弹出初始化向导；之后在左侧创建语言资源、扫描项目原文，双击语言文件即可开始对照翻译。

## 语言包格式

语言包是 JSON 文件，文件名即语言代码（如 `zh-CN.json`）。内容为 key 到译文的映射，**建议始终通过 hey-i18n-studio 编辑，不要手工构造**：

```json
// i18n/zh-CN.json
{
    "Hello, !": {
        "texts": ["你好，", "！"],
        "varIndexes": [0]
    }
}
```

对应源码 `T\`Hello, ${name}!\``：

- `key`：源码原文去掉 `${...}` 后拼接而成（本例为 `Hello, !`）；
- `texts`：译文按变量切分后的文本片段；
- `varIndexes`：每个片段间隙对应源码第几个插值参数（从 0 开始）。

保留字段（规划中，暂未启用）：`isPlural`、`pluralVarIndex`、`pluralCategory`。

## 开发与构建

### 运行时库

```bash
npm install
npm run build     # tsc 编译 src -> dist/
```

### hey-i18n-studio

```bash
cd studio
npm install

# 本地开发：后端（需要 bun，默认端口 3034）
npm run build:server
node ../dist/hey-i18n-studio/backend/main.js

# 本地开发：前端（http://localhost:8082，/rpc 代理到 3034）
npm run dev

# 整体构建：前端 + 后端 -> 根目录 dist/hey-i18n-studio/
npm run build:all
```

`hey-i18n-studio` 会以**当前工作目录**为目标项目，请务必在需要翻译的项目根目录运行；同时要求该项目是 Vite 项目（`package.json` 中声明了 `vite` 依赖）。

## Roadmap & 已知限制

当前属于原型阶段，以下内容尚未完成或需要验证：

- **复数支持**：数据模型预留了 `pluralCategory` 等字段，但运行时分发与编辑器尚未实现；
- **AI 翻译**：设置页与按钮仅为 UI 占位，未接入任何接口；
- **失效 key 管理**：「失效的键」统计与筛选未实现，语言包中的残留键暂无法在界面中清理；
- **发布/集成形态**：运行时依赖 Vite 在编译期转换 `import.meta.glob('/i18n/*.json')`，以 npm 包形式发布后如何被消费（源码入口 / Vite 插件 / 虚拟模块）仍需验证与明确；
- **扫描器**：目前基于正则匹配 `T\`...\``，不支持跨行、嵌套反引号或含 `}` 的复杂表达式，且同一原文多处出现时未去重；
- **工作台自身**：界面语言暂固定为简体中文；部分菜单（全屏编辑、清空内容）尚未实现；
- **安全性**：studio 为本地开发工具，RPC 无鉴权、文件名未做严格校验，请勿在 `--expose` 下对不可信网络开放；
- **工程化**：尚无自动化测试与 CI，README 中的示例项目待补充。

## License

[MIT](./LICENSE)

Copyright (c) 2026 heyManNice
