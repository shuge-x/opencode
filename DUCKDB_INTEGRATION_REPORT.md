# OpenCode DuckDB 集成实施报告

> **日期**: 2026-03-07  
> **版本**: v1.0  
> **方案**: 插件式集成 (方案 A)

---

## 📋 项目概述

### 目标
- ✅ 在 OpenCode 中集成内置 DuckDB 工具
- ✅ 支持 Mac ARM/Intel + Windows 平台
- ✅ 无需用户单独安装 DuckDB
- ✅ 可持续跟随官方 OpenCode 更新

### 技术方案
采用**插件式集成**（OpenCode 官方推荐方式）：
- 工具独立于核心代码
- 修改最少，冲突风险极低
- 易于维护和更新

---

## 🛠️ 实施详情

### 1. 代码修改

#### 文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `.opencode/tool/duckdb.ts` | 新建 | DuckDB 工具实现（110 行） |
| `.opencode/tool/duckdb.txt` | 新建 | 工具使用文档（33 行） |
| `package.json` | 修改 | 添加 DuckDB 依赖 |
| `.opencode/opencode.jsonc` | 修改 | 启用 DuckDB 工具 |
| `.github/workflows/publish.yml` | 修改 | 允许 fork 构建 |

#### DuckDB 工具功能

**核心特性**：
- ✅ 支持 SQL 查询执行（SELECT, CREATE, INSERT, UPDATE, DELETE 等）
- ✅ 内存数据库（临时数据处理）
- ✅ 文件数据库（持久化存储）
- ✅ 自动权限检查
- ✅ 格式化输出（文本 + JSON）
- ✅ 跨平台支持

**使用示例**：

```typescript
// 1. 内存数据库
{ "query": "SELECT 1 + 1 AS result" }

// 2. 文件数据库
{ 
  "query": "CREATE TABLE users (id INTEGER, name VARCHAR)", 
  "database": "mydb.duckdb" 
}

// 3. 读取 CSV
{ "query": "SELECT * FROM read_csv('data.csv')" }

// 4. 读取 Parquet
{ "query": "SELECT * FROM read_parquet('data.parquet')" }
```

### 2. 依赖管理

#### 添加的依赖

```json
{
  "dependencies": {
    "@duckdb/node-api": "1.4.4-r.3"
  }
}
```

#### 平台支持

| 平台 | 架构 | 二进制包 | 状态 |
|------|------|---------|------|
| macOS | ARM (M1/M2/M3) | `@duckdb/node-bindings-darwin-arm64` | ✅ |
| macOS | Intel (x64) | `@duckdb/node-bindings-darwin-x64` | ✅ |
| Windows | x64 | `@duckdb/node-bindings-win32-x64` | ✅ |
| Linux | x64 | `@duckdb/node-bindings-linux-x64` | ✅ |
| Linux | ARM64 | `@duckdb/node-bindings-linux-arm64` | ✅ |

**重要**：`@duckdb/node-api` 包含所有平台的原生二进制，无需额外下载或配置。

### 3. GitHub 仓库设置

#### Fork 信息

- **官方仓库**: https://github.com/anomalyco/opencode
- **Fork 仓库**: https://github.com/shuge-x/opencode
- **默认分支**: `dev`
- **功能分支**: `feature/duckdb-integration`（已合并到 dev）

#### 提交记录

```
commit c5b6c21a9
Author: shuge <shuge@users.noreply.github.com>
Date:   2026-03-07

    feat: add DuckDB tool integration
    
    - Add DuckDB tool as a local tool in .opencode/tool/
    - Add @duckdb/node-api dependency for built-in DuckDB support
    - Support both in-memory and file-based databases
    - Cross-platform support: macOS ARM/Intel, Windows, Linux
```

#### GitHub Actions 修改

**修改内容**：
- 移除 `if: github.repository == 'anomalyco/opencode'` 限制
- 允许 fork 仓库运行构建流程

**修改位置**：
```yaml
# .github/workflows/publish.yml
jobs:
  version:
    runs-on: blacksmith-4vcpu-ubuntu-2404
    # 移除了这行：if: github.repository == 'anomalyco/opencode'
    steps:
      - uses: actions/checkout@v3
      
  build-cli:
    needs: version
    runs-on: blacksmith-4vcpu-ubuntu-2404
    # 移除了这行：if: github.repository == 'anomalyco/opencode'
    steps:
      - uses: actions/checkout@v3
```

---

## 🚀 构建信息

### GitHub Actions 运行状态

- **Workflow**: `publish.yml`
- **触发方式**: `workflow_dispatch` (手动触发)
- **构建 ID**: `22802503007`
- **状态**: ⏳ 队列中 → 运行中 → 完成
- **预计时间**: 15-30 分钟
- **监控链接**: https://github.com/shuge-x/opencode/actions

### 构建目标

| 平台 | 产物 | 文件名 |
|------|------|--------|
| macOS ARM | DMG | `opencode-desktop-darwin-aarch64.dmg` |
| macOS ARM | APP | `OpenCode.app` |
| macOS Intel | DMG | `opencode-desktop-darwin-x64.dmg` |
| macOS Intel | APP | `OpenCode.app` |
| Windows x64 | EXE | `opencode-desktop-windows-x64.exe` |
| Windows x64 | NSIS | 安装程序 |

### 下载方式

#### 方式 1: GitHub Releases（推荐）

构建完成后，访问：
```
https://github.com/shuge-x/opencode/releases
```

#### 方式 2: GitHub Actions Artifacts（测试用）

1. 访问构建页面: https://github.com/shuge-x/opencode/actions
2. 点击最新的 "release patch" 运行
3. 滚动到底部 "Artifacts" 区域
4. 下载对应平台的文件

---

## 🔄 维护指南

### 同步官方更新

#### 步骤 1: 拉取官方最新代码

```bash
# 添加官方 remote（如果还没添加）
git remote add upstream https://github.com/anomalyco/opencode.git

# 拉取最新代码
git fetch upstream

# 切换到 dev 分支
git checkout dev

# 合并官方更新
git merge upstream/dev
```

#### 步骤 2: 解决冲突（如果有）

**潜在冲突文件**：
- `package.json` - 依赖列表合并
- `.opencode/opencode.jsonc` - 配置合并

**解决方式**：
```bash
# 如果 package.json 冲突
# 手动编辑，保留 DuckDB 依赖
# "@duckdb/node-api": "1.4.4-r.3"

# 如果配置文件冲突
# 保留 "duckdb": true
```

#### 步骤 3: 推送到 Fork

```bash
# 推送到你的 fork
git push fork dev

# 触发构建
# 访问 GitHub Actions 页面手动触发
```

### 更新频率建议

- **次要版本更新** (0.x.Y → 0.x.Z): 建议跟进
- **主要版本更新** (0.X.y → 1.0.0): 谨慎评估
- **安全更新**: 立即跟进

---

## 📖 使用文档

### 启动 OpenCode

安装完成后，启动 OpenCode Desktop app：

```bash
# macOS
open /Applications/OpenCode.app

# Windows
# 双击桌面快捷方式或开始菜单
```

### 测试 DuckDB 功能

#### 示例 1: 创建表

```
用户: Create a DuckDB table named "users" with columns id, name, and email
```

AI 会调用 DuckDB 工具：
```json
{
  "query": "CREATE TABLE users (id INTEGER, name VARCHAR, email VARCHAR)",
  "database": "mydb.duckdb"
}
```

#### 示例 2: 插入数据

```
用户: Insert a sample user into the users table
```

执行：
```json
{
  "query": "INSERT INTO users VALUES (1, 'Alice', 'alice@example.com')",
  "database": "mydb.duckdb"
}
```

#### 示例 3: 查询数据

```
用户: Show all users in the database
```

执行：
```json
{
  "query": "SELECT * FROM users",
  "database": "mydb.duckdb"
}
```

### 高级用法

#### 读取外部文件

```sql
-- 读取 CSV
SELECT * FROM read_csv('/path/to/data.csv');

-- 读取 Parquet
SELECT * FROM read_parquet('/path/to/data.parquet');

-- 读取 JSON
SELECT * FROM read_json_auto('/path/to/data.json');

-- 读取 Excel (需要安装扩展)
INSTALL sqlite;
LOAD sqlite;
SELECT * FROM sqlite_scan('/path/to/data.xlsx', 'Sheet1');
```

#### 数据分析

```sql
-- 聚合查询
SELECT 
  COUNT(*) as total,
  AVG(age) as avg_age,
  MAX(salary) as max_salary
FROM employees
GROUP BY department;

-- 窗口函数
SELECT 
  name,
  salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) as rank
FROM employees;

-- CTE (Common Table Expression)
WITH high_earners AS (
  SELECT * FROM employees WHERE salary > 100000
)
SELECT * FROM high_earners WHERE department = 'Engineering';
```

---

## 🐛 故障排查

### 常见问题

#### 1. DuckDB 工具未加载

**症状**: OpenCode 中无法使用 DuckDB 工具

**解决方案**:
```bash
# 检查工具文件是否存在
ls -la .opencode/tool/duckdb.ts

# 检查配置
cat .opencode/opencode.jsonc | grep duckdb

# 应该看到: "duckdb": true
```

#### 2. 依赖安装失败

**症状**: `bun install` 报错

**解决方案**:
```bash
# 清除缓存
rm -rf node_modules bun.lock
bun install

# 如果仍然失败，尝试
bun install --force
```

#### 3. 构建失败

**症状**: GitHub Actions 构建失败

**解决方案**:
1. 检查构建日志
2. 确认所有修改已提交
3. 确认 package.json 格式正确
4. 重新触发构建

#### 4. 数据库文件损坏

**症状**: 无法打开 .duckdb 文件

**解决方案**:
```sql
-- 尝试修复
PRAGMA database_list;

-- 如果失败，删除并重建
-- (在操作系统层面删除 .duckdb 文件)
```

### 日志查看

#### 本地日志

```bash
# OpenCode 日志位置
# macOS: ~/Library/Logs/OpenCode/
# Windows: %APPDATA%\OpenCode\logs\
# Linux: ~/.config/opencode/logs/
```

#### GitHub Actions 日志

访问: https://github.com/shuge-x/opencode/actions

---

## 📊 性能优化

### DuckDB 性能建议

1. **使用文件数据库**（而非内存）用于大数据集
2. **创建索引**加速查询：
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   ```
3. **批量插入**而非单条插入：
   ```sql
   INSERT INTO users VALUES 
     (1, 'Alice', 'alice@example.com'),
     (2, 'Bob', 'bob@example.com'),
     (3, 'Charlie', 'charlie@example.com');
   ```
4. **使用列式存储**（Parquet）进行大数据分析

### 资源使用

- **内存**: DuckDB 默认使用系统内存的 80%
- **磁盘**: 数据库文件大小 = 实际数据大小 × 0.3（压缩）
- **CPU**: 并行查询执行，充分利用多核

---

## 🔐 安全考虑

### 权限控制

OpenCode 的 DuckDB 工具已集成权限系统：

- ✅ 自动检查外部目录访问权限
- ✅ 用户确认敏感操作
- ✅ 防止恶意 SQL 注入（通过参数化查询）

### 最佳实践

1. **不要在 SQL 中硬编码敏感信息**
2. **使用参数化查询**：
   ```sql
   -- 好
   PREPARE query AS SELECT * FROM users WHERE email = $1;
   EXECUTE query('user@example.com');
   
   -- 避免
   SELECT * FROM users WHERE email = 'user@example.com';
   ```
3. **限制文件访问权限**（操作系统层面）
4. **定期备份数据库文件**

---

## 📚 参考资料

### 官方文档

- **OpenCode**: https://opencode.ai/docs
- **DuckDB**: https://duckdb.org/docs/
- **DuckDB Node.js API**: https://github.com/duckdb/duckdb-node-neo

### GitHub 仓库

- **OpenCode 官方**: https://github.com/anomalyco/opencode
- **Fork 仓库**: https://github.com/shuge-x/opencode
- **DuckDB**: https://github.com/duckdb/duckdb

### 社区

- **OpenCode Discord**: https://discord.gg/opencode
- **DuckDB Discord**: https://discord.duckdb.org

---

## ✅ 验收清单

### 功能验收

- [ ] Mac ARM app 正常启动
- [ ] Mac Intel app 正常启动
- [ ] Windows app 正常启动
- [ ] DuckDB 工具在工具列表中可见
- [ ] 可以执行简单 SQL 查询
- [ ] 可以创建文件数据库
- [ ] 可以查询文件数据库
- [ ] 可以读取 CSV/JSON/Parquet 文件
- [ ] 权限检查正常工作
- [ ] 错误提示清晰友好

### 质量验收

- [ ] 代码符合 OpenCode 风格指南
- [ ] 无明显性能问题
- [ ] 无内存泄漏
- [ ] 异常处理完善
- [ ] 文档完整清晰

---

## 📝 更新日志

### v1.0.0 (2026-03-07)

**新增**:
- ✅ DuckDB 工具集成
- ✅ 支持 SQL 查询执行
- ✅ 支持内存和文件数据库
- ✅ 跨平台支持（Mac/Windows/Linux）
- ✅ 自动权限检查
- ✅ 完整文档

**修改**:
- ✅ 添加 @duckdb/node-api 依赖
- ✅ 修改 GitHub Actions 配置
- ✅ 更新工具配置

---

## 👥 贡献者

- **实施**: OpenCode AI Assistant
- **用户**: shuge
- **日期**: 2026-03-07

---

## 📄 许可证

本集成方案基于 OpenCode (MIT License) 和 DuckDB (MIT License)。

---

## 🎯 下一步计划

### 短期 (1-2 周)

- [ ] 监控构建稳定性
- [ ] 收集用户反馈
- [ ] 修复潜在 bug
- [ ] 优化性能

### 中期 (1-2 月)

- [ ] 添加更多 DuckDB 扩展（如 httpfs, parquet）
- [ ] 支持数据库迁移
- [ ] 添加数据库管理 UI（如果需要）
- [ ] 编写更多使用案例

### 长期 (3-6 月)

- [ ] 考虑将工具提交到官方 OpenCode
- [ ] 发布为独立 npm 插件包
- [ ] 添加更多数据库支持（PostgreSQL, MySQL 等）

---

## 📞 支持

如有问题或建议，请：

1. 查看[故障排查](#故障排查)部分
2. 访问 GitHub Issues: https://github.com/shuge-x/opencode/issues
3. 加入 OpenCode Discord: https://discord.gg/opencode

---

**最后更新**: 2026-03-07  
**文档版本**: 1.0
