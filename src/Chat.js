import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import './Biblioteca.css';

const HARDCODED_SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

function Chat() {
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [messages, setMessages] = useState([]);

    const listRef = useRef(null);

    const canSend = useMemo(() => query.trim().length > 0 && !loading, [query, loading]);

    const scrollToBottom = () => {
        const node = listRef.current;
        if (!node) return;
        node.scrollTop = node.scrollHeight;
    };

    const sendMessage = async () => {
        const text = query.trim();
        if (!text || loading) return;

        setError('');
        setLoading(true);

        const userMessage = {
            id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
            role: 'user',
            text,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setQuery('');

        // Espera un tick para que el DOM pinte el mensaje del usuario
        setTimeout(scrollToBottom, 0);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: text,
                    session_id: HARDCODED_SESSION_ID,
                    top_k: 8,
                    use_rag: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.detail || 'No se pudo obtener respuesta del chat');
            }

            const assistantMessage = {
                id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + 1),
                role: 'assistant',
                text: data?.response ?? '(sin respuesta)',
                timestamp: data?.timestamp ?? new Date().toISOString(),
                raw: data,
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setTimeout(scrollToBottom, 0);
        } catch (e) {
            console.error(e);
            setError('Error consultando el chat. Verifica conectividad o el proxy.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chat-page">
            <header className="biblioteca-header">
                <div className="logo-nombre" onClick={() => navigate('/biblioteca')} style={{ cursor: 'pointer' }}>
                    <div className="icono-logo">💬</div>
                    <span className="nombre-app">ISOOne</span>
                </div>

                <nav className="nav-bar">
                    <button className="nav-item" onClick={() => navigate('/biblioteca')}>Biblioteca</button>
                    <button className="nav-item" onClick={() => navigate('/subir-documento')}>Subir Documento</button>
                    <button className="nav-item active">Chat</button>
                </nav>

                <div className="usuario-info">
                    <div className="avatar-initials">MG</div>
                </div>
            </header>

            <div className="chat-content">
                <div className="chat-card">
                    <div className="chat-card-header">
                        <div>
                            <h1 className="chat-title">Chat RAG</h1>
                            <div className="chat-subtitle">Session ID (quemado): {HARDCODED_SESSION_ID}</div>
                        </div>
                    </div>

                    <div className="chat-messages" ref={listRef}>
                        {messages.length === 0 ? (
                            <div className="chat-empty">
                                Escribe una consulta (ej: “¿Qué es el artículo 42 del COIP?”)
                            </div>
                        ) : (
                            messages.map((m) => (
                                <div key={m.id} className={`chat-message ${m.role === 'user' ? 'from-user' : 'from-assistant'}`}>
                                    <div className="chat-bubble">
                                        <div className="chat-role">{m.role === 'user' ? 'Tú' : 'ISOOne AI'}</div>
                                        <div className="chat-text">{m.text}</div>

                                        {m.role === 'assistant' && m.raw?.chunks_used?.length ? (
                                            <details className="chat-sources">
                                                <summary>Ver fuentes ({m.raw.chunks_used.length})</summary>
                                                <div className="chat-sources-list">
                                                    {m.raw.chunks_used.map((c) => (
                                                        <div key={`${c.filename}-${c.chunk_index}`} className="chat-source">
                                                            <div className="chat-source-title">
                                                                {c.filename} — chunk {c.chunk_index} — score {typeof c.score === 'number' ? c.score.toFixed(3) : c.score}
                                                            </div>
                                                            <div className="chat-source-content">{c.content}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {error ? <div className="chat-error">{error}</div> : null}

                    <div className="chat-composer">
                        <textarea
                            className="chat-input"
                            placeholder="Escribe tu pregunta..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={2}
                        />
                        <button className="chat-send" disabled={!canSend} onClick={sendMessage}>
                            {loading ? 'Enviando…' : 'Enviar'}
                        </button>
                    </div>

                    <div className="chat-hint">
                        Enter para enviar • Shift+Enter para salto de línea
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;
