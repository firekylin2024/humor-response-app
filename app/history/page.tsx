'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  Copy, 
  Trash2, 
  Calendar, 
  Flame, 
  MessageCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { HumorResponse } from '@/lib/supabase/database.types'

export default function HistoryPage() {
  const [history, setHistory] = useState<HumorResponse[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HumorResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [intensityFilter, setIntensityFilter] = useState<string>('all')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchHistory()
    }
  }, [user])

  useEffect(() => {
    filterHistory()
  }, [history, searchTerm, intensityFilter])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }
    setUser(user)
  }

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/history')
      
      if (!response.ok) {
        throw new Error('获取历史记录失败')
      }
      
      const data = await response.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error('获取历史记录失败:', error)
      toast({
        title: "获取失败",
        description: "无法获取历史记录，请重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterHistory = () => {
    let filtered = [...history]

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.responses.some(response => 
          response.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // 强度过滤
    if (intensityFilter !== 'all') {
      const intensity = parseInt(intensityFilter)
      filtered = filtered.filter(item => {
        if (intensityFilter === 'low') return item.intensity <= 3
        if (intensityFilter === 'medium') return item.intensity >= 4 && item.intensity <= 7
        if (intensityFilter === 'high') return item.intensity >= 8
        return item.intensity === intensity
      })
    }

    setFilteredHistory(filtered)
  }

  const deleteRecord = async (id: string) => {
    try {
      setDeleteLoading(id)
      const response = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      setHistory(prev => prev.filter(item => item.id !== id))
      toast({
        title: "删除成功",
        description: "历史记录已删除",
      })
    } catch (error) {
      console.error('删除失败:', error)
      toast({
        title: "删除失败",
        description: "无法删除记录，请重试",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "复制成功",
        description: "内容已复制到剪贴板",
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制文本",
        variant: "destructive",
      })
    }
  }

  const useHistoryItem = (item: HumorResponse) => {
    // 将历史记录数据传递给主页面
    const params = new URLSearchParams({
      input: item.input,
      intensity: item.intensity.toString(),
      responses: JSON.stringify(item.responses)
    })
    router.push(`/?${params.toString()}`)
  }

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 3) return { label: "温和", color: "bg-blue-100 text-blue-800" }
    if (intensity <= 7) return { label: "机智", color: "bg-yellow-100 text-yellow-800" }
    return { label: "犀利", color: "bg-red-100 text-red-800" }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">加载历史记录...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-green-500" />
                <h1 className="text-xl font-bold text-gray-800">历史记录</h1>
                <Badge variant="secondary">{history.length}</Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistory}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 搜索和过滤 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索历史记录..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={intensityFilter} onValueChange={setIntensityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="强度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部强度</SelectItem>
                    <SelectItem value="low">温和 (1-3)</SelectItem>
                    <SelectItem value="medium">机智 (4-7)</SelectItem>
                    <SelectItem value="high">犀利 (8-10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 历史记录列表 */}
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || intensityFilter !== 'all' ? '没有找到匹配的记录' : '还没有历史记录'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || intensityFilter !== 'all' 
                  ? '尝试调整搜索条件或过滤器' 
                  : '开始使用幽默回应生成器，创建你的第一条记录吧！'
                }
              </p>
              {(!searchTerm && intensityFilter === 'all') && (
                <Button onClick={() => router.push('/')} className="bg-green-500 hover:bg-green-600">
                  开始使用
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const intensityInfo = getIntensityLabel(item.intensity)
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={intensityInfo.color}>
                            <Flame className="w-3 h-3 mr-1" />
                            {intensityInfo.label} {item.intensity}/10
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(item.created_at)}
                          </div>
                        </div>
                        <CardTitle className="text-base font-medium text-gray-800 cursor-pointer hover:text-green-600"
                                   onClick={() => copyText(item.input)}>
                          "{item.input}"
                        </CardTitle>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => useHistoryItem(item)}
                          className="text-green-600 hover:text-green-700"
                        >
                          使用
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecord(item.id)}
                          disabled={deleteLoading === item.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deleteLoading === item.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">生成的回复：</h4>
                      {item.responses.map((response, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-gray-800 flex-1 leading-relaxed">{response}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyText(response)}
                            className="text-gray-500 hover:text-green-600 ml-2"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 