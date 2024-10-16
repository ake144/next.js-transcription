'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TranscriptionAppComponent() {
  const [isListening, setIsListening] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true


     

      recognitionRef.current.onresult = (event:any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        setTranscription(finalTranscript + interimTranscript)
      }
    } else {
      console.error('Speech recognition not supported')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])


  const hadleAudioTranscription = async () => {
    if (!audioFile) return

    setIsTranscribing(true)

    const formData = new FormData()
    formData.append('file', audioFile)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const result = await response.json()
      setTranscription(result.text)
    } catch (error) {
      console.error('Error during transcription:', error)
      alert('An error occurred during transcription. Please try again.')
    } finally {
      setIsTranscribing(false)
    }     
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
    setIsListening(!isListening)
  }

  const downloadTranscription = () => {
    const element = document.createElement('a')
    const file = new Blob([transcription], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = 'transcription.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Audio Transcription App</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="audio-upload">Upload Audio File</Label>
          <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileUpload} />
        </div>
        <Textarea 
          value={transcription} 
          readOnly 
          placeholder = {isTranscribing ? "Transcribing": "Your transcription will appear here..."}
          className="min-h-[200px]"
        />
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-2">
        <Button onClick={toggleListening} variant={isListening ? "destructive" : "default"}>
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </Button>
        <Button onClick={hadleAudioTranscription} disabled={!audioFile}>
          Transcribe Audio File
        </Button>
        <Button onClick={downloadTranscription} disabled={!transcription}>
          Download Transcription
        </Button>
      </CardFooter>
    </Card>
  )
}