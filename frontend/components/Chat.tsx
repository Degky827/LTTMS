import { useState } from 'react'
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa'

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'vendor', text: 'Hello! Your boat tour is confirmed for 9 AM.', time: '10:00 AM' },
    { id: 2, sender: 'tourist', text: 'Great! Where should we meet?', time: '10:05 AM' },
    { id: 3, sender: 'vendor', text: 'At the main pier near the lighthouse.', time: '10:06 AM' },
  ])
  const [input, setInput] = useState('')

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages([...messages, { id: Date.now(), sender: 'tourist', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setInput('')
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b bg-gray-50/50 flex items-center space-x-3">
        <FaUserCircle className="text-gray-400 text-3xl" />
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Lake Tana Tours (Support)</h3>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'tourist' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
              msg.sender === 'tourist' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
            }`}>
              <p className="leading-relaxed font-medium">{msg.text}</p>
              <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${msg.sender === 'tourist' ? 'text-blue-100' : 'text-gray-400'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t bg-gray-50/50 flex space-x-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition shadow-inner"
        />
        <button 
          type="submit"
          className="bg-primary text-white p-3 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-primary/20"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  )
}
