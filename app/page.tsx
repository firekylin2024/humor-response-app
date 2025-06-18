"use client"

import { useState, useEffect } from "react"
import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Share2, RotateCcw, MessageCircle, History, Loader2, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HumorResponse {
  id: string
  input: string
  intensity: number
  responses: string[]
  timestamp: number
}

function HumorResponsePage() {
  const [input, setInput] = useState("")
  const [intensity, setIntensity] = useState([5])
  const [responses, setResponses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HumorResponse[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const { toast } = useToast()

  // 加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem("humor-history")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  // 保存到历史记录
  const saveToHistory = (newResponse: HumorResponse) => {
    const updatedHistory = [newResponse, ...history].slice(0, 10)
    setHistory(updatedHistory)
    localStorage.setItem("humor-history", JSON.stringify(updatedHistory))
  }

  // 生成幽默回复
  const generateHumor = async () => {
    if (!input.trim()) {
      toast({
        title: "请输入对方的话",
        description: "我需要知道对方说了什么才能帮你回击 😄",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    console.log("开始生成幽默回复...", { input, intensity: intensity[0] })

    try {
      const response = await fetch("/.netlify/functions/generate-humor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, intensity: intensity[0] }),
      })

      console.log("API响应状态:", response.status)

      const data = await response.json()
      console.log("API响应数据:", data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: 请求失败`)
      }

      if (!data.responses || data.responses.length === 0) {
        throw new Error("没有生成任何回复，请重试")
      }

      setResponses(data.responses)

      // 保存到历史记录
      const newResponse: HumorResponse = {
        id: Date.now().toString(),
        input,
        intensity: intensity[0],
        responses: data.responses,
        timestamp: Date.now(),
      }
      saveToHistory(newResponse)

      toast({
        title: "生成成功！",
        description: `${data.responses.length}条犀利回复已准备就绪 🎯`,
      })
    } catch (error) {
      console.error("生成失败:", error)
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "未知错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 复制文本
  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "复制成功！",
        description: "回复已复制到剪贴板 📋",
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制文本",
        variant: "destructive",
      })
    }
  }

  // 分享功能
  const shareApp = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "链接已复制！",
        description: "快去分享给朋友们吧 🚀",
      })
    } catch (error) {
      toast({
        title: "分享失败",
        description: "请手动复制网址",
        variant: "destructive",
      })
    }
  }

  // 加载历史记录
  const loadHistoryItem = (item: HumorResponse) => {
    setInput(item.input)
    setIntensity([item.intensity])
    setResponses(item.responses)
    setShowHistory(false)
  }

  const getIntensityLabel = (value: number) => {
    if (value <= 3) return "温和暗讽"
    if (value <= 7) return "适中机智"
    return "犀利直白"
  }

  const getIntensityColor = (value: number) => {
    if (value <= 3) return "text-blue-600"
    if (value <= 7) return "text-yellow-600"
    return "text-red-600"
  }

  const getIntensityEmoji = (value: number) => {
    if (value <= 3) return "😏"
    if (value <= 7) return "😎"
    return "🔥"
  }

  return (
    <>
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">幽默回应</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="text-gray-600">
                <History className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={shareApp} className="text-gray-600">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 历史记录 */}
        {showHistory && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">历史记录</h3>
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无历史记录</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => loadHistoryItem(item)}
                    >
                      <p className="text-sm text-gray-800 truncate">{item.input}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        强度: {item.intensity}/10 • {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 输入区域 */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">对方说了什么？</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入对方的话，让我帮你想个犀利的回复..."
                className="min-h-[100px] resize-none"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{input.length}/200</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                语气强烈程度: {intensity[0]}/10 {getIntensityEmoji(intensity[0])}
                <span className={`ml-2 text-sm ${getIntensityColor(intensity[0])}`}>
                  ({getIntensityLabel(intensity[0])})
                </span>
              </label>
              <Slider value={intensity} onValueChange={setIntensity} max={10} min={1} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>温和 😏</span>
                <span>犀利 🔥</span>
              </div>
            </div>

            <Button
              onClick={generateHumor}
              disabled={loading || !input.trim()}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  正在生成犀利回复...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  开始吵架 🔥
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 回复结果 */}
        {responses.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">犀利回复 🎯</h3>
            {responses.map((response, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <p className="text-gray-800 flex-1 leading-relaxed text-base">{response}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyText(response)}
                      className="text-gray-500 hover:text-green-600 flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={generateHumor} disabled={loading} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              重新生成更犀利的回复
            </Button>
          </div>
        )}

        {/* 使用说明 */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-800 mb-2">💡 犀利回击指南</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 强度1-3 😏：温和冷幽默，用优雅的方式暗讽</li>
              <li>• 强度4-7 😎：机智犀利，用逻辑和比喻反击</li>
              <li>• 强度8-10 🔥：直白犀利，不留情面的有力回击</li>
              <li>• 每次生成3条不同风格的回复，总有一条适合你</li>
            </ul>
          </CardContent>
        </Card>

        {/* 测试区域 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-800 mb-3">🧪 犀利测试用例</h4>

            <div className="grid grid-cols-1 gap-3 mb-4">
              {[
                { text: "你这个想法太幼稚了", intensity: 3, desc: "温和反击" },
                { text: "你根本不懂这个行业", intensity: 6, desc: "机智回应" },
                { text: "你这样永远不会成功的", intensity: 8, desc: "犀利反击" },
                { text: "你的审美真的很奇怪", intensity: 5, desc: "巧妙回击" },
                { text: "我觉得你不适合这份工作", intensity: 7, desc: "专业反击" },
                { text: "你怎么连这个都不知道", intensity: 9, desc: "强力回击" },
              ].map((test, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(test.text)
                    setIntensity([test.intensity])
                  }}
                  className="text-xs text-blue-700 border-blue-300 hover:bg-blue-100 text-left justify-start"
                >
                  <span className="truncate">"{test.text}"</span>
                  <span className="ml-auto text-blue-500">
                    {test.intensity}/10 {test.desc}
                  </span>
                </Button>
              ))}
            </div>

            {/* API连接测试 */}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch("/.netlify/functions/generate-humor", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ input: "测试连接", intensity: 5 }),
                  })
                  const data = await response.json()
                  toast({
                    title: response.ok ? "API连接正常 ✅" : "API连接失败 ❌",
                    description: response.ok ? "服务运行正常" : data.error || "请检查配置",
                    variant: response.ok ? "default" : "destructive",
                  })
                } catch (error) {
                  toast({
                    title: "连接测试失败 ❌",
                    description: "网络或服务器错误",
                    variant: "destructive",
                  })
                }
              }}
              className="text-xs text-blue-700 border-blue-300 hover:bg-blue-100 w-full"
            >
              🔗 测试API连接
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <AuthWrapper>
      <HumorResponsePage />
    </AuthWrapper>
  )
}
