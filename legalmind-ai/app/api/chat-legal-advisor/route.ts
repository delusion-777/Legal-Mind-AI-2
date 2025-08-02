import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN)

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 })
    }

    // Use a conversational model that's available
    const conversationPrompt = `Legal Assistant: I'm here to provide general legal information. Please remember this is not legal advice.

User: ${message}

Legal Assistant:`

    try {
      // Try using a text generation model that's available
      const response = await hf.textGeneration({
        model: "gpt2",
        inputs: conversationPrompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          return_full_text: false,
          pad_token_id: 50256,
        },
      })

      let answer = response.generated_text || ""

      // Clean up the response
      answer = answer.replace(/Legal Assistant:/g, "").trim()

      // If the response is too short or doesn't make sense, provide a fallback
      if (answer.length < 10 || !answer) {
        answer = generateFallbackResponse(message)
      }

      return NextResponse.json({
        answer: answer,
        disclaimer:
          "This response is for informational purposes only and does not constitute legal advice. Please consult with a qualified legal professional for specific legal matters.",
      })
    } catch (modelError) {
      // If the model fails, provide a contextual fallback response
      const answer = generateFallbackResponse(message)

      return NextResponse.json({
        answer: answer,
        disclaimer:
          "This response is for informational purposes only and does not constitute legal advice. Please consult with a qualified legal professional for specific legal matters.",
      })
    }
  } catch (error) {
    console.error("Legal chat error:", error)
    return NextResponse.json(
      {
        error: "Failed to process legal inquiry",
        answer:
          "I apologize, but I'm unable to process your legal question at the moment. Please try again or consult with a qualified legal professional.",
      },
      { status: 500 },
    )
  }
}

// Helper function to generate contextual responses
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("contract") || lowerMessage.includes("agreement")) {
    return "For contract-related questions, I recommend reviewing the specific terms and conditions with a qualified attorney. Key considerations typically include parties involved, obligations, payment terms, and termination clauses. Each contract should be tailored to your specific situation."
  }

  if (lowerMessage.includes("copyright") || lowerMessage.includes("trademark")) {
    return "Intellectual property matters require careful consideration of federal and state laws. For copyright issues, consider factors like originality, fair use, and registration. For trademarks, focus on distinctiveness and potential conflicts. I recommend consulting with an IP attorney for specific guidance."
  }

  if (lowerMessage.includes("employment") || lowerMessage.includes("workplace")) {
    return "Employment law varies significantly by jurisdiction and situation. Common areas include wage and hour laws, discrimination, harassment, and wrongful termination. Document any workplace issues and consider consulting with an employment attorney who can review your specific circumstances."
  }

  if (lowerMessage.includes("privacy") || lowerMessage.includes("data")) {
    return "Privacy and data protection laws like GDPR, CCPA, and others have specific requirements for data collection, processing, and storage. Key considerations include consent, data minimization, security measures, and user rights. Consult with a privacy attorney for compliance guidance."
  }

  return "Thank you for your legal question. While I can provide general information, the best approach is to consult with a qualified attorney who can review your specific situation and provide personalized legal advice based on applicable laws in your jurisdiction."
}
