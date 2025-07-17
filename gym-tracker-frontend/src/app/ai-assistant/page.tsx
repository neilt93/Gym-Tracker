'use client'
import { useEffect, useState } from 'react'
import { TEST_USER_ID } from '@/lib/constants'

export default function AIAssistantPage() {
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    async function fetchChatHistory() {
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'chat', data: { userId: TEST_USER_ID, question: '' } }),
        })
        if (res.ok) {
          const data = await res.json()
          setChatHistory(data.chatHistory || [])
        }
      } catch (err) {
        // ignore
      }
    }
    fetchChatHistory()
  }, [])

  const handleSendChat = async () => {
    if (!chatInput.trim()) return
    setChatLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', data: { userId: TEST_USER_ID, question: chatInput } }),
      })
      if (res.ok) {
        const data = await res.json()
        setChatHistory(data.chatHistory || [])
        setChatInput('')
      }
    } catch (err) {
      // ignore
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold text-center">AI Assistant</h1>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">How can I help you today?</h2>
        
        <div className="flex flex-col gap-4 max-h-96 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg">
          {chatHistory.length === 0 && (
            <div className="text-gray-500 text-center py-8">              <div className="text-4xl mb-4">🤖</div>
              <p className="text-lg">No questions yet. Ask me anything about your fitness, workouts, meals, or progress!</p>
            </div>
          )}
          {chatHistory.slice().reverse().map((msg, idx) => (
            <div key={msg.id || idx} className="space-y-2">              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  You
                </div>
                <div className="flex-1">
                  <div className="bg-blue-100 rounded-lg text-gray-800">{msg.question}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <div className="flex-1">
                  <div className="bg-purple-100 rounded-lg text-gray-800">{msg.response}</div>
                  <div className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-3">
          <input
            type="text"         className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            placeholder="How can I help you today?"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSendChat() }}
            disabled={chatLoading}
          />
          <button
            onClick={handleSendChat}
            disabled={chatLoading || !chatInput.trim()}
            className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
          >
            {chatLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
} 