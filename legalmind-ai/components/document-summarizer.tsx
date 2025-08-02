"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DocumentSummarizer() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState("")
  const [summaryLength, setSummaryLength] = useState("medium")
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Read file content for text files
      if (selectedFile.type === "text/plain") {
        const reader = new FileReader()
        reader.onload = (e) => {
          setText(e.target?.result as string)
        }
        reader.readAsText(selectedFile)
      }
    }
  }

  const summarizeDocument = async () => {
    if (!file && !text.trim()) return

    setIsSummarizing(true)
    const formData = new FormData()

    if (file) {
      formData.append("file", file)
    } else {
      formData.append("text", text)
    }
    formData.append("length", summaryLength)

    try {
      const response = await fetch("/api/summarize-document", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Summarization failed")
      }

      const result = await response.json()
      setSummary(result.summary)

      toast({
        title: "Summarization Complete",
        description: "Your document has been summarized successfully",
      })
    } catch (error) {
      toast({
        title: "Summarization Failed",
        description: "There was an error summarizing your document",
        variant: "destructive",
      })
    } finally {
      setIsSummarizing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Summarizer
          </CardTitle>
          <CardDescription>Generate concise summaries of legal documents using advanced AI technology.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="font-medium">Upload Document or Enter Text</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="summarizer-upload"
                  />
                  <label htmlFor="summarizer-upload" className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:text-blue-500">
                      {file ? file.name : "Choose file to upload"}
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Or Enter Text</label>
                <Textarea
                  placeholder="Paste your document text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Summary Length */}
          <div className="space-y-2">
            <label className="font-medium">Summary Length</label>
            <Select value={summaryLength} onValueChange={setSummaryLength}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (1-2 paragraphs)</SelectItem>
                <SelectItem value="medium">Medium (3-4 paragraphs)</SelectItem>
                <SelectItem value="long">Long (5+ paragraphs)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summarize Button */}
          <Button
            onClick={summarizeDocument}
            disabled={(!file && !text.trim()) || isSummarizing}
            className="w-full bg-slate-800 hover:bg-slate-700"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              "Generate Summary"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Summary Results */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Document Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
