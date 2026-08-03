// app/admin/messages/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare,
  Search,
  Mail,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Sparkles
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const supabase = DatabaseService.getSupabaseClient()
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { error } = await supabase.from('messages').delete().eq('id', id)
      if (error) throw error

      setMessages(messages.filter((m) => m.id !== id))
      if (expandedMessage === id) setExpandedMessage(null)
      toast({ title: 'Success!', description: 'Message deleted', variant: 'success' })
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({ title: 'Error', description: 'Failed to delete message', variant: 'destructive' })
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { error } = await supabase.from('messages').update({ status: 'read' }).eq('id', id)
      if (error) throw error

      setMessages(messages.map((m) => (m.id === id ? { ...m, status: 'read' } : m)))
      toast({ title: 'Success!', description: 'Marked as read', variant: 'success' })
    } catch (error) {
      console.error('Error updating message:', error)
      toast({ title: 'Error', description: 'Failed to update message', variant: 'destructive' })
    }
  }

  const toggleMessageExpand = (messageId: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId)
  }

  const filteredMessages = messages.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading messages...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-emerald-400 neon-glow">Messages</span>
        </h1>
        <p className="text-gray-400 mt-1">View and manage customer messages</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredMessages.map((message) => {
          const isExpanded = expandedMessage === message.id
          const isUnread = message.status === 'unread'

          return (
            <Card 
              key={message.id} 
              className={`glass border-emerald-400/10 rounded-2xl hover:border-emerald-400/30 transition-all overflow-hidden ${
                isUnread ? 'border-l-4 border-l-emerald-400' : ''
              }`}
            >
              {/* Message Header - Always visible */}
              <div 
                className="p-5 cursor-pointer hover:bg-emerald-400/5 transition-colors"
                onClick={() => toggleMessageExpand(message.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="p-2 rounded-xl bg-emerald-400/10">
                        <Mail className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{message.name}</p>
                        <p className="text-sm text-gray-400">{message.email}</p>
                      </div>
                      {isUnread && (
                        <Badge className="bg-emerald-400/20 text-emerald-400 border-emerald-500/30 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-white font-medium mt-2">{message.subject}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>
                        {new Date(message.created_at).toLocaleDateString()} at{' '}
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className={isUnread ? 'text-emerald-400' : ''}>
                        {isUnread ? 'Unread' : 'Read'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUnread && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkRead(message.id)
                        }}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(message.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <button 
                      className="p-1.5 rounded-full hover:bg-emerald-400/10 transition-colors text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleMessageExpand(message.id)
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Details - Expandable */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <Separator className="bg-emerald-400/10" />
                    <div className="p-5 space-y-4">
                      {/* Sender Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-black/30 rounded-xl p-4 border border-emerald-400/10">
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <User className="h-4 w-4" />
                            Sender Information
                          </div>
                          <p className="text-white font-medium">
                            {message.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {message.email}
                          </p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-emerald-400/10">
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <Calendar className="h-4 w-4" />
                            Message Details
                          </div>
                          <p className="text-white">
                            Subject: <span className="text-sm text-gray-400">{message.subject}</span>
                          </p>
                          <p className="text-white">
                            Status: <span className={`text-sm ${isUnread ? 'text-emerald-400' : 'text-gray-400'}`}>
                              {isUnread ? 'Unread' : 'Read'}
                            </span>
                          </p>
                          <p className="text-white">
                            Received: <span className="text-sm text-gray-400">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="bg-black/30 rounded-xl p-4 border border-emerald-400/10">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <MessageSquare className="h-4 w-4" />
                          Message Content
                        </div>
                        <p className="text-white whitespace-pre-wrap leading-relaxed">
                          {message.message}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {isUnread && (
                          <Button
                            size="sm"
                            className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                            onClick={() => handleMarkRead(message.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                          onClick={() => handleDelete(message.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete Message
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No messages found</p>
          </div>
        )}
      </div>
    </div>
  )
}