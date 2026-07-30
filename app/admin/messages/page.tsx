// app/admin/messages/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MessageSquare,
  Search,
  Mail,
  CheckCircle,
  Trash2,
  Eye
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

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
      if (selectedMessage?.id === id) setSelectedMessage(null)
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredMessages.map((message) => (
            <Card
              key={message.id}
              className={`glass border-emerald-400/10 rounded-2xl hover:border-emerald-400/30 transition-all cursor-pointer ${
                message.status === 'unread' ? 'border-l-4 border-l-emerald-400' : ''
              }`}
              onClick={() => setSelectedMessage(message)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-400/10">
                        <Mail className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{message.name}</p>
                        <p className="text-sm text-gray-400">{message.email}</p>
                      </div>
                    </div>
                    <p className="text-white font-medium mt-2">{message.subject}</p>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{message.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          message.status === 'unread'
                            ? 'bg-emerald-400/20 text-emerald-400'
                            : 'bg-gray-400/20 text-gray-400'
                        }`}
                      >
                        {message.status === 'unread' ? 'Unread' : 'Read'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {message.status === 'unread' && (
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No messages found</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="glass border-emerald-400/10 rounded-2xl sticky top-24">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-emerald-400" />
                Message Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMessage ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">From</p>
                    <p className="text-white font-medium">{selectedMessage.name}</p>
                    <p className="text-sm text-gray-400">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Subject</p>
                    <p className="text-white font-medium">{selectedMessage.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Message</p>
                    <p className="text-white mt-1">{selectedMessage.message}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Received</p>
                    <p className="text-white">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-emerald-400/10">
                    {selectedMessage.status === 'unread' && (
                      <Button
                        className="flex-1 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                        onClick={() => handleMarkRead(selectedMessage.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="flex-1 border-red-400/20 text-red-400 hover:bg-red-400/10"
                      onClick={() => handleDelete(selectedMessage.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a message to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}