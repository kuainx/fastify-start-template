# Fastify-Backend

Fastify 后端项目，基于 Fastify + TypeScript + MySQL。

## 技术栈

- **Fastify**: 高性能后端框架
- **TypeScript**: 类型支持
- **Prisma**: ORM 映射
- **Bcrypt**: 密码哈希
- **Memory Cache**: Token 验证缓存

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境

复制 `.env.example` 并重命名为 `.env`，修改其中的数据库连接信息和 `COOKIE_SECRET`。

### 3. 初始化数据库 (可选)

如果您已经配置好 MySQL，可以运行：

```bash
npx prisma db push
```

### 4. 启动项目

```bash
# 开发模式
pnpm dev

# 编译并运行
pnpm build
pnpm start
```

## API 文档

启动后访问 `http://localhost:3000/docs` 查看 Swagger UI 文档。

## 认证说明

- 使用 Cookie 存储 `token`。
- Token 与 UserId 的对应关系缓存在服务器内存中（`sessions` Map）。
- 关键 API 配置了 `authenticate` 装饰器进行拦截。
