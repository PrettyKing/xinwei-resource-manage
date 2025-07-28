'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Copy, Heart, Download, Palette, Grid, List, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// 导入色彩数据
import yearlyColors from '@/data/colors/yearly-colors.json'
import redColors from '@/data/colors/red-colors.json'
import pinkColors from '@/data/colors/pink-colors.json'
import orangeColors from '@/data/colors/orange-colors.json'
import yellowColors from '@/data/colors/yellow-colors.json'
import greenColors from '@/data/colors/green-colors.json'
import blueColors from '@/data/colors/blue-colors.json'
import purpleColors from '@/data/colors/purple-colors.json'
import brownColors from '@/data/colors/brown-colors.json'
import grayColors from '@/data/colors/gray-colors.json'
import blackWhiteColors from '@/data/colors/black-white-colors.json'
import metallicColors from '@/data/colors/metallic-colors.json'
import neonColors from '@/data/colors/neon-colors.json'
import pastelColors from '@/data/colors/pastel-colors.json'

// 色彩数据接口
interface PantoneColor {
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

// 合并所有色彩数据
const pantoneColors: PantoneColor[] = [
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

interface ColorCardProps {
  color: PantoneColor
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
  const textColor = color.hex === '#FFFFFF' || color.hex === '#F7F7F7' || color.hex === '#FFFAFA' ? '#000' : '#FFF'
  
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4" 
            style={{ borderLeftColor: color.hex }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: color.hex, color: textColor }}
              >
                {color.hex}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{color.name}</h3>
                <p className="text-sm text-gray-600">{color.code}</p>
                <p className="text-xs text-gray-500">
                  RGB({color.rgb.join(', ')})
                </p>
                <p className="text-xs text-gray-500">
                  CMYK({color.cmyk.join(', ')})
                </p>
                {color.year && (
                  <p className="text-xs text-blue-600 font-medium">
                    {color.year}年度色彩
                  </p>
                )}
                {color.description && (
                  <p className="text-xs text-gray-400 mt-1 max-w-md">
                    {color.description}
                  </p>
                )}
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
          style={{ backgroundColor: color.hex, color: textColor }}
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <span className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {color.hex}
          </span>
          {color.year && (
            <div className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded-full text-gray-800 font-medium">
              {color.year}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{color.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{color.code}</p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <div>RGB({color.rgb.join(', ')})</div>
              <div>CMYK({color.cmyk.join(', ')})</div>
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
    return [
      '全部分类',
      '年度色彩',
      '红色系',
      '粉色系', 
      '橙色系',
      '黄色系',
      '绿色系',
      '蓝色系',
      '紫色系',
      '棕色系',
      '灰色系',
      '黑白系',
      '金属色',
      '霓虹色',
      '粉彩色'
    ]
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
      code: color.code,
      hex: color.hex,
      rgb: color.rgb,
      cmyk: color.cmyk,
      category: color.category,
      type: color.type,
      year: color.year,
      description: color.description
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
                <p className="text-sm text-gray-600">专业色彩标准参考 • {pantoneColors.length}个色彩</p>
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
              onCopyHex={() => copyToClipboard(color.hex)}
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
