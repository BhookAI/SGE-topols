'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const SUGGESTED_PROMPTS = [
    '¿Cuál es el resumen financiero de este mes?',
    '¿Cuántos clientes tengo activos?',
    '¿Cuál es el estado de mis proyectos?',
    '¿Cuáles son mis principales fuentes de ingresos?',
    'Analiza mi situación financiera actual',
    '¿Qué proyectos necesitan más atención?',
]

export default function AgentPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function sendMessage(content: string) {
        if (!content.trim() || isLoading) return

        const userMsg: Message = { role: 'user', content: content.trim(), timestamp: new Date() }
        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                }),
            })

            const data = await res.json()
            const assistantMsg: Message = {
                role: 'assistant',
                content: res.ok ? data.reply : (data.error || 'Error al comunicarse con el agente'),
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, assistantMsg])
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Error de conexión. Inténtalo de nuevo.',
                timestamp: new Date(),
            }])
        } finally {
            setIsLoading(false)
            inputRef.current?.focus()
        }
    }

    function clearChat() {
        setMessages([])
        inputRef.current?.focus()
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/30">
                            <Sparkles className="h-6 w-6 text-indigo-400" />
                        </span>
                        Agente IA
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1 ml-1">
                        Tu asistente financiero con acceso a todos tus datos del negocio
                    </p>
                </div>
                {messages.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearChat}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Nueva conversación
                    </Button>
                )}
            </div>

            {/* Chat area */}
            <Card className="flex-1 overflow-hidden flex flex-col">
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/30 flex items-center justify-center">
                                    <Bot className="h-10 w-10 text-indigo-400" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[var(--bg-secondary)]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">¡Hola! Soy tu agente IA</h2>
                                <p className="text-[var(--text-secondary)] mt-2 max-w-md">
                                    Tengo acceso a todos tus datos: clientes, proyectos, finanzas y documentos.
                                    Pregúntame lo que necesites.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                                {SUGGESTED_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => sendMessage(prompt)}
                                        className="text-left p-3 rounded-xl border border-white/10 text-sm text-[var(--text-secondary)] hover:border-indigo-500/50 hover:text-white hover:bg-indigo-500/10 transition-all duration-200"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'assistant'
                                            ? 'bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/30'
                                            : 'bg-white/10 border border-white/20'
                                        }`}>
                                        {msg.role === 'assistant'
                                            ? <Bot className="h-4 w-4 text-indigo-400" />
                                            : <User className="h-4 w-4 text-white" />
                                        }
                                    </div>
                                    {/* Bubble */}
                                    <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-white/5 rounded-tl-sm'
                                            }`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-xs text-[var(--text-muted)] px-1">
                                            {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/30">
                                        <Bot className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--bg-tertiary)] border border-white/5">
                                        <div className="flex gap-1 items-center h-5">
                                            {[0, 1, 2].map(i => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full bg-indigo-400"
                                                    animate={{ y: [0, -6, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                    <div ref={bottomRef} />
                </CardContent>

                {/* Input */}
                <div className="border-t border-white/5 p-4">
                    <form
                        onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
                        className="flex gap-3"
                    >
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu pregunta..."
                            disabled={isLoading}
                            className="flex-1"
                            autoFocus
                        />
                        <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}
