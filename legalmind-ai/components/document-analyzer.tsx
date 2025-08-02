"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Globe, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DocumentAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState("english")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      if (droppedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB",
          variant: "destructive",
        })
        return
      }
      setFile(droppedFile)
    }
  }

  const analyzeDocument = async () => {
    if (!file) return

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("language", language)

    try {
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()
      setAnalysis(result.analysis)

      toast({
        title: "Analysis Complete",
        description: "Your document has been analyzed successfully",
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your document",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            AI-Powered Legal Document Analyzer
          </CardTitle>
          <CardDescription>
            Upload legal documents for comprehensive AI analysis with multilingual support and detailed improvement
            suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <h3 className="font-medium">Upload Legal Document</h3>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">{file ? file.name : "Choose File"}</p>
                <p className="text-sm text-gray-600">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "No file chosen"}
                </p>
                <p className="text-xs text-gray-500">Supports PDF, DOC, DOCX, and TXT files (max 50MB)</p>
                <p className="text-xs text-gray-400">
                  Your documents are processed securely using advanced AI analysis
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium">
              <Globe className="w-4 h-4" />
              Analysis Language
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">🇺🇸 English (English)</SelectItem>
                <SelectItem value="spanish">🇪🇸 Spanish (Español)</SelectItem>
                <SelectItem value="french">🇫🇷 French (Français)</SelectItem>
                <SelectItem value="german">🇩🇪 German (Deutsch)</SelectItem>
                <SelectItem value="italian">🇮🇹 Italian (Italiano)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={analyzeDocument}
            disabled={!file || isAnalyzing}
            className="w-full bg-slate-800 hover:bg-slate-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Document with AI...
              </>
            ) : (
              "Analyze Document with AI"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">{analysis}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
