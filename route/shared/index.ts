/**
 * 将字符串转换为 kebab-case 格式
 * 处理步骤：
 * 1. 驼峰转连字符：camelCase -> camel-case
 * 2. 下划线和空格转连字符
 * 3. 移除不允许的字符（根据 keepDigits 决定是否保留数字）
 * 4. 合并多个连字符
 * 5. 去除首尾连字符并转小写
 * @param value - 待转换的字符串
 * @param keepDigits - 是否保留数字，默认 false
 * @returns kebab-case 格式的字符串
 */
export const toKebab = (value: string, keepDigits: boolean = false): string => {
  const disallowed = keepDigits ? /[^a-zA-Z0-9-]+/g : /[^a-zA-Z-]+/g
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(disallowed, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

/**
 * 将相对路径转换为绝对路径
 * 用于虚拟模块等场景，要求路径必须以 / 开头
 * 支持多层嵌套的相对路径（如 '../../pages/**'）
 * @param path - 相对路径（如 './pages/**'、'../pages/**'、'../../pages/**'）
 * @returns 绝对路径（如 '/pages/**'）
 */
export const toAbsolutePath = (path: string): string => {
  // 如果已经是绝对路径，直接返回
  if (path.startsWith('/')) return path

  // 处理多层嵌套的相对路径
  // 移除所有前导的 ./ 或 ../
  let cleaned = path
  // 循环移除前导的相对路径标记，直到没有为止
  while (cleaned.startsWith('./') || cleaned.startsWith('../')) {
    cleaned = cleaned.replace(/^\.\//, '').replace(/^\.\.\//, '')
  }

  // 添加前导 /
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
