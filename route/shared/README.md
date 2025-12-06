# @sylas/route-shared

文件路由系统的共享工具函数库。

## 安装

```bash
npm install @sylas/route-shared
# 或
pnpm add @sylas/route-shared
# 或
yarn add @sylas/route-shared
```

## 功能

提供文件路由系统中使用的通用工具函数：

- **`toKebab`**: 将字符串转换为 kebab-case 格式
- **`toAbsolutePath`**: 将相对路径转换为绝对路径
- **`toAbsolutePaths`**: 批量转换路径数组为绝对路径

## API

### `toKebab(value, keepDigits?)`

将字符串转换为 kebab-case 格式，支持多种输入格式。

**参数：**
- `value: string` - 待转换的字符串
- `keepDigits?: boolean` - 是否保留数字，默认 `false`

**返回值：**
- `string` - kebab-case 格式的字符串

**示例：**

```typescript
import { toKebab } from '@sylas/route-shared'

toKebab('camelCase')           // 'camel-case'
toKebab('snake_case')          // 'snake-case'
toKebab('PascalCase')           // 'pascal-case'
toKebab('Mixed_Case Name')     // 'mixed-case-name'
toKebab('User123', false)       // 'user'
toKebab('User123', true)       // 'user123'
toKebab('  multiple---spaces ') // 'multiple-spaces'
```

### `toAbsolutePath(path)`

将相对路径转换为绝对路径，用于虚拟模块等场景。

**参数：**
- `path: string` - 相对路径或绝对路径

**返回值：**
- `string` - 绝对路径（始终以 `/` 开头）

**示例：**

```typescript
import { toAbsolutePath } from '@sylas/route-shared'

toAbsolutePath('./pages/**')      // '/pages/**'
toAbsolutePath('../pages/**')     // '/pages/**'
toAbsolutePath('../../pages/**')  // '/pages/**'
toAbsolutePath('/pages/**')       // '/pages/**'（已为绝对路径，直接返回）
```

### `toAbsolutePaths(paths)`

批量转换路径数组为绝对路径。

**参数：**
- `paths: string[]` - 路径数组

**返回值：**
- `string[]` - 绝对路径数组

**示例：**

```typescript
import { toAbsolutePaths } from '@sylas/route-shared'

toAbsolutePaths([
  './pages/**',
  '../app-pages/**',
  '../../components/**'
])
// ['/pages/**', '/app-pages/**', '/components/**']
```

## 使用场景

### 路由名称生成

```typescript
import { toKebab } from '@sylas/route-shared'

const routeName = toKebab('UserProfile') // 'user-profile'
```

### 虚拟模块路径转换

```typescript
import { toAbsolutePaths } from '@sylas/route-shared'

// Vite 的 import.meta.glob 要求路径必须以 / 开头
const patterns = toAbsolutePaths([
  './pages/**/*.tsx',
  './app-pages/**/*.tsx'
])
// ['/pages/**/*.tsx', '/app-pages/**/*.tsx']
```

## 类型支持

完整的 TypeScript 类型定义已包含在包中，无需额外安装类型包。

## 许可证

MIT

## 相关包

- [`@sylas/route-core`](../core/README.md) - 文件路由核心逻辑
- [`@sylas/route-react`](../adapter/react/README.md) - React 适配器
- [`@sylas/route-vite-compiler`](../compiler/vite/README.md) - Vite 编译器

