# OpenCode 文件上传/下载功能实施方案

> **日期**: 2026-03-08  
> **目标**: 为 OpenCode Desktop 文件树添加上传/下载功能  
> **预计时间**: 1-2 小时

---

## 📊 当前状态分析

### ✅ 已有功能

| 功能 | 状态 | 实现位置 |
|------|------|---------|
| 文件树显示 | ✅ | `packages/app/src/components/file-tree.tsx` |
| 文件拖拽（项目内） | ✅ | `file-tree.tsx` (draggable) |
| 文件选择对话框 | ✅ | Tauri plugin-dialog |
| Shell 命令执行 | ✅ | Tauri plugin-shell |
| 文件监控 | ✅ | `packages/app/src/context/file/watcher.ts` |

### ❌ 缺失功能

- ❌ **文件上传**（外部文件 → 项目）
- ❌ **文件下载**（项目文件 → 本地）
- ❌ **拖拽上传**（从桌面拖入）

---

## 🎯 实施方案

### 技术选型：混合方案（推荐）⭐⭐⭐⭐⭐

**组合使用**：
- **小文件**：使用 Shell 命令（简单快速，无需额外依赖）
- **大文件**：使用 Web API + Shell（支持进度）
- **拖拽上传**：使用 HTML5 Drag & Drop API

**优势**：
- ✅ 无需添加新依赖（使用现有 Tauri 插件）
- ✅ 跨平台兼容（macOS/Windows/Linux）
- ✅ 实现简单，维护成本低
- ✅ 渐进增强（可后续优化）

---

## 🔧 实施步骤

### 阶段 1: 核心功能（1-2 小时）

#### 任务清单

- [x] 创建方案文档
- [ ] 添加文件上传工具函数
- [ ] 添加文件下载工具函数
- [ ] 在 file-tree.tsx 添加上传按钮
- [ ] 在 file-tree.tsx 添加右键下载菜单
- [ ] 测试基础文件操作

#### 文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `packages/app/src/utils/file-upload.ts` | 新建 | 上传功能实现 |
| `packages/app/src/utils/file-download.ts` | 新建 | 下载功能实现 |
| `packages/app/src/components/file-tree.tsx` | 修改 | 添加 UI 和事件处理 |

---

## 💻 详细实现

### 1. 文件上传实现

**文件**: `packages/app/src/utils/file-upload.ts`

```typescript
import { dialog, shell } from "@tauri-apps/api"
import { basename } from "path"

/**
 * 上传文件到指定目录
 * @param targetDir 目标目录（项目路径）
 * @returns 上传的文件数量
 */
export async function uploadFiles(targetDir: string): Promise<number> {
  try {
    // 1. 打开文件选择对话框
    const selected = await dialog.open({
      multiple: true,
      directory: false,
      defaultPath: targetDir,
      title: "选择要上传的文件",
    })

    if (!selected) return 0

    const files = Array.isArray(selected) ? selected : [selected]
    let successCount = 0

    // 2. 复制文件到目标目录
    for (const file of files) {
      try {
        const filename = basename(file)
        const target = `${targetDir}/${filename}`

        // 使用 cp 命令复制文件
        await shell.execute("cp", [file, target])
        successCount++
      } catch (error) {
        console.error(`Failed to upload ${file}:`, error)
      }
    }

    return successCount
  } catch (error) {
    console.error("Upload failed:", error)
    throw error
  }
}

/**
 * 上传文件夹到指定目录
 * @param targetDir 目标目录
 * @returns 是否成功
 */
export async function uploadFolder(targetDir: string): Promise<boolean> {
  try {
    const selected = await dialog.open({
      directory: true,
      multiple: false,
      defaultPath: targetDir,
      title: "选择要上传的文件夹",
    })

    if (!selected) return false

    const foldername = basename(selected as string)
    const target = `${targetDir}/${foldername}`

    // 使用 cp -r 命令复制文件夹
    await shell.execute("cp", ["-r", selected as string, target])

    return true
  } catch (error) {
    console.error("Folder upload failed:", error)
    throw error
  }
}
```

---

### 2. 文件下载实现

**文件**: `packages/app/src/utils/file-download.ts`

```typescript
import { dialog, shell } from "@tauri-apps/api"
import { basename } from "path"

/**
 * 下载文件到本地
 * @param sourcePath 源文件路径
 * @returns 保存的路径
 */
export async function downloadFile(sourcePath: string): Promise<string | null> {
  try {
    const filename = basename(sourcePath)

    // 1. 打开保存对话框
    const destination = await dialog.save({
      defaultPath: filename,
      title: "保存文件",
    })

    if (!destination) return null

    // 2. 复制文件
    await shell.execute("cp", [sourcePath, destination])

    return destination
  } catch (error) {
    console.error("Download failed:", error)
    throw error
  }
}

/**
 * 下载文件夹到本地
 * @param sourcePath 源文件夹路径
 * @returns 保存的路径
 */
export async function downloadFolder(sourcePath: string): Promise<string | null> {
  try {
    const foldername = basename(sourcePath)

    // 1. 选择保存位置（文件夹）
    const destination = await dialog.open({
      directory: true,
      multiple: false,
      title: "选择保存位置",
    })

    if (!destination) return null

    // 2. 复制文件夹
    const target = `${destination}/${foldername}`
    await shell.execute("cp", ["-r", sourcePath, target])

    return target
  } catch (error) {
    console.error("Folder download failed:", error)
    throw error
  }
}
```

---

### 3. UI 集成

**修改**: `packages/app/src/components/file-tree.tsx`

#### 3.1 添加上传按钮

**位置**: 文件树顶部工具栏

```typescript
// 在工具栏添加
<button
  onClick={async () => {
    const count = await uploadFiles(projectPath)
    if (count > 0) {
      // 刷新文件树
      await refreshTree()
    }
  }}
  class="flex items-center gap-1 px-2 py-1 text-xs hover:bg-surface-hover"
>
  <Icon name="upload" />
  <span>上传</span>
</button>
```

#### 3.2 添加右键下载菜单

**位置**: 文件节点右键菜单

```typescript
<ContextMenu>
  <MenuItem onClick={() => openFile(path)}>打开</MenuItem>
  <MenuItem onClick={() => renameFile(path)}>重命名</MenuItem>
  <MenuItem 
    onClick={async () => {
      const saved = await downloadFile(path)
      if (saved) {
        showNotification("下载完成", `文件已保存到 ${saved}`)
      }
    }}
  >
    📥 下载
  </MenuItem>
  <MenuItem onClick={() => deleteFile(path)}>删除</MenuItem>
</ContextMenu>
```

#### 3.3 添加拖拽上传

**位置**: 文件树容器

```typescript
<div
  class="file-tree-container"
  onDragOver={(e) => {
    e.preventDefault()
    e.stopPropagation()
    // 添加拖拽高亮样式
    e.currentTarget.classList.add("drag-over")
  }}
  onDragLeave={(e) => {
    e.currentTarget.classList.remove("drag-over")
  }}
  onDrop={async (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove("drag-over")

    // 获取拖拽的文件
    const files = Array.from(e.dataTransfer.files)
    
    // 读取并保存文件
    for (const file of files) {
      try {
        const content = await file.arrayBuffer()
        const targetPath = `${projectPath}/${file.name}`
        
        // 使用 Tauri shell 写入文件
        await shell.execute("cat", [">", targetPath], {
          input: new Uint8Array(content)
        })
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
      }
    }

    // 刷新文件树
    await refreshTree()
  }}
>
  {/* 原有文件树内容 */}
</div>
```

---

## 🎨 UI/UX 设计

### 工具栏布局

```
┌─────────────────────────────────────┐
│ 📁 项目名称        [📤上传] [🔄刷新] │
├─────────────────────────────────────┤
│ 📂 src/                             │
│   ├─ 📄 index.ts                    │
│   └─ 📄 app.tsx                     │
│ 📂 public/                          │
│   └─ 📄 favicon.ico                 │
└─────────────────────────────────────┘
```

### 右键菜单

```
📄 filename.ts
├─ 📖 打开
├─ ✏️ 重命名
├─ 📥 下载
├─ 📋 复制路径
└─ 🗑️ 删除
```

### 拖拽提示

```
┌─────────────────────────────────────┐
│                                     │
│          📁 拖放文件到此处           │
│                                     │
└─────────────────────────────────────┘
```

**CSS 样式**：

```css
.file-tree-container.drag-over {
  background: var(--color-surface-hover);
  border: 2px dashed var(--color-border-focus);
  border-radius: 4px;
}

.file-tree-container.drag-over::after {
  content: "📁 拖放文件到此处";
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: var(--color-text-muted);
}
```

---

## 🔐 安全考虑

### 权限控制

OpenCode 已有权限系统，需要在以下位置添加权限检查：

```typescript
// 在执行上传/下载前检查权限
await ctx.ask({
  permission: "file_transfer",
  patterns: [targetPath],
  metadata: { action: "upload" }
})
```

### 路径验证

```typescript
// 确保目标路径在项目目录内
function validatePath(targetPath: string, projectPath: string): boolean {
  const resolved = path.resolve(projectPath, targetPath)
  return resolved.startsWith(projectPath)
}
```

### 文件类型限制（可选）

```typescript
const ALLOWED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json", ".md"]

function isAllowed(filename: string): boolean {
  const ext = path.extname(filename)
  return ALLOWED_EXTENSIONS.includes(ext)
}
```

---

## ⚡ 性能优化

### 1. 批量操作

```typescript
// 批量上传时使用 Promise.all
async function batchUpload(files: string[], targetDir: string) {
  const results = await Promise.allSettled(
    files.map(file => uploadFile(file, targetDir))
  )
  
  const succeeded = results.filter(r => r.status === 'fulfilled')
  return succeeded.length
}
```

### 2. 大文件处理

```typescript
// 对于大文件（> 10MB），显示进度
async function uploadLargeFile(file: File, targetPath: string) {
  const chunkSize = 1024 * 1024 // 1MB
  const chunks = Math.ceil(file.size / chunkSize)
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    
    await appendChunk(targetPath, chunk)
    
    // 更新进度
    updateProgress((i + 1) / chunks * 100)
  }
}
```

---

## 📊 测试计划

### 单元测试

- [ ] 文件上传功能测试
- [ ] 文件下载功能测试
- [ ] 路径验证测试
- [ ] 错误处理测试

### 集成测试

- [ ] UI 交互测试
- [ ] 拖拽上传测试
- [ ] 右键菜单测试
- [ ] 多文件操作测试

### 端到端测试

- [ ] 上传 → 编辑 → 下载流程
- [ ] 大文件上传测试
- [ ] 文件夹操作测试
- [ ] 跨平台兼容性测试（macOS/Windows）

---

## 🚀 发布计划

### Phase 1: 基础版本（当前）

- ✅ 单文件上传/下载
- ✅ 右键菜单
- ✅ 基本错误处理

### Phase 2: 增强版本（1 周后）

- 📦 文件夹上传/下载
- 📦 拖拽上传
- 📦 进度显示
- 📦 批量操作

### Phase 3: 专业版本（按需）

- 📦 大文件支持
- 📦 断点续传
- 📦 文件预览
- 📦 压缩/解压

---

## 📝 维护指南

### 同步官方更新

```bash
# 1. 拉取最新代码
git fetch upstream
git checkout dev
git merge upstream/dev

# 2. 如果 file-tree.tsx 有冲突，手动合并
# 保留我们的上传/下载按钮，合并其他改动

# 3. 测试功能
bun test

# 4. 推送到 fork
git push fork dev
```

### 常见问题

**Q: 上传后文件树不刷新？**

A: 检查 `refreshTree()` 函数是否正确调用

**Q: Windows 上 cp 命令失败？**

A: Windows 需要使用 `copy` 命令，添加平台判断：

```typescript
const copyCmd = process.platform === 'win32' ? 'copy' : 'cp'
await shell.execute(copyCmd, [source, target])
```

**Q: 大文件上传卡住？**

A: 添加超时和进度监控，或使用流式传输

---

## 📚 参考资料

### Tauri 文档

- [Dialog Plugin](https://tauri.app/v2/api/javascript/dialog/)
- [Shell Plugin](https://tauri.app/v2/api/javascript/shell/)
- [File System API](https://tauri.app/v2/api/javascript/fs/)

### Web API

- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

---

## ✅ 验收清单

### 功能验收

- [ ] 可以通过按钮上传文件
- [ ] 可以通过右键菜单下载文件
- [ ] 拖拽文件到文件树可以上传
- [ ] 上传后文件树自动刷新
- [ ] 下载后显示保存位置
- [ ] 支持多文件批量操作
- [ ] 错误提示清晰友好

### 质量验收

- [ ] 代码符合 OpenCode 风格
- [ ] 无内存泄漏
- [ ] 无控制台错误
- [ ] 跨平台兼容
- [ ] 性能良好（< 1s 响应）

---

## 👥 贡献者

- **实施**: OpenCode AI Assistant
- **用户**: shuge
- **日期**: 2026-03-08

---

**最后更新**: 2026-03-08  
**文档版本**: 1.0
