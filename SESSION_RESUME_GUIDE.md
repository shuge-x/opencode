# OpenCode Fork 开发会话恢复指南

> **最后更新**: 2026-03-08  
> **会话日期**: 2026-03-07 ~ 2026-03-08  
> **仓库**: https://github.com/shuge-x/opencode

---

## 🎯 项目概述

### 目标
基于官方 OpenCode 开发自定义版本，添加以下功能：
1. ✅ 内置 DuckDB 工具（无需外部安装）
2. ✅ 文件上传/下载功能
3. ✅ 跨平台支持（macOS ARM/Intel, Windows）

### 当前状态
- ✅ 功能已实现并推送
- ✅ 文档已完善
- ⏳ GitHub Actions 正在构建（Run ID: 22809622397）

---

## 📁 仓库信息

### Fork 地址
- **你的 Fork**: https://github.com/shuge-x/opencode
- **官方仓库**: https://github.com/anomalyco/opencode
- **本地路径**: `/Users/shuge/ai-code/github/opencode`
- **默认分支**: `dev`
- **功能分支**: 已合并到 `dev`

### Git Remote 配置
```bash
origin  = https://github.com/anomalyco/opencode.git (官方)
fork    = https://github.com/shuge-x/opencode.git (你的 fork)
upstream = https://github.com/anomalyco/opencode.git (官方)
```

---

## 🔧 已实施的功能

### 1. DuckDB 集成

#### 修改的文件
```
.opencode/tool/duckdb.ts                  # DuckDB 工具实现
.opencode/tool/duckdb.txt                 # 工具说明文档
package.json                               # 添加 @duckdb/node-api 依赖
.opencode/opencode.jsonc                  # 启用 DuckDB 工具
```

#### 功能特性
- ✅ 支持 SQL 查询执行
- ✅ 支持内存和文件数据库
- ✅ 自动权限检查
- ✅ 跨平台支持（内置原生二进制）

#### 测试方法
```bash
# 在 OpenCode 中执行
用户: "Create a DuckDB table with test data"
AI: [使用 duckdb 工具执行 SQL]
```

---

### 2. 文件上传/下载

#### 修改的文件
```
packages/app/src/utils/file-upload.ts           # 上传功能
packages/app/src/utils/file-download.ts         # 下载功能
packages/app/src/pages/session/session-side-panel.tsx  # UI 集成
```

#### 功能特性
- ✅ 多文件上传（使用 Tauri dialog）
- ✅ 单文件下载（选择保存位置）
- ✅ 批量下载
- ✅ 跨平台支持（macOS/Windows/Linux）

#### 使用方法
1. 打开 OpenCode Desktop app
2. 点击文件树 "All Files" 标签
3. 点击右上角上传按钮（云图标）
4. 选择文件，自动上传

---

### 3. GitHub Actions 构建配置

#### 修改的文件
```
.github/workflows/fork-build.yml    # 新建：Fork 专用构建流程
.github/workflows/publish.yml        # 修改：移除私有 runner 限制
```

#### 构建状态查询
```bash
# 查看最新构建
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/shuge-x/opencode/actions/runs?per_page=5" | jq

# 或访问网页
https://github.com/shuge-x/opencode/actions
```

---

## 📚 关键文档索引

### 1. DuckDB 集成报告
**文件**: `DUCKDB_INTEGRATION_REPORT.md`

**内容**:
- 完整的实施细节
- 代码修改说明
- 使用文档
- 故障排查指南
- 后续维护策略

**快速查看**:
```bash
cat DUCKDB_INTEGRATION_REPORT.md
```

---

### 2. 文件上传下载实施方案
**文件**: `FILE_UPLOAD_DOWNLOAD_IMPLEMENTATION.md`

**内容**:
- 技术方案对比
- 详细实现步骤
- UI/UX 设计
- 安全考虑
- 性能优化
- 测试计划

**快速查看**:
```bash
cat FILE_UPLOAD_DOWNLOAD_IMPLEMENTATION.md
```

---

### 3. 合并策略指南
**文件**: `MERGE_STRATEGY.md`

**内容**:
- 修改分类与冲突风险评估
- 详细合并流程（3种场景）
- 合并工具推荐
- 维护策略（每周/版本/自动化）
- 最佳实践
- 常见问题解决方案
- 成本估算

**快速查看**:
```bash
cat MERGE_STRATEGY.md
```

---

### 4. 会话恢复指南
**文件**: `SESSION_RESUME_GUIDE.md`（本文件）

**用途**: 快速恢复开发上下文

---

## 🔍 快速恢复步骤

### 方法 1: 查看 Git 历史（最快）

```bash
cd /Users/shuge/ai-code/github/opencode

# 查看最近的提交
git log --oneline --graph --all -20

# 查看你的修改
git log --author="shuge" --oneline

# 查看特定功能的提交
git log --grep="DuckDB" --oneline
git log --grep="upload\|download" --oneline

# 查看文件修改历史
git log --stat --oneline -10
```

---

### 方法 2: 查看文档索引

```bash
cd /Users/shuge/ai-code/github/opencode

# 列出所有文档
ls -la *.md

# 查看文档内容
cat DUCKDB_INTEGRATION_REPORT.md
cat FILE_UPLOAD_DOWNLOAD_IMPLEMENTATION.md
cat MERGE_STRATEGY.md
cat SESSION_RESUME_GUIDE.md
```

---

### 方法 3: 查看修改文件列表

```bash
cd /Users/shuge/ai-code/github/opencode

# 查看你的修改（相比官方 dev 分支）
git diff upstream/dev --stat

# 查看详细差异
git diff upstream/dev

# 查看新增文件
git diff upstream/dev --diff-filter=A --name-only

# 查看修改文件
git diff upstream/dev --diff-filter=M --name-only
```

---

## 📊 关键 Git 提交记录

### 最新 10 个提交

```
23cef74 - docs: add comprehensive merge strategy guide
e043d1f - feat: add file upload/download functionality
ec651fd - fix: use official setup-bun action
e50c424 - feat: add fork-specific build workflow with public runners
c5b6c21 - chore: enable GitHub Actions on fork
8717b37 - Merge branch 'dev' of github.com:shuge-x/opencode into dev
09df661 - feat: add DuckDB tool integration
... (之前是官方提交)
```

### 按功能分类

#### DuckDB 集成
```
09df661 - feat: add DuckDB tool integration
```

#### 文件上传下载
```
e043d1f - feat: add file upload/download functionality
```

#### GitHub Actions
```
ec651fd - fix: use official setup-bun action
e50c424 - feat: add fork-specific build workflow
c5b6c21 - chore: enable GitHub Actions on fork
```

#### 文档
```
23cef74 - docs: add comprehensive merge strategy guide
```

---

## 🚀 快速开始新开发

### 场景 1: 继续之前的工作

```bash
# 1. 进入项目目录
cd /Users/shuge/ai-code/github/opencode

# 2. 查看当前状态
git status

# 3. 查看最近的提交
git log --oneline -10

# 4. 查看构建状态
# 访问: https://github.com/shuge-x/opencode/actions

# 5. 如果需要，同步官方更新
git fetch upstream
git merge upstream/dev
```

---

### 场景 2: 添加新功能

```bash
# 1. 创建新分支
git checkout -b feature/new-feature

# 2. 开发新功能
# ... 修改代码 ...

# 3. 测试
bun install
bun run typecheck
bun run dev:desktop

# 4. 提交
git add .
git commit -m "feat: add new feature"

# 5. 推送到 fork
git push fork feature/new-feature

# 6. 合并到 dev
git checkout dev
git merge feature/new-feature
git push fork dev

# 7. 触发构建
curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/shuge-x/opencode/actions/workflows/fork-build.yml/dispatches" \
  -d '{"ref":"dev","inputs":{"target":"macos-arm64"}}'
```

---

### 场景 3: 修复 Bug

```bash
# 1. 基于 dev 创建修复分支
git checkout dev
git checkout -b fix/bug-name

# 2. 修复 bug
# ... 修改代码 ...

# 3. 测试
bun test
bun run typecheck

# 4. 提交
git commit -am "fix: description of bug fix"

# 5. 推送并合并
git push fork fix/bug-name
git checkout dev
git merge fix/bug-name
git push fork dev
```

---

## 🔑 关键配置信息

### GitHub Token
- **获取方式**: GitHub Settings → Developer settings → Personal access tokens
- **权限**: repo, workflow
- **用途**: 推送代码、触发构建、API 调用
- **注意**: 请勿在代码或文档中明文存储 token

### Tauri 配置
- **Dialog Plugin**: 已配置 ✅
- **Shell Plugin**: 已配置 ✅
- **Capabilities**: `packages/desktop/src-tauri/capabilities/default.json`

### 依赖版本
- **Bun**: 1.3.10
- **DuckDB**: @duckdb/node-api@1.4.4-r.3
- **Tauri**: 2.9.5

---

## 📦 构建和下载

### 查看 latest 构建

**网页查看**:
```
https://github.com/shuge-x/opencode/actions
```

**API 查询**:
```bash
curl -s -H "Authorization: token YOUR_TOKEN" \
  "https://api.github.com/repos/shuge-x/opencode/actions/runs?per_page=1" | jq
```

### 下载构建产物

**如果构建完成**:
1. 访问: https://github.com/shuge-x/opencode/actions
2. 点击最新的成功构建（绿色勾）
3. 滚动到底部 "Artifacts" 区域
4. 下载 `opencode-desktop-macos-arm64`

---

## 🛠️ 开发环境设置

### 首次设置（如果需要）

```bash
# 1. Clone 你的 fork
git clone https://github.com/shuge-x/opencode.git
cd opencode

# 2. 添加官方 remote
git remote add upstream https://github.com/anomalyco/opencode.git

# 3. 安装依赖
bun install

# 4. 开发模式运行
bun run dev:desktop
```

### 日常开发

```bash
# 1. 拉取最新代码
git pull fork dev

# 2. 安装/更新依赖
bun install

# 3. 类型检查
bun run typecheck

# 4. 测试
bun test

# 5. 开发模式
bun run dev:desktop
```

---

## 📝 待办事项

### 短期优化（可选）
- [ ] 添加右键菜单下载选项
- [ ] 添加拖拽上传支持
- [ ] 添加上传进度提示
- [ ] 添加成功/失败通知

### 长期优化（按需）
- [ ] 大文件分片上传
- [ ] 断点续传
- [ ] 文件预览
- [ ] 提交功能到官方仓库

---

## 🆘 常见问题快速解决

### 问题 1: 忘记做了什么修改

```bash
# 查看所有修改文件
git diff upstream/dev --name-only

# 查看修改统计
git diff upstream/dev --stat

# 查看详细差异
git diff upstream/dev
```

### 问题 2: 构建失败了

```bash
# 1. 查看构建日志
# 访问: https://github.com/shuge-x/opencode/actions
# 点击失败的构建，查看详细日志

# 2. 本地测试
bun install
bun run typecheck
bun run build

# 3. 如果本地成功但 CI 失败，检查 CI 配置
cat .github/workflows/fork-build.yml
```

### 问题 3: 如何回退某个功能

```bash
# 1. 查看提交历史
git log --oneline -10

# 2. 回退某个提交
git revert <commit-hash>

# 3. 或者重置到某个提交
git reset --hard <commit-hash>
```

### 问题 4: 如何同步官方最新代码

```bash
# 参考 MERGE_STRATEGY.md 文档
cat MERGE_STRATEGY.md

# 快速同步
git fetch upstream
git merge upstream/dev
```

---

## 📞 支持资源

### 官方资源
- **OpenCode 文档**: https://opencode.ai/docs
- **OpenCode GitHub**: https://github.com/anomalyco/opencode
- **OpenCode Discord**: https://discord.gg/opencode

### 本地文档
```bash
# 查看所有文档
ls -la *.md

# DuckDB 集成
cat DUCKDB_INTEGRATION_REPORT.md

# 文件上传下载
cat FILE_UPLOAD_DOWNLOAD_IMPLEMENTATION.md

# 合并策略
cat MERGE_STRATEGY.md
```

---

## 🎯 快速命令参考

### Git 操作
```bash
git status                          # 查看状态
git log --oneline -10              # 查看历史
git diff upstream/dev --stat       # 查看修改
git fetch upstream                  # 拉取官方更新
git merge upstream/dev             # 合并官方更新
git push fork dev                  # 推送到 fork
```

### 开发操作
```bash
bun install                        # 安装依赖
bun run typecheck                  # 类型检查
bun test                           # 运行测试
bun run dev:desktop                # 开发模式
bun run build                      # 构建
```

### GitHub Actions
```bash
# 触发构建（macOS ARM）
curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/shuge-x/opencode/actions/workflows/fork-build.yml/dispatches" \
  -d '{"ref":"dev","inputs":{"target":"macos-arm64"}}'

# 查看构建状态
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/shuge-x/opencode/actions/runs?per_page=3" | jq
```

---

## 📋 会话恢复检查清单

下次回来时，执行以下步骤快速恢复：

- [ ] `cd /Users/shuge/ai-code/github/opencode`
- [ ] `git status` - 查看当前状态
- [ ] `git log --oneline -10` - 查看最近提交
- [ ] `cat SESSION_RESUME_GUIDE.md` - 阅读本指南
- [ ] 访问 https://github.com/shuge-x/opencode/actions - 检查构建
- [ ] 决定下一步：继续开发 / 修复 bug / 添加功能

---

## 🔖 书签

**最重要的链接**:
- 你的 Fork: https://github.com/shuge-x/opencode
- Actions: https://github.com/shuge-x/opencode/actions
- 本地路径: `/Users/shuge/ai-code/github/opencode`

**最重要的文档**:
- `SESSION_RESUME_GUIDE.md` - 本文件（快速恢复）
- `MERGE_STRATEGY.md` - 合并策略
- `DUCKDB_INTEGRATION_REPORT.md` - DuckDB 集成
- `FILE_UPLOAD_DOWNLOAD_IMPLEMENTATION.md` - 文件上传下载

**最重要的命令**:
- `git log --oneline -10` - 查看历史
- `git diff upstream/dev --stat` - 查看修改
- `bun run dev:desktop` - 开发模式

---

**最后更新**: 2026-03-08  
**文档版本**: 1.0  
**下次会话**: 直接查看本文件即可快速恢复！🚀
