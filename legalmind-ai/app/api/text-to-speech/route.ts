import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN)

export async function POST(request: NextRequest) {
  try {
    const { text, voice, speed } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Map voice preferences to available models
    const voiceModels = {
      female: "microsoft/speecht5_tts",
      male: "microsoft/speecht5_tts",
      neutral: "microsoft/speecht5_tts",
    }

    // Speed mapping
    const speedSettings = {
      slow: 0.8,
      normal: 1.0,
      fast: 1.2,
    }

    // Limit text length for better processing
    const processedText = text.substring(0, 1000)

    // Generate speech using Hugging Face
    const audioBlob = await hf.textToSpeech({
      model: voiceModels[voice] || "microsoft/speecht5_tts",
      inputs: processedText,
    })

    // Convert blob to buffer
    const buffer = Buffer.from(await audioBlob.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": "attachment; filename=echo-verse-audio.wav",
      },
    })
  } catch (error) {
    console.error("Text-to-speech error:", error)

    // Generate a simple tone as fallback
    const generateTone = (frequency: number, duration: number, sampleRate = 44100) => {
      const samples = sampleRate * duration
      const buffer = Buffer.alloc(samples * 2)

      for (let i = 0; i < samples; i++) {
        const sample = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.3
        const intSample = Math.round(sample * 32767)
        buffer.writeInt16LE(intSample, i * 2)
      }

      return buffer
    }

    const fallbackAudio = generateTone(440, 2) // 2-second A4 tone

    return new NextResponse(fallbackAudio, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": fallbackAudio.length.toString(),
      },
    })
  }
}
