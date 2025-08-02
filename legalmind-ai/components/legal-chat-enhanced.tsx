"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function LegalChatEnhanced() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI legal assistant. I can help answer general legal questions, but please remember that this is not a substitute for professional legal advice. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Local fallback responses for common legal questions
  const generateLocalResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    const responses = {
      contract:
        "For contract-related questions, key considerations include: parties involved, clear obligations, payment terms, termination clauses, and dispute resolution. Always have contracts reviewed by a qualified attorney before signing.",

      copyright:
        "Copyright protection generally covers original works of authorship. Key points: automatic protection upon creation, registration provides additional benefits, fair use exceptions exist, and duration varies by work type. Consult an IP attorney for specific cases.",

      employment:
        "Employment law covers wages, discrimination, harassment, and workplace safety. Important: document workplace issues, know your rights under federal and state laws, and consider consulting an employment attorney for serious matters.",

      privacy:
        "Privacy laws like GDPR and CCPA require proper data handling. Key requirements: obtain consent, implement security measures, provide user rights, and maintain compliance documentation. Consult a privacy attorney for specific compliance needs.",

      business:
        "Business formation involves choosing entity type (LLC, Corporation, etc.), registering with appropriate authorities, obtaining necessary licenses, and maintaining compliance. Each business type has different legal and tax implications.",

      default:
        "Thank you for your question. For specific legal matters, I recommend consulting with a qualified attorney who can provide personalized advice based on your situation and applicable laws in your jurisdiction.",
    }

    for (const [key, response] of Object.entries(responses)) {
      if (key !== "default" && lowerMessage.includes(key)) {
        return response
      }
    }

    return responses.default
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat-legal-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          context: "General legal consultation",
        }),
      })

      let aiResponse = ""

      if (response.ok) {
        const result = await response.json()
        aiResponse = result.answer

        if (result.disclaimer) {
          toast({
            title: "Legal Disclaimer",
            description: result.disclaimer,
            duration: 5000,
          })
        }
      } else {
        // Use local fallback if API fails
        aiResponse = generateLocalResponse(currentMessage)

        toast({
          title: "Using Offline Mode",
          description: "AI service unavailable, using local responses",
          variant: "default",
        })
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      // Use local fallback response
      const fallbackResponse = generateLocalResponse(currentMessage)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      toast({
        title: "Offline Mode",
        description: "Using local legal information database",
        variant: "default",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Legal AI Assistant
          <div className="ml-auto flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="w-3 h-3" />
            Beta
          </div>
        </CardTitle>
        <CardDescription>
          Get general legal information and guidance. Always consult with qualified legal professionals for specific
          advice. This assistant works in both online and offline modes.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask a legal question (e.g., 'What should I know about contracts?')"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-h-[60px]"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-slate-800 hover:bg-slate-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Questions */}
        <div className="mt-2 flex flex-wrap gap-2">
          {["Contract basics", "Copyright info", "Employment rights", "Privacy laws"].map((question) => (
            <Button
              key={question}
              variant="outline"
              size="sm"
              onClick={() => setInputMessage(`Tell me about ${question.toLowerCase()}`)}
              disabled={isLoading}
              className="text-xs"
            >
              {question}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
