"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, FileSearch, Volume2, MessageCircle } from "lucide-react"
import DocumentAnalyzer from "@/components/document-analyzer"
import DocumentSummarizer from "@/components/document-summarizer"
import EchoVerse from "@/components/echo-verse"
import LegalChatEnhanced from "@/components/legal-chat-enhanced"

export default function LegalMindAI() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">LegalMind AI</h1>
            <p className="text-sm text-gray-600">Advanced Legal Intelligence Platform</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="analyzer" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="analyzer" className="flex items-center gap-2">
              <FileSearch className="w-4 h-4" />
              Document Analyzer
            </TabsTrigger>
            <TabsTrigger value="summarizer" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document Summarizer
            </TabsTrigger>
            <TabsTrigger value="echo-verse" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Echo Verse
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Legal Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer">
            <DocumentAnalyzer />
          </TabsContent>

          <TabsContent value="summarizer">
            <DocumentSummarizer />
          </TabsContent>

          <TabsContent value="echo-verse">
            <EchoVerse />
          </TabsContent>

          <TabsContent value="chat">
            <LegalChatEnhanced />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
