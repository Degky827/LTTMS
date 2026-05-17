import { useState, useEffect, useRef } from 'react'
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'

interface Message {
  _id: string
  sender: { _id: string; name: string }
  receiver: { _id: string; name: string }
  content: string
  isRead: boolean
  createdAt: string
}

interface ChatProps {
  recipientId?: string
  recipientName?: string
}

export default function Chat({ recipientId, recipientName = 'Support' }: ChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const fetchMessages = async () => {
      try {
        const res = await API.get('/messages')
        setMessages(res.data.data || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user) return
    setSending(true)
    const text = input.trim()
    setInput('')
    try {
      const res = await API.post('/messages', {
        receiver: recipientId || user.id,
        content: text
      })
      setMessages(prev => [...prev, res.data.data])
    } catch {
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b bg-gray-50/50 flex items-center space-x-3">
        <FaUserCircle className="text-gray-400 text-3xl" />
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{recipientName}</h3>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">No messages yet. Start a conversation!</p>
        )}
        {messages.map((msg) => {
          const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id
          const isMine = senderId === user?.id
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                isMine
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <p className="leading-relaxed font-medium">{msg.content}</p>
                <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t bg-gray-50/50 flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition shadow-inner disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="bg-primary text-white p-3 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  )
}
