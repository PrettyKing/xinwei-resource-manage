'use client'

import React, { useState, useMemo } from 'react'
import { Search, Copy, Heart, Download, Palette, Grid, List, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// 导入新的色彩数据
import newColorData from '@/data/new-color-175'

// 色彩数据接口，基于新的数据结构
interface PantoneColor {
  code: string
  creationDate: string
  name: string
  hex: string
  rgb: {
    r: number
    g: number
    b: number
  }
  lab: {
    l: number
    a: number
    b: number
  }
  cmyk: null | {
    c: number
    m: number
    y: number
    k: number
  }
}

// 处理数据并添加中文名称和分类
const processColors = (colors: PantoneColor[]) => {
  return colors.map(color => {
    // 根据颜色名称或特征自动分类
    let category = '其他色彩'
    let cn_name = color.name

    const name = color.name.toLowerCase()
    
    // 简单的分类逻辑
    if (name.includes('pink') || name.includes('rose') || name.includes('blush') || name.includes('fuchsia')) {
      category = '粉色系'
      cn_name = generateChineseName(color.name, 'pink')
    } else if (name.includes('peach') || name.includes('apricot') || name.includes('coral') || name.includes('melon')) {
      category = '橙色系'
      cn_name = generateChineseName(color.name, 'orange')
    } else if (name.includes('yellow') || name.includes('corn') || name.includes('sun') || name.includes('bee')) {
      category = '黄色系'
      cn_name = generateChineseName(color.name, 'yellow')
    } else if (name.includes('green') || name.includes('lime') || name.includes('mint') || name.includes('leaf')) {
      category = '绿色系'
      cn_name = generateChineseName(color.name, 'green')
    } else if (name.includes('aqua') || name.includes('blue') || name.includes('cyan') || name.includes('ocean') || name.includes('water')) {
      category = '蓝色系'
      cn_name = generateChineseName(color.name, 'blue')
    } else if (name.includes('purple') || name.includes('violet') || name.includes('lavender') || name.includes('lilac')) {
      category = '紫色系'
      cn_name = generateChineseName(color.name, 'purple')
    } else if (name.includes('gray') || name.includes('grey') || name.includes('silver') || name.includes('charcoal') || name.includes('smoke') || name.includes('ash')) {
      category = '灰色系'
      cn_name = generateChineseName(color.name, 'gray')
    } else if (name.includes('black') || name.includes('white') || name.includes('snow') || name.includes('pearl')) {
      category = '黑白系'
      cn_name = generateChineseName(color.name, 'blackwhite')
    }

    return {
      ...color,
      category,
      cn_name,
      // 转换 RGB 格式以兼容原有界面
      rgb: [color.rgb.r, color.rgb.g, color.rgb.b] as [number, number, number],
      // 模拟 CMYK 数据（如果为 null）
      cmyk: color.cmyk ? [color.cmyk.c, color.cmyk.m, color.cmyk.y, color.cmyk.k] as [number, number, number, number] : [0, 0, 0, 0] as [number, number, number, number],
      type: categorizeColorType(color.name) as 'warm' | 'cool' | 'neutral'
    }
  })
}

// 生成中文名称
const generateChineseName = (englishName: string, colorType: string): string => {
  const nameMap: { [key: string]: { [key: string]: string } } = {
    pink: {
      'Rose Bisque': '玫瑰饼干',
      'Pinkish Petals': '粉嫩花瓣',
      'Sweet Taffy': '甜蜜太妃',
      'Flushing Pink': '红润粉',
      'Full Blooming Pink': '盛开粉',
      'Rosy Touch': '玫瑰触感',
      'Pink Cherub': '粉色小天使',
      'Poignant Pink': '动人粉',
      'Pink Taffy': '粉色太妃',
      'Thinking Pink': '思考粉',
      'Pink Drink': '粉色饮品',
      'Rosy Future': '玫瑰未来'
    },
    orange: {
      'Peach Adobe': '桃色土坯',
      'Dusky Peach': '暮色桃',
      'Peach Tree': '桃树色',
      'Peach Smoothie': '桃子奶昔',
      'Honeyed Apricot': '蜜制杏',
      'Taste of Peach': '桃味',
      'Peach Infusion': '桃子浸泡',
      'Whispering Peach': '低语桃',
      'Peach Mousse': '桃子慕斯',
      'Peach Palazzo': '桃色宫殿',
      'Perfection Peach': '完美桃',
      'Peach Sorbet': '桃子冰沙',
      'Melon Ice': '瓜冰',
      'Persian Melon': '波斯瓜'
    },
    yellow: {
      'Creamed Corn': '奶油玉米',
      'Corn Confection': '玉米糖果',
      'Yellow Jasper': '黄色碧玉',
      'Summer Sun': '夏日阳光',
      'Buzzing Bees': '嗡嗡蜜蜂',
      'Corn Kernels': '玉米粒',
      'Happy Hopes': '快乐希望',
      'Snow Pear': '雪梨',
      'Minced Quince': '榅桲碎',
      'Pear Extract': '梨提取物',
      'Asian Pear': '亚洲梨',
      'Citrus Essence': '柑橘精华'
    },
    green: {
      'Scenic Green': '风景绿',
      'Key Lime Pie': '青柠派',
      'Veiled Vista': '朦胧远景',
      'Tender Stem': '嫩茎',
      'Frosted Lime': '霜青柠',
      'Spring Leaf': '春叶',
      'Gremlin Green': '小鬼绿',
      'Greenish': '绿意',
      'Serene Green': '宁静绿',
      'Graciously Green': '优雅绿',
      'Clean Green': '清洁绿',
      'Dreamy Green': '梦幻绿',
      'Breezy Green': '微风绿',
      'Mentholated': '薄荷味'
    },
    blue: {
      'Dewdrops': '露珠',
      'Ocean Air': '海洋空气',
      'Aqua Frost': '水霜',
      'Cool Caribbean': '清凉加勒比',
      'Starling Egg': '椋鸟蛋',
      'Frostbite': '冻伤',
      'Pool Cabana': '泳池凉亭',
      'Cyan Sea': '青海',
      'Dusky Aqua': '暮色水',
      'Aqua Wash': '水洗',
      'Rinsing Rivulet': '冲洗小溪',
      'Aquacade': '水上表演',
      'Aquarium': '水族箱',
      'Fluidity': '流动性',
      'Ocean Current': '洋流',
      'Blue Finch': '蓝雀',
      'Sheer Blue': '纯蓝'
    },
    purple: {
      'Lavender Mittens': '薰衣草手套',
      'Diaphanous Lilac': '透明丁香',
      'Lilac Clematis': '丁香铁线莲',
      'Lacy Lilac': '蕾丝丁香',
      'Lavender Fields': '薰衣草田',
      'Lavender Icing': '薰衣草糖霜',
      'Violet Dusk': '紫罗兰黄昏',
      'English Hyacinth': '英国风信子',
      'Lavender Oil': '薰衣草油',
      'Scented Lavender': '香薰衣草',
      'Lavender Lily': '薰衣草百合',
      'Quiet Violet': '安静紫罗兰',
      'Violetta': '小紫罗兰'
    },
    gray: {
      'Stalactite': '钟乳石',
      'Wispy Clouds': '轻云',
      'White Down': '白绒',
      'Snowy Peaks': '雪峰',
      'Sea Pearl': '海珍珠',
      'Snowfall': '降雪',
      'Early Frost': '早霜',
      'Cumulus Cloud': '积云',
      'Sweatshirt Gray': '运动衫灰',
      'Temple Gray': '寺庙灰',
      'Gray Daze': '灰色迷雾',
      'Steel Wool': '钢丝绒',
      'Gray Morning': '灰色晨光',
      'Cloud Cover': '云层',
      'Storm Cloud': '暴风云',
      'Wisdom Gray': '智慧灰'
    },
    blackwhite: {
      'Stalactite': '钟乳石',
      'Wispy Clouds': '轻云',
      'White Down': '白绒',
      'Snowy Peaks': '雪峰',
      'Snowfall': '降雪'
    }
  }

  return nameMap[colorType]?.[englishName] || englishName
}

// 判断色彩类型
const categorizeColorType = (name: string): string => {
  const warmColors = ['red', 'orange', 'yellow', 'pink', 'peach', 'coral', 'rose', 'warm']
  const coolColors = ['blue', 'green', 'purple', 'violet', 'cyan', 'aqua', 'cool', 'mint']
  
  const lowerName = name.toLowerCase()
  
  if (warmColors.some(color => lowerName.includes(color))) return 'warm'
  if (coolColors.some(color => lowerName.includes(color))) return 'cool'
  return 'neutral'
}

// 处理颜色数据
const pantoneColors = processColors(newColorData.colors)

interface ColorCardProps {
  color: any
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
  const textColor = ['#FFFFFF', '#F7F7F7', '#FFFAFA'].includes(`#${color.hex}`) ? '#000' : '#FFF'
  
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4" 
            style={{ borderLeftColor: `#${color.hex}` }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: `#${color.hex}`, color: textColor }}
              >
                #{color.hex}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{color.cn_name}</h3>
                <p className="text-sm text-gray-600">{color.name}</p>
                <p className="text-xs text-gray-500">{color.code}</p>
                <p className="text-xs text-gray-500">
                  RGB({color.rgb.join(', ')})
                </p>
                <p className="text-xs text-gray-500">
                  LAB({color.lab.l.toFixed(1)}, {color.lab.a.toFixed(1)}, {color.lab.b.toFixed(1)})
                </p>
                <p className="text-xs text-gray-400">
                  创建于: {new Date(color.creationDate).toLocaleDateString()}
                </p>
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
          style={{ backgroundColor: `#${color.hex}`, color: textColor }}
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <span className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            #{color.hex}
          </span>
          <div className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded-full text-gray-800 font-medium">
            2024
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{color.cn_name}</h3>
          <p className="text-sm text-gray-600 mb-1">{color.name}</p>
          <p className="text-xs text-gray-500 mb-2">{color.code}</p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <div>RGB({color.rgb.join(', ')})</div>
              <div>LAB({color.lab.l.toFixed(0)}, {color.lab.a.toFixed(0)}, {color.lab.b.toFixed(0)})</div>
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  // 获取所有分类
  const categories = useMemo(() => {
    const allCategories = Array.from(new Set(pantoneColors.map(color => color.category)))
    return ['全部分类', ...allCategories.sort()]
  }, [])

  // 过滤颜色
  const filteredColors = useMemo(() => {
    let colors = pantoneColors
    
    // 按分类筛选
    if (selectedCategory !== '全部分类') {
      colors = colors.filter(color => color.category === selectedCategory)
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
  }, [searchTerm, selectedCategory])

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
      lab: color.lab,
      category: color.category,
      type: color.type,
      creationDate: color.creationDate
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
                <p className="text-sm text-gray-600">PANTONE® FHI Paper TPG New 175 • {pantoneColors.length}个色彩</p>
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
              key={color.code}
              color={color}
              viewMode={viewMode}
              isFavorited={favorites.has(color.code)}
              onToggleFavorite={() => toggleFavorite(color.code)}
              onCopyHex={() => copyToClipboard(`#${color.hex}`)}
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
