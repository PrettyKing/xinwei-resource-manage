'use client'

import React, { useState, useMemo } from 'react'
import { Search, Copy, Heart, Download, Palette, Grid, List, Filter, Database } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// 导入两个数据源
import newColorData from '@/data/new-color-175'
import pantoneData from '@/data/panton-2799'

// 统一的色彩数据接口
interface UnifiedPantoneColor {
  code: string
  name: string
  cn_name: string
  hex: string
  rgb: [number, number, number]
  cmyk?: [number, number, number, number]
  lab?: {
    l: number
    a: number
    b: number
  }
  category: string
  type: 'warm' | 'cool' | 'neutral'
  source: 'new-175' | 'panton-2799'
  creationDate?: string
  year?: number
}

// 处理新色彩数据 (175个)
const processNewColors = (colors: any[]): UnifiedPantoneColor[] => {
  return colors.map(color => {
    const category = categorizeColor(color.name)
    return {
      code: color.code,
      name: color.name,
      cn_name: generateChineseName(color.name, category),
      hex: color.hex,
      rgb: [color.rgb.r, color.rgb.g, color.rgb.b] as [number, number, number],
      lab: color.lab,
      category,
      type: categorizeColorType(color.name),
      source: 'new-175' as const,
      creationDate: color.creationDate
    }
  })
}

// 处理2799数据
const processPantoneColors = (data: any): UnifiedPantoneColor[] => {
  if (!data?.colors || !Array.isArray(data.colors)) {
    return []
  }
  
  return data.colors.map((color: any) => {
    const category = categorizeColor(color.name || '')
    return {
      code: color.code || '',
      name: color.name || '',
      cn_name: generateChineseName(color.name || '', category),
      hex: color.hex || '',
      rgb: color.rgb ? [color.rgb.r || 0, color.rgb.g || 0, color.rgb.b || 0] as [number, number, number] : [0, 0, 0] as [number, number, number],
      cmyk: color.cmyk ? [color.cmyk.c || 0, color.cmyk.m || 0, color.cmyk.y || 0, color.cmyk.k || 0] as [number, number, number, number] : undefined,
      lab: color.lab,
      category,
      type: categorizeColorType(color.name || ''),
      source: 'panton-2799' as const,
      year: color.year
    }
  })
}

// 颜色分类函数
const categorizeColor = (name: string): string => {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('pink') || lowerName.includes('rose') || lowerName.includes('blush') || lowerName.includes('fuchsia') || lowerName.includes('magenta')) {
    return '粉色系'
  } else if (lowerName.includes('red') || lowerName.includes('crimson') || lowerName.includes('scarlet') || lowerName.includes('cherry')) {
    return '红色系'
  } else if (lowerName.includes('orange') || lowerName.includes('peach') || lowerName.includes('apricot') || lowerName.includes('coral') || lowerName.includes('melon')) {
    return '橙色系'
  } else if (lowerName.includes('yellow') || lowerName.includes('corn') || lowerName.includes('sun') || lowerName.includes('bee') || lowerName.includes('gold')) {
    return '黄色系'
  } else if (lowerName.includes('green') || lowerName.includes('lime') || lowerName.includes('mint') || lowerName.includes('leaf') || lowerName.includes('forest')) {
    return '绿色系'
  } else if (lowerName.includes('blue') || lowerName.includes('cyan') || lowerName.includes('ocean') || lowerName.includes('water') || lowerName.includes('sky')) {
    return '蓝色系'
  } else if (lowerName.includes('aqua') || lowerName.includes('turquoise') || lowerName.includes('teal')) {
    return '青色系'
  } else if (lowerName.includes('purple') || lowerName.includes('violet') || lowerName.includes('lavender') || lowerName.includes('lilac') || lowerName.includes('plum')) {
    return '紫色系'
  } else if (lowerName.includes('brown') || lowerName.includes('coffee') || lowerName.includes('chocolate') || lowerName.includes('tan') || lowerName.includes('bronze')) {
    return '棕色系'
  } else if (lowerName.includes('gray') || lowerName.includes('grey') || lowerName.includes('silver') || lowerName.includes('charcoal') || lowerName.includes('smoke') || lowerName.includes('ash')) {
    return '灰色系'
  } else if (lowerName.includes('black') || lowerName.includes('white') || lowerName.includes('snow') || lowerName.includes('pearl') || lowerName.includes('ivory')) {
    return '黑白系'
  } else if (lowerName.includes('gold') || lowerName.includes('silver') || lowerName.includes('copper') || lowerName.includes('bronze') || lowerName.includes('metallic')) {
    return '金属色'
  } else if (lowerName.includes('neon') || lowerName.includes('electric') || lowerName.includes('bright') || lowerName.includes('fluorescent')) {
    return '霓虹色'
  }
  
  return '其他色彩'
}

// 色温分类
const categorizeColorType = (name: string): 'warm' | 'cool' | 'neutral' => {
  const warmKeywords = ['red', 'orange', 'yellow', 'pink', 'peach', 'coral', 'rose', 'warm', 'gold', 'amber']
  const coolKeywords = ['blue', 'green', 'purple', 'violet', 'cyan', 'aqua', 'cool', 'mint', 'lavender']
  
  const lowerName = name.toLowerCase()
  
  if (warmKeywords.some(keyword => lowerName.includes(keyword))) return 'warm'
  if (coolKeywords.some(keyword => lowerName.includes(keyword))) return 'cool'
  return 'neutral'
}

// 生成中文名称的映射表
const chineseNameMap: { [key: string]: string } = {
  // 粉色系
  'Rose Bisque': '玫瑰饼干', 'Pinkish Petals': '粉嫩花瓣', 'Sweet Taffy': '甜蜜太妃',
  'Flushing Pink': '红润粉', 'Full Blooming Pink': '盛开粉', 'Rosy Touch': '玫瑰触感',
  'Pink Cherub': '粉色小天使', 'Poignant Pink': '动人粉', 'Pink Taffy': '粉色太妃',
  'Thinking Pink': '思考粉', 'Pink Drink': '粉色饮品', 'Rosy Future': '玫瑰未来',
  
  // 橙色系
  'Peach Adobe': '桃色土坯', 'Dusky Peach': '暮色桃', 'Peach Tree': '桃树色',
  'Peach Smoothie': '桃子奶昔', 'Honeyed Apricot': '蜜制杏', 'Taste of Peach': '桃味',
  'Peach Infusion': '桃子浸泡', 'Whispering Peach': '低语桃', 'Peach Mousse': '桃子慕斯',
  
  // 黄色系
  'Creamed Corn': '奶油玉米', 'Corn Confection': '玉米糖果', 'Yellow Jasper': '黄色碧玉',
  'Summer Sun': '夏日阳光', 'Buzzing Bees': '嗡嗡蜜蜂', 'Corn Kernels': '玉米粒',
  
  // 绿色系
  'Scenic Green': '风景绿', 'Key Lime Pie': '青柠派', 'Tender Stem': '嫩茎',
  'Spring Leaf': '春叶', 'Breezy Green': '微风绿', 'Mentholated': '薄荷味',
  
  // 蓝色系
  'Ocean Air': '海洋空气', 'Aqua Frost': '水霜', 'Cool Caribbean': '清凉加勒比',
  'Starling Egg': '椋鸟蛋', 'Pool Cabana': '泳池凉亭', 'Ocean Current': '洋流',
  
  // 紫色系
  'Lavender Fields': '薰衣草田', 'English Hyacinth': '英国风信子', 'Quiet Violet': '安静紫罗兰',
  'Scented Lavender': '香薰衣草', 'Lavender Oil': '薰衣草油', 'Violetta': '小紫罗兰',
  
  // 灰色系
  'Stalactite': '钟乳石', 'Storm Cloud': '暴风云', 'Wisdom Gray': '智慧灰',
  'Steel Wool': '钢丝绒', 'Gray Morning': '灰色晨光', 'Cloud Cover': '云层'
}

// 生成中文名称
const generateChineseName = (englishName: string, category: string): string => {
  // 优先使用映射表
  if (chineseNameMap[englishName]) {
    return chineseNameMap[englishName]
  }
  
  // 如果没有映射，返回原英文名
  return englishName
}

// 整合所有数据
const getAllColors = (): UnifiedPantoneColor[] => {
  const newColors = processNewColors(newColorData.colors || [])
  const pantoneColors = processPantoneColors(pantoneData)
  
  // 合并数据，去重（优先保留新色彩数据）
  const codeSet = new Set<string>()
  const allColors: UnifiedPantoneColor[] = []
  
  // 先添加新色彩
  newColors.forEach(color => {
    if (color.code && !codeSet.has(color.code)) {
      codeSet.add(color.code)
      allColors.push(color)
    }
  })
  
  // 再添加2799数据中不重复的色彩
  pantoneColors.forEach(color => {
    if (color.code && !codeSet.has(color.code)) {
      codeSet.add(color.code)
      allColors.push(color)
    }
  })
  
  return allColors
}

const allPantoneColors = getAllColors()

interface ColorCardProps {
  color: UnifiedPantoneColor
  viewMode: 'grid' | 'list'
  isFavorited: boolean
  onToggleFavorite: () => void
  onCopyHex: () => void
}

const ColorCard: React.FC<ColorCardProps> = ({ 
  color, 
  viewMode, 
  isFavorited, 
  onToggleFavorite, 
  onCopyHex 
}) => {
  const hexWithHash = color.hex.startsWith('#') ? color.hex : `#${color.hex}`
  const textColor = ['#FFFFFF', '#F7F7F7', '#FFFAFA', '#FEFEFE'].includes(hexWithHash.toUpperCase()) ? '#000' : '#FFF'
  
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4" 
            style={{ borderLeftColor: hexWithHash }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: hexWithHash, color: textColor }}
              >
                {hexWithHash}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{color.cn_name}</h3>
                <p className="text-sm text-gray-600">{color.name}</p>
                <p className="text-xs text-gray-500">{color.code}</p>
                <p className="text-xs text-gray-500">
                  RGB({color.rgb.join(', ')})
                </p>
                {color.cmyk && (
                  <p className="text-xs text-gray-500">
                    CMYK({color.cmyk.join(', ')})
                  </p>
                )}
                {color.lab && (
                  <p className="text-xs text-gray-500">
                    LAB({color.lab.l.toFixed(1)}, {color.lab.a.toFixed(1)}, {color.lab.b.toFixed(1)})
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${ 
                    color.source === 'new-175' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {color.source === 'new-175' ? '新175色' : '经典系列'}
                  </span>
                  {color.year && (
                    <span className="text-xs text-blue-600 font-medium">
                      {color.year}年度色彩
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
                className={isFavorited ? 'text-red-500' : 'text-gray-400'}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopyHex}
                className="text-gray-600 hover:text-gray-900"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="p-0">
        <div 
          className="h-32 rounded-t-lg flex items-center justify-center text-sm font-medium relative overflow-hidden"
          style={{ backgroundColor: hexWithHash, color: textColor }}
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <span className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {hexWithHash}
          </span>
          <div className="absolute top-2 right-2 flex gap-1">
            {color.source === 'new-175' && (
              <div className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full font-medium">
                NEW
              </div>
            )}
            {color.year && (
              <div className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full font-medium">
                {color.year}
              </div>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{color.cn_name}</h3>
          <p className="text-sm text-gray-600 mb-1">{color.name}</p>
          <p className="text-xs text-gray-500 mb-2">{color.code}</p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <div>RGB({color.rgb.join(', ')})</div>
              {color.lab ? (
                <div>LAB({color.lab.l.toFixed(0)}, {color.lab.a.toFixed(0)}, {color.lab.b.toFixed(0)})</div>
              ) : color.cmyk ? (
                <div>CMYK({color.cmyk.join(', ')})</div>
              ) : null}
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
                className={`h-8 w-8 p-0 ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
              >
                <Heart className={`h-3 w-3 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopyHex}
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PantoneColorPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部分类')
  const [selectedSource, setSelectedSource] = useState('全部来源')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  // 获取所有分类
  const categories = useMemo(() => {
    const allCategories = Array.from(new Set(allPantoneColors.map(color => color.category)))
    return ['全部分类', ...allCategories.sort()]
  }, [])

  // 获取数据源选项
  const sources = useMemo(() => {
    return ['全部来源', '新175色', '经典系列']
  }, [])

  // 过滤颜色
  const filteredColors = useMemo(() => {
    let colors = allPantoneColors
    
    // 按分类筛选
    if (selectedCategory !== '全部分类') {
      colors = colors.filter(color => color.category === selectedCategory)
    }
    
    // 按数据源筛选
    if (selectedSource !== '全部来源') {
      if (selectedSource === '新175色') {
        colors = colors.filter(color => color.source === 'new-175')
      } else if (selectedSource === '经典系列') {
        colors = colors.filter(color => color.source === 'panton-2799')
      }
    }
    
    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      colors = colors.filter(color => 
        color.name.toLowerCase().includes(term) ||
        color.cn_name.toLowerCase().includes(term) ||
        color.code.toLowerCase().includes(term) ||
        color.hex.toLowerCase().includes(term) ||
        color.category.toLowerCase().includes(term)
      )
    }
    
    return colors
  }, [searchTerm, selectedCategory, selectedSource])

  // 统计信息
  const stats = useMemo(() => {
    const newColorsCount = allPantoneColors.filter(c => c.source === 'new-175').length
    const classicColorsCount = allPantoneColors.filter(c => c.source === 'panton-2799').length
    return { newColorsCount, classicColorsCount, total: allPantoneColors.length }
  }, [])

  // 复制颜色值
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(text)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  // 切换收藏
  const toggleFavorite = (colorCode: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(colorCode)) {
      newFavorites.delete(colorCode)
    } else {
      newFavorites.add(colorCode)
    }
    setFavorites(newFavorites)
  }

  // 导出色卡
  const exportColors = () => {
    const data = filteredColors.map(color => ({
      name: color.name,
      cn_name: color.cn_name,
      code: color.code,
      hex: color.hex,
      rgb: color.rgb,
      cmyk: color.cmyk,
      lab: color.lab,
      category: color.category,
      type: color.type,
      source: color.source,
      creationDate: color.creationDate,
      year: color.year
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pantone-colors-${selectedCategory}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部区域 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">潘通色卡</h1>
                <p className="text-sm text-gray-600">
                  专业色彩标准参考 • 共{stats.total}个色彩 
                  <span className="ml-2 text-green-600">新175色: {stats.newColorsCount}</span>
                  <span className="ml-2 text-blue-600">经典系列: {stats.classicColorsCount}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={exportColors}
                className="hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                导出色卡
              </Button>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选区域 */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索颜色名称、编号或HEX值..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Database className="h-4 w-4 text-gray-500" />
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>找到 {filteredColors.length} 个颜色</span>
            {favorites.size > 0 && (
              <span className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-1" />
                {favorites.size} 个收藏
              </span>
            )}
          </div>
        </div>

        {/* 颜色网格 */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
            : 'grid-cols-1'
        }`}>
          {filteredColors.map((color) => (
            <ColorCard
              key={`${color.source}-${color.code}`}
              color={color}
              viewMode={viewMode}
              isFavorited={favorites.has(color.code)}
              onToggleFavorite={() => toggleFavorite(color.code)}
              onCopyHex={() => copyToClipboard(color.hex.startsWith('#') ? color.hex : `#${color.hex}`)}
            />
          ))}
        </div>

        {filteredColors.length === 0 && (
          <div className="text-center py-12">
            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的颜色</h3>
            <p className="text-gray-600">尝试调整搜索条件或选择其他分类</p>
          </div>
        )}
      </div>

      {/* 复制成功提示 */}
      {copiedColor && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in">
          已复制: {copiedColor}
        </div>
      )}
    </div>
  )
}
