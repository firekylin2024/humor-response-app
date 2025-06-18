import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log("本地API路由调用开始...")

    const { input, intensity } = await request.json()
    console.log("接收到的参数:", { input, intensity })

    // 检查环境变量 - 支持多个 AI 提供商
    const openRouterKey = process.env.OPENROUTER_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    
    console.log("AI API 检查:", {
      openRouter: openRouterKey ? "存在" : "不存在",
      openai: openaiKey ? "存在" : "不存在", 
      anthropic: anthropicKey ? "存在" : "不存在"
    })

    if (!openRouterKey && !openaiKey && !anthropicKey) {
      console.error("没有可用的 AI API 密钥")
      return NextResponse.json(
        { error: "服务配置错误：请设置至少一个 AI API 密钥。" },
        { status: 500 }
      )
    }

    // 内容过滤
    const inappropriateKeywords = ["暴力", "色情", "政治", "歧视", "仇恨"]
    if (inappropriateKeywords.some((keyword) => input.includes(keyword))) {
      return NextResponse.json(
        { error: "请输入更加友善的内容，让我们保持幽默而不失礼貌 😊" },
        { status: 400 }
      )
    }

    // 根据强度级别设计不同的提示词策略
    const getPromptStrategy = (intensity: number) => {
      if (intensity <= 3) {
        return {
          style: "温和冷幽默",
          description: "用巧妙的暗讽和冷幽默回击，让对方自己体会到被怼的感觉",
          examples: "比如用反问、对比、夸张等手法，看似夸奖实则暗讽",
          tone: "优雅而不失锋芒，让人回味无穷",
        }
      } else if (intensity <= 7) {
        return {
          style: "机智犀利",
          description: "用聪明的逻辑和巧妙的比喻进行反击，既幽默又有力",
          examples: "运用网络梗、流行语、巧妙类比等方式",
          tone: "机智风趣，一针见血",
        }
      } else {
        return {
          style: "直白犀利",
          description: "直接有力的反击，不留情面但保持幽默感",
          examples: "用夸张对比、反转逻辑、犀利吐槽等方式",
          tone: "直接犀利，让对方无话可说",
        }
      }
    }

    const strategy = getPromptStrategy(intensity)

    // 选择可用的 AI 提供商
    let apiUrl, headers, model
    
    if (openRouterKey) {
      console.log("使用 OpenRouter API...")
      apiUrl = "https://openrouter.ai/api/v1/chat/completions"
      headers = {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://humor-response-generator.netlify.app",
        "X-Title": "Humor Response Generator",
      }
      model = "meta-llama/llama-3.2-3b-instruct:free"
    } else if (openaiKey) {
      console.log("使用 OpenAI API...")
      apiUrl = "https://api.openai.com/v1/chat/completions"
      headers = {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      }
      model = "gpt-3.5-turbo"
    } else if (anthropicKey) {
      console.log("使用 Anthropic API...")
      apiUrl = "https://api.anthropic.com/v1/messages"
      headers = {
        "x-api-key": anthropicKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      }
      model = "claude-3-haiku-20240307"
    }

    const response = await fetch(apiUrl!, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `你是一个专业的中文幽默回应专家，擅长用纯正的中文进行${strategy.style}的机智回击。

【核心任务】：为用户提供3条高质量的中文幽默回复。

【语言要求】：
- 必须使用纯正的中文，绝对不能出现英文单词或英文语气词
- 不能使用"huh"、"well"、"okay"等英文表达
- 使用地道的中文网络用语和表达方式
- 语言风格要符合中文用户的表达习惯

【回复风格】：
- 强度级别：${intensity}/10 (${strategy.style})
- 回击策略：${strategy.description}
- 表达方式：${strategy.examples}
- 语言风格：${strategy.tone}

【内容要求】：
1. 每条回复必须原创，不能重复或模仿用户的原话
2. 充分利用中文的语言特色：
   - 成语、俗语、歇后语的巧妙运用
   - 中文网络流行语和梗
   - 谐音、双关等中文特有的语言游戏
   - 反问、排比等中文修辞手法
3. 每条回复15-40字，简洁有力
4. 避免说教，重在机智和幽默
5. 保持礼貌的底线，不进行人身攻击

【输出格式】：
直接输出3条完整的句子，每条占一行，不要任何引号、序号、标题、解释或格式标记：

第一条完整句子
第二条完整句子
第三条完整句子

【严格禁止】：
- 不能包含任何英文单词或字母
- 不能重复用户的原话内容
- 不能出现"生成"、"回复"、"建议"等元词汇
- 不能有序号或格式标记
- 不能使用引号包围回复内容
- 不能使用对话格式如"我说："或"回复："

【回复示例格式】：
你这话说得真有道理，我都被说服了
你的想法确实很独特，让人印象深刻
你这逻辑清晰，我需要好好学习

现在请直接输出3条完整的句子，不要任何引号或格式标记！`,
          },
          {
            role: "user",
            content: `请针对这句话给出3条${strategy.style}的中文回复：
"${input}"`,
          },
        ],
        temperature: 0.8,
        max_tokens: 300,
        top_p: 0.9,
      }),
    })

    console.log("OpenRouter API响应状态:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API错误:", errorText)

      return NextResponse.json(
        { error: `AI服务暂时不可用 (${response.status})，请稍后重试` },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log("OpenRouter API响应:", data)

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      console.error("API返回内容为空")
      return NextResponse.json(
        { error: "生成回复失败，请重试" },
        { status: 500 }
      )
    }

    // 改进的回复解析和质量控制
    let responses = content
      .split(/[\n\r]+/)
      .map((line: string) => line.trim())
      .map((line: string) => {
        // 清理引号：移除开头和结尾的引号
        line = line.replace(/^["'""''「」『』]+|["'""''「」『』]+$/g, '')
        return line.trim()
      })
      .filter((line: string) => {
        // 更严格的过滤条件
        if (!line || line.length < 8 || line.length > 80) return false
        
        // 过滤包含英文的回复
        if (/[a-zA-Z]/.test(line)) return false
        
        // 过滤重复用户输入的回复
        if (line.includes(input) || input.includes(line)) return false
        
        // 过滤格式标记和序号
        if (line.match(/^[0-9.\-*\s]*$/)) return false
        if (line.match(/^[一二三四五六七八九十]\s*[、.]/)) return false
        if (line.match(/^[回复|答案|回应|建议|第][：:]/i)) return false
        
        // 过滤元词汇
        if (line.includes('生成') || line.includes('回复') || line.includes('建议')) return false
        if (line.startsWith('以下是') || line.startsWith('这里是')) return false
        
        // 确保是对话形式（包含"你"字）
        if (!line.includes('你')) return false
        
        return true
      })
      .slice(0, 3)

    // 如果回复数量不足，尝试更宽松的解析
    if (responses.length < 3) {
      console.log("回复数量不足，尝试重新解析...")
      const fallbackResponses = content
        .split(/[。！？\n]/)
        .map((line: string) => line.trim())
        .map((line: string) => {
          // 同样清理引号
          line = line.replace(/^["'""''「」『』]+|["'""''「」『』]+$/g, '')
          return line.trim()
        })
        .filter((line: string) => {
          return line.length >= 8 && 
                 line.length <= 60 && 
                 line.includes('你') &&
                 !/[a-zA-Z]/.test(line) &&
                 !line.includes(input) &&
                 !input.includes(line)
        })
        .slice(0, 3)
      
      responses = [...responses, ...fallbackResponses]
        .filter((item, index, arr) => arr.indexOf(item) === index) // 去重
        .slice(0, 3)
    }

    // 如果还是不足3条，添加智能备用回复
    if (responses.length < 3) {
      console.log("仍然不足3条，添加备用回复...")
      
      // 根据强度生成不同风格的备用回复
      const getBackupResponses = (userInput: string, intensityLevel: number) => {
        const backupPool = []
        
        if (intensityLevel <= 3) {
          // 温和风格备用回复
          backupPool.push(
            `你这话说得，让我想起了小时候的天真烂漫`,
            `哇，你的想法真是独树一帜呢`,
            `你这逻辑，连我都被说服了一半`,
            `你说得对，毕竟每个人的理解能力不同`,
            `你这么一说，我突然觉得自己见识浅薄了`
          )
        } else if (intensityLevel <= 7) {
          // 机智风格备用回复  
          backupPool.push(
            `你这话说得，我都不知道该夸你勇敢还是该同情你`,
            `你的自信程度和你的认知水平成反比啊`,
            `你这思路清奇，建议申请专利保护`,
            `你说得对，毕竟无知者无畏嘛`,
            `你这么说话，是怕别人不知道你的水平吗`
          )
        } else {
          // 犀利风格备用回复
          backupPool.push(
            `你这话说得，我都替你脸红了`,
            `你的嘴巴和你的脑子明显不在一个频道上`,
            `你这智商，真是让人刮目相看`,
            `你说话前能不能先过过脑子`,
            `你这水平，建议多读书少说话`
          )
        }
        
        // 随机选择备用回复，避免重复
        return backupPool
          .filter(reply => !responses.some((existing: string) => existing.includes(reply.slice(0, 5))))
          .slice(0, 3 - responses.length)
      }
      
      const backupReplies = getBackupResponses(input, intensity)
      responses = [...responses, ...backupReplies].slice(0, 3)
    }

    // 最后的保险措施：确保至少有一条回复
    if (responses.length === 0) {
      responses = [`你这话说得，我竟然无言以对了，厉害！`]
    }

    // 确保正好3条回复
    while (responses.length < 3) {
      const defaultReplies = [
        `你这想法很有创意，只是我理解能力有限`,
        `你说得对，毕竟角度不同看法就不同`,
        `你这话让我重新思考了人生`
      ]
      
      for (const reply of defaultReplies) {
        if (responses.length >= 3) break
        if (!responses.includes(reply)) {
          responses.push(reply)
        }
      }
      
      // 防止无限循环
      if (responses.length < 3 && responses.length > 0) {
        responses.push(`你这话说得很有道理，我需要好好想想`)
        break
      }
    }

    console.log("最终生成的回复:", responses)
    console.log("回复数量:", responses.length)

    return NextResponse.json({ responses: responses.slice(0, 3) })

  } catch (error) {
    console.error("API路由错误:", error)
    return NextResponse.json(
      {
        error: `生成回复时出现问题：${error instanceof Error ? error.message : "未知错误"}，请稍后重试 🤔`,
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
