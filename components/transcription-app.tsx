'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Download, Headphones, Upload } from 'lucide-react'

export default function TranscriptionAppComponent() {
  const [transcription, setTranscription] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)

  const handleAudioTranscription = async () => {
    if (!audioFile) return

    setIsTranscribing(true)
    setProgress(0)

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

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader?.read() || {}
        if (done) break

        const chunk = decoder.decode(value)
        setTranscription(prev => prev + chunk)
        setProgress(prev => Math.min(prev + 10, 90))
      }

      setProgress(100)
    } catch (error) {
      console.error('Error during transcription:', error)
      alert('An error occurred during transcription. Please try again.')
    } finally {
      setIsTranscribing(false)
    }     
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
      setTranscription('')
      setProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Audio Transcription <span className="text-primary">Made Easy</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Upload your audio file and get accurate transcriptions in minutes. Perfect for podcasts, interviews, and more.
          </p>
        </div>

        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Start Your Transcription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="audio-upload" className="text-lg font-medium">
                Upload Audio File
              </Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="audio-upload" 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {audioFile && <CheckCircle className="text-green-500" />}
              </div>
              {audioFile && (
                <p className="text-sm text-gray-500">
                  Selected file: {audioFile.name}
                </p>
              )}
            </div>
            
            {isTranscribing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Transcribing...</span>
                  <span className="text-sm font-medium text-gray-700">{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <Textarea 
              value={transcription} 
              readOnly 
              placeholder={isTranscribing ? "Transcribing..." : "Your transcription will appear here..."}
              className="min-h-[200px] text-sm"
            />
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-4">
            <Button 
              onClick={handleAudioTranscription} 
              disabled={!audioFile || isTranscribing}
              className="flex-1"
            >
              {isTranscribing ? (
                <>
                  <Headphones className="mr-2 h-4 w-4 animate-pulse" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Transcribe Audio
                </>
              )}
            </Button>
            <Button 
              onClick={downloadTranscription} 
              disabled={!transcription}
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Transcription
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={<Upload className="h-6 w-6" />}
            title="Easy Upload"
            description="Simply drag and drop your audio file or use our file picker."
          />
          <FeatureCard 
            icon={<Headphones className="h-6 w-6" />}
            title="Accurate Transcription"
            description="Our advanced AI ensures high-quality transcriptions."
          />
          <FeatureCard 
            icon={<Download className="h-6 w-6" />}
            title="Instant Download"
            description="Get your transcription in a downloadable text format."
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary text-white mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-base text-gray-500">{description}</p>
    </div>
  )
}