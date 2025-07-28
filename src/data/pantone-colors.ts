// 潘通色彩接口定义
export interface PantoneColor {
  code: string
  name: string
  hex: string
  rgb: [number, number, number]
  cmyk: [number, number, number, number]
  category: string
  type: 'warm' | 'cool' | 'neutral'
  year?: number
  description?: string
}

// 导入所有色彩数据
import { yearlyColors } from './colors/yearly-colors.json'
import { redColors } from './colors/red-colors.json'
import { pinkColors } from './colors/pink-colors.json'
import { orangeColors } from './colors/orange-colors.json'
import { yellowColors } from './colors/yellow-colors.json'
import { greenColors } from './colors/green-colors.json'
import { blueColors } from './colors/blue-colors.json'
import { purpleColors } from './colors/purple-colors.json'
import { brownColors } from './colors/brown-colors.json'
import { grayColors } from './colors/gray-colors.json'
import { blackWhiteColors } from './colors/black-white-colors.json'
import { metallicColors } from './colors/metallic-colors.json'
import { neonColors } from './colors/neon-colors.json'
import { pastelColors } from './colors/pastel-colors.json'

// 合并所有色彩数据
export const pantoneColors: PantoneColor[] = [
  ...yearlyColors,
  ...redColors,
  ...pinkColors,
  ...orangeColors,
  ...yellowColors,
  ...greenColors,
  ...blueColors,
  ...purpleColors,
  ...brownColors,
  ...grayColors,
  ...blackWhiteColors,
  ...metallicColors,
  ...neonColors,
  ...pastelColors
]

// 按分类导出
export {
  yearlyColors,
  redColors,
  pinkColors,
  orangeColors,
  yellowColors,
  greenColors,
  blueColors,
  purpleColors,
  brownColors,
  grayColors,
  blackWhiteColors,
  metallicColors,
  neonColors,
  pastelColors
}

// 获取所有分类
export const getCategories = (): string[] => {
  const categories = [...new Set(pantoneColors.map(color => color.category))]
  return ['全部分类', ...categories.sort()]
}

// 按分类筛选色彩
export const getColorsByCategory = (category: string): PantoneColor[] => {
  if (category === '全部分类') return pantoneColors
  return pantoneColors.filter(color => color.category === category)
}

// 搜索色彩
export const searchColors = (searchTerm: string): PantoneColor[] => {
  if (!searchTerm) return pantoneColors
  
  const term = searchTerm.toLowerCase()
  return pantoneColors.filter(color => 
    color.name.toLowerCase().includes(term) ||
    color.code.toLowerCase().includes(term) ||
    color.hex.toLowerCase().includes(term) ||
    color.category.toLowerCase().includes(term)
  )
}

// 按年份获取色彩
export const getColorsByYear = (year: number): PantoneColor[] => {
  return pantoneColors.filter(color => color.year === year)
}

// 按色温筛选
export const getColorsByType = (type: 'warm' | 'cool' | 'neutral'): PantoneColor[] => {
  return pantoneColors.filter(color => color.type === type)
}
