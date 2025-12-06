/**
 * 将字符串转换为 kebab-case 格式
 * 
 * 用于路由名称、URL 路径等场景，将各种命名格式统一转换为 kebab-case
 * 
 * 处理步骤：
 * 1. 驼峰转连字符：camelCase -> camel-case
 * 2. 下划线和空格转连字符：snake_case、space case -> snake-case、space-case
 * 3. 移除不允许的字符（根据 keepDigits 决定是否保留数字）
 * 4. 合并多个连字符：--- -> -
 * 5. 去除首尾连字符并转小写
 * 
 * @param value - 待转换的字符串
 *   - 支持驼峰命名：'camelCase' -> 'camel-case'
 *   - 支持蛇形命名：'snake_case' -> 'snake-case'
 *   - 支持空格分隔：'space case' -> 'space-case'
 *   - 支持混合格式：'Mixed_Case Name' -> 'mixed-case-name'
 * @param keepDigits - 是否保留数字，默认 false
 *   - false（默认）：移除所有数字，'User123' -> 'user'
 *   - true：保留数字，'User123' -> 'user123'
 * @returns kebab-case 格式的字符串（全小写，单词间用连字符分隔）
 * 
 * @example
 * ```ts
 * toKebab('camelCase')              // => 'camel-case'
 * toKebab('snake_case')              // => 'snake-case'
 * toKebab('PascalCase')              // => 'pascal-case'
 * toKebab('Mixed_Case Name')         // => 'mixed-case-name'
 * toKebab('User123', false)          // => 'user'
 * toKebab('User123', true)           // => 'user123'
 * toKebab('  multiple---spaces ')   // => 'multiple-spaces'
 * ```
 */
export const toKebab = (value: string, keepDigits: boolean = false): string => {
  if (!value) return ''

  // 第一步：处理驼峰命名和下划线/空格
  // 将 camelCase 转换为 camel-case，将下划线和空格转换为连字符
  const step1 = value
    .replace(/([a-z])([A-Z])/g, '$1-$2') // 驼峰转连字符：camelCase -> camel-Case
    .replace(/[_\s]+/g, '-') // 下划线和空格转连字符：snake_case -> snake-case

  // 第二步：移除不允许的字符
  // 根据 keepDigits 决定是否保留数字
  const disallowed = keepDigits ? /[^a-zA-Z0-9-]/g : /[^a-zA-Z-]/g
  const step2 = step1.replace(disallowed, '')

  // 第三步：清理和规范化
  // 合并多个连字符，去除首尾连字符，转小写
  return step2
    .replace(/-+/g, '-') // 合并多个连字符：--- -> -
    .replace(/^-+|-+$/g, '') // 去除首尾连字符
    .toLowerCase() // 转小写
}

/**
 * 将相对路径转换为绝对路径
 * 
 * 用于虚拟模块等场景，要求路径必须以 / 开头（Vite 的 import.meta.glob 要求）
 * 支持多层嵌套的相对路径，自动移除所有前导的 ./ 或 ../
 * 
 * @param path - 相对路径或绝对路径
 *   - 相对路径示例：'./pages/**'、'../pages/**'、'../../pages/**'
 *   - 绝对路径示例：'/pages/**'（直接返回）
 * @returns 绝对路径（始终以 / 开头）
 *   - 示例：'/pages/**'
 * 
 * @example
 * ```ts
 * toAbsolutePath('./pages/**')       // => '/pages/**'
 * toAbsolutePath('../pages/**')      // => '/pages/**'
 * toAbsolutePath('../../pages/**')   // => '/pages/**'
 * toAbsolutePath('/pages/**')        // => '/pages/**'（已为绝对路径，直接返回）
 * ```
 */
export const toAbsolutePath = (path: string): string => {
  // 已经是绝对路径，直接返回
  if (path.startsWith('/')) return path

  // 循环移除所有前导的相对路径标记（./ 或 ../）
  // 支持多层嵌套，如 ../../pages/** -> /pages/**
  let cleaned = path
  while (cleaned.startsWith('./') || cleaned.startsWith('../')) {
    cleaned = cleaned.replace(/^\.\//, '').replace(/^\.\.\//, '')
  }

  // 添加前导 / 转换为绝对路径
  return '/' + cleaned
}

/**
 * 批量转换路径数组为绝对路径
 * @param paths - 路径数组
 * @returns 绝对路径数组
 */
export const toAbsolutePaths = (paths: string[]): string[] => {
  return paths.map(toAbsolutePath)
}
