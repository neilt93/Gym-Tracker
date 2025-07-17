'use client'
import { useEffect, useState } from 'react'

export default function JournalPage() {
  const [journalText, setJournalText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [journalEntries, setJournalEntries] = useState<any[]>([])

  useEffect(() => {
    async function fetchJournals() {
      try {
        const res = await fetch('/api/journal')
        if (res.ok) {
          const data = await res.json()
          setJournalEntries(data)
        }
      } catch (err) {
        // ignore
      }
    }
    fetchJournals()
  }, [])

  const handleSaveJournal = async () => {
    if (!journalText.trim()) return
    setAiLoading(true)
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: journalText }),
      })
      if (response.ok) {
        const result = await response.json()
        setJournalEntries(prev => [result, ...prev])
        setJournalText('')
      }
    } catch (error) {
      // ignore
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="mb-8 text-3t-bold text-center">Journal</h1>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <h2 className="mb-6 text-2font-semibold text-gray-800">Write Your Thoughts</h2>
        <textarea
          placeholder="Write your thoughts, reflections, or notes here..."
          value={journalText}
          onChange={e => setJournalText(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg min-h-150 focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4 text-lg resize-none"
        />
        <div className="flex gap-3">
          <button
            onClick={handleSaveJournal}
            disabled={aiLoading || !journalText.trim()}
            className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {aiLoading ? 'Saving... :  Entry' : 'Save Entry'}
          </button>
          <button
            onClick={() => setJournalText('')}
            className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Past Entries */}
      {journalEntries.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-10 p-6">
          <h2 className="mb-6 text-2font-semibold text-gray-800">Past Entries</h2>
          <div className="space-y-6">
            {journalEntries.map((entry, idx) => (
              <div key={entry.id || idx} className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-md transition-shadow">
                <div className="text-gray-800 mb-3 text-lg leading-relaxed">{entry.content}</div>
                {entry.aiSummary && (
                  <div className="bg-orange-50 rounded-lg border-l-4 border-orange-400 mb-3">
                    <div className="text-sm font-semibold text-orange-700">AI Summary:</div>
                    <div className="text-orange-800">{entry.aiSummary}</div>
                  </div>
                )}
                <div className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 