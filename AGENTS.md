# AGENTS.md

本文件用于引导在本仓库工作的 AI 代理。**开始任何改动前**，请先完整阅读：

1. [README.md](./README.md) —— 产品定位、快速开始、Roadmap；
2. [docs/design.md](./docs/design.md) —— 设计目标、关键取舍、架构与数据流。

## 项目是什么

hey-i18n 是面向 Vite 项目的「源码即文案」国际化方案：开发者用 `T\`...\``写原文，hey-i18n-studio 扫描这些字符串并提供可视化翻译，译文写回`i18n/*.json`，运行时按语言加载、缺译回退原文。仓库同时包含运行时库（`src/`）与翻译工作台（`studio/`），当前为 v0.0.1 原型阶段。

## 红线

- **不要**把项目改造成"key + 消息文件"的传统 i18n 模型——源码即 key 是核心定位，方向性改动须先与仓库所有者确认；
- **不要**改动 `texts` + `varIndexes` 的存储语义，除非一并解决复数接入与可读性/性能的权衡；
- 语言代码/名称/RTL 集合只允许在 `src/hey-i18n/languages.ts` 维护，studio 侧保持 re-export；
- 资源文件的写操作统一走 `studio/backend/services/assets.ts` 的归一化逻辑，不要在其他位置复制；
- 复数字段（`isPlural` / `pluralVarIndex` / `pluralCategory`）是「other 为基底」的预留结构，未实现完成前不要宣称已支持；
- AI 翻译目前是占位/未实现；复数（运行时 + studio 编辑器）已完成，README Roadmap 有清单，改动时勿误报状态；
- **禁止**把任何 token / 密钥提交进版本库；本仓库远程公开，仓库内凭据只存在于 `.git/.github-credentials`，不得复制或移动到被跟踪文件。

## 目录速览

```text
src/hey-i18n/       运行时库（translate / locales / languages / config）
studio/backend/     Node HTTP + RPC + services（project/scaner/assets/config）
studio/frontend/    Vue3 工作台（models 集中状态、views、dialogs）
docs/               设计文档
```

## 代码约定

- 前端状态集中在 `models/` 的 reactive 单例（`mExplorer` / `mEditor` / `mSystemBar`），组件保持薄层；
- 命名：`mXxx` 数据、`fXxx` 方法、`cXxx` 常量/选项；异步数据用 `useReactivePromise`（`{ d, e, l, update }`）；
- 用户提示统一走 `Notify`（ok / fail / progress / loading）；
- 新增后端能力：`services/` 实现 → `interface/` 暴露 → 挂到 `rpc-expose.ts`，前端类型即可用；
- 注释与文档以中文为主；不引入新的状态管理或 HTTP 框架，除非先讨论。

## 构建与运行

```bash
# 运行时库
npm install && npm run build

# studio 整体构建（需要 Node 22.18+；产物在根目录 dist/hey-i18n-studio/）
cd studio && npm install && npm run build:all

# 在目标项目根目录运行 studio（以 cwd 为目标项目）
node dist/hey-i18n-studio/backend/main.js

# 质量检查与端到端测试
npm run lint
npm run format:check
npm run test:e2e   # 需要先安装 demo 依赖与 Playwright 浏览器
```

## 提交约定

- 提交信息用 `type：描述`（全角冒号）：feat / fix / style / refactor / docs / chore / perf / build；
- 默认使用当前 git 配置的作者身份（如需按仓库所有者身份提交，先与用户确认再改 `user.name` / `user.email`）；
- 本仓库当前采用直接 push main 的工作流，提交后是否推送按用户指示执行。
