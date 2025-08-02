"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, Play, Pause, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EchoVerse() {
  const [text, setText] = useState("")
  const [voice, setVoice] = useState("female")
  const [speed, setSpeed] = useState("normal")
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()

  const generateSpeech = async () => {
    if (!text.trim()) return

    setIsGenerating(true)

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          voice,
          speed,
        }),
      })

      if (!response.ok) {
        throw new Error("Speech generation failed")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      toast({
        title: "Speech Generated",
        description: "Your text has been converted to speech successfully",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating speech",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const downloadAudio = () => {
    if (!audioUrl) return

    const a = document.createElement("a")
    a.href = audioUrl
    a.download = "echo-verse-audio.wav"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Echo Verse - Text to Speech
          </CardTitle>
          <CardDescription>
            Convert your legal documents and text into natural-sounding speech using advanced AI voice synthesis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Input */}
          <div className="space-y-2">
            <label className="font-medium">Text to Convert</label>
            <Textarea
              placeholder="Enter the text you want to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[150px]"
            />
            <p className="text-xs text-gray-500">{text.length} characters • Optimal length: 100-1000 characters</p>
          </div>

          {/* Voice Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium">Voice Type</label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female Voice</SelectItem>
                  <SelectItem value="male">Male Voice</SelectItem>
                  <SelectItem value="neutral">Neutral Voice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="font-medium">Speech Speed</label>
              <Select value={speed} onValueChange={setSpeed}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateSpeech}
            disabled={!text.trim() || isGenerating}
            className="w-full bg-slate-800 hover:bg-slate-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Speech...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Generate Speech
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Audio Player */}
      {audioUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button onClick={togglePlayback} variant="outline" size="sm">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button onClick={downloadAudio} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="flex-1" controls />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
