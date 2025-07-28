'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Copy, Heart, Download, Palette, Grid, List, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 潘通色彩数据 (2024年最新色卡)
const pantoneColors = [
  // 2024 Color of the Year - Peach Fuzz
  { code: 'PANTONE 13-1023 TPG', name: 'Peach Fuzz', hex: '#FFBE98', rgb: [255, 190, 152], category: '2024', type: 'warm' },
  
  // 经典色彩
  { code: 'PANTONE 18-1763 TPG', name: 'Viva Magenta', hex: '#BB2649', rgb: [187, 38, 73], category: '2023', type: 'warm' },
  { code: 'PANTONE 17-3938 TPG', name: 'Very Peri', hex: '#6667AB', rgb: [102, 103, 171], category: '2022', type: 'cool' },
  { code: 'PANTONE 17-5104 TPG', name: 'Ultimate Gray', hex: '#939597', rgb: [147, 149, 151], category: '2021', type: 'neutral' },
  { code: 'PANTONE 19-4052 TPG', name: 'Classic Blue', hex: '#0F4C75', rgb: [15, 76, 117], category: '2020', type: 'cool' },
  
  // 红色系列
  { code: 'PANTONE 18-1664 TPG', name: 'Tango Red', hex: '#E2492F', rgb: [226, 73, 47], category: 'reds', type: 'warm' },
  { code: 'PANTONE 18-1763 TPG', name: 'Scarlet', hex: '#BB2649', rgb: [187, 38, 73], category: 'reds', type: 'warm' },
  { code: 'PANTONE 19-1664 TPG', name: 'Racing Red', hex: '#C8102E', rgb: [200, 16, 46], category: 'reds', type: 'warm' },
  { code: 'PANTONE 18-1142 TPG', name: 'Flame', hex: '#E25822', rgb: [226, 88, 34], category: 'reds', type: 'warm' },
  
  // 蓝色系列
  { code: 'PANTONE 19-4052 TPG', name: 'Classic Blue', hex: '#0F4C75', rgb: [15, 76, 117], category: 'blues', type: 'cool' },
  { code: 'PANTONE 18-4043 TPG', name: 'Stellar', hex: '#0072CE', rgb: [0, 114, 206], category: 'blues', type: 'cool' },
  { code: 'PANTONE 17-4041 TPG', name: 'Cerulean', hex: '#9BB7D4', rgb: [155, 183, 212], category: 'blues', type: 'cool' },
  { code: 'PANTONE 15-4020 TPG', name: 'Powder Blue', hex: '#B6D7FF', rgb: [182, 215, 255], category: 'blues', type: 'cool' },
  
  // 绿色系列
  { code: 'PANTONE 17-5641 TPG', name: 'Emerald', hex: '#009B77', rgb: [0, 155, 119], category: 'greens', type: 'cool' },
  { code: 'PANTONE 15-0343 TPG', name: 'Greenery', hex: '#88B04B', rgb: [136, 176, 75], category: 'greens', type: 'cool' },
  { code: 'PANTONE 18-5633 TPG', name: 'Forest Green', hex: '#355E3B', rgb: [53, 94, 59], category: 'greens', type: 'cool' },
  { code: 'PANTONE 14-0123 TPG', name: 'Lime Punch', hex: '#D2E823', rgb: [210, 232, 35], category: 'greens', type: 'warm' },
  
  // 紫色系列
  { code: 'PANTONE 18-3838 TPG', name: 'Ultra Violet', hex: '#5F4B8C', rgb: [95, 75, 140], category: 'purples', type: 'cool' },
  { code: 'PANTONE 17-3834 TPG', name: 'Radiant Orchid', hex: '#B565A7', rgb: [181, 101, 167], category: 'purples', type: 'warm' },
  { code: 'PANTONE 17-3938 TPG', name: 'Very Peri', hex: '#6667AB', rgb: [102, 103, 171], category: 'purples', type: 'cool' },
  { code: 'PANTONE 19-3336 TPG', name: 'Royal Purple', hex: '#663399', rgb: [102, 51, 153], category: 'purples', type: 'cool' },
  
  // 橙色/黄色系列
  { code: 'PANTONE 15-1264 TPG', name: 'Living Coral', hex: '#FF6F61', rgb: [255, 111, 97], category: 'oranges', type: 'warm' },
  { code: 'PANTONE 14-1064 TPG', name: 'Tangerine Tango', hex: '#DD4124', rgb: [221, 65, 36], category: 'oranges', type: 'warm' },
  { code: 'PANTONE 13-0859 TPG', name: 'Illuminating', hex: '#F5DF4D', rgb: [245, 223, 77], category: 'yellows', type: 'warm' },
  { code: 'PANTONE 12-0736 TPG', name: 'Mimosa', hex: '#EFC050', rgb: [239, 192, 80], category: 'yellows', type: 'warm' },
  
  // 中性色系列
  { code: 'PANTONE 17-1210 TPG', name: 'Warm Gray', hex: '#A0A0A0', rgb: [160, 160, 160], category: 'neutrals', type: 'neutral' },
  { code: 'PANTONE 18-1142 TPG', name: 'Cognac', hex: '#9E4624', rgb: [158, 70, 36], category: 'neutrals', type: 'warm' },
  { code: 'PANTONE 19-4007 TPG', name: 'Eclipse', hex: '#343148', rgb: [52, 49, 72], category: 'neutrals', type: 'neutral' },
  { code: 'PANTONE 11-4001 TPG', name: 'Bright White', hex: '#F7F7F7', rgb: [247, 247, 247], category: 'neutrals', type: 'neutral' },
]

interface ColorCardProps {
  color: typeof pantoneColors[0]
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
  const textColor = color.hex === '#F7F7F7' || color.type === 'warm' && color.hex.includes('FF') ? '#000' : '#FFF'
  
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
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{color.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{color.code}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              RGB({color.rgb.join(', ')})
            </span>
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
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = [...new Set(pantoneColors.map(color => color.category))]
    return ['all', ...cats.sort()]
  }, [])

  // 过滤颜色
  const filteredColors = useMemo(() => {
    return pantoneColors.filter(color => {
      const matchesSearch = color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           color.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           color.hex.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || color.category === selectedCategory
      return matchesSearch && matchesCategory
    })
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
      rgb: color.rgb
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pantone-colors.json'
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
                <p className="text-sm text-gray-600">2024年最新色彩标准参考</p>
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
                    {category === 'all' ? '全部分类' : 
                     category === 'reds' ? '红色系' :
                     category === 'blues' ? '蓝色系' :
                     category === 'greens' ? '绿色系' :
                     category === 'purples' ? '紫色系' :
                     category === 'oranges' ? '橙色系' :
                     category === 'yellows' ? '黄色系' :
                     category === 'neutrals' ? '中性色' :
                     category}
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
