import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log("本地API路由调用开始...")

    const { input, intensity } = await request.json()
    console.log("接收到的参数:", { input, intensity })

    // 检查环境变量
    const apiKey = process.env.OPENROUTER_API_KEY
    console.log("环境变量检查:", apiKey ? "存在" : "不存在")

    if (!apiKey) {
      console.error("OPENROUTER_API_KEY 环境变量未设置")
      return NextResponse.json(
        { error: "服务配置错误：API密钥未设置。请联系管理员。" },
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

    console.log("准备调用OpenRouter API...")

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://humor-response-generator.netlify.app",
        "X-Title": "Humor Response Generator",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-prover-v2:free",
        messages: [
          {
            role: "system",
            content: `你是一个顶级的幽默回应专家，擅长用${strategy.style}的方式进行机智回击。

【任务】：针对用户输入的"对方的话"，生成3条${strategy.style}的犀利回复。

【风格要求】：
- 强度级别：${intensity}/10 (${strategy.style})
- 回击策略：${strategy.description}
- 表达方式：${strategy.examples}
- 语言风格：${strategy.tone}

【具体要求】：
1. 每条回复必须幽默、机智、有创意
2. 充分利用中文的语言特色和网络文化
3. 可以使用：
   - 网络流行梗和表情包文化
   - 巧妙的文字游戏和谐音梗
   - 反转逻辑和对比手法
   - 夸张比喻和形象描述
4. 每条回复控制在30-50字
5. 避免人身攻击，保持机智而不失风度
6. 让对方哑口无言但又不得不佩服你的机智

【输出格式】：
直接返回3条回复，用换行符分隔，不要序号或其他格式。

现在请发挥你的才华，给出最犀利的回复！`,
          },
          {
            role: "user",
            content: `对方说："${input}"
            
请根据这句话的具体内容和语境，生成3条${strategy.style}的回复。要让回复既幽默又犀利，让对方印象深刻！`,
          },
        ],
        temperature: 0.9,
        max_tokens: 400,
        top_p: 0.95,
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

    // 更好的回复解析和过滤
    const responses = content
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => {
        return line && line.length > 5 && !line.match(/^[0-9.\-*\s]*$/) && !line.match(/^[回复|答案|回应][：:]/)
      })
      .slice(0, 3)

    // 如果回复数量不足，尝试重新解析
    if (responses.length < 3) {
      const allLines = content.split(/[。！？\n]/).filter((line: string) => line.trim().length > 5)
      responses.push(...allLines.slice(0, 3 - responses.length))
    }

    console.log("生成的回复:", responses)

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
