import { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../socket';
import './Chat.css';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

interface ChatProps {
  /** If provided, renders as a floating panel tied to a specific room */
  mode?: 'floating' | 'fullpage';
  /** Available rooms (location names) */
  rooms?: string[];
  /** Pre-selected room */
  defaultRoom?: string;
}

const Chat = ({ mode = 'floating', rooms = [], defaultRoom }: ChatProps) => {
  const [isOpen, setIsOpen] = useState(mode === 'fullpage');
  const [isClosing, setIsClosing] = useState(false);
  const [username, setUsername] = useState(() => localStorage.getItem('chat_username') || '');
  const [usernameInput, setUsernameInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState(defaultRoom || (rooms.length > 0 ? rooms[0] : 'General'));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [systemMessages, setSystemMessages] = useState<{ id: string; text: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // ── Auto-scroll to bottom ────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, systemMessages, scrollToBottom]);

  // ── Socket event listeners ────────────────────────────────────────────────────
  useEffect(() => {
    if (!username) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Join the room
    socket.emit('join_room', { room: currentRoom, username });

    const onMessageHistory = (history: ChatMessage[]) => {
      setMessages(history);
      setSystemMessages([]);
    };

    const onReceiveMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const onUserJoined = ({ username: joinedUser, users }: { username: string; users: string[] }) => {
      setOnlineUsers(users);
      setSystemMessages(prev => [
        ...prev,
        { id: `sys-${Date.now()}`, text: `${joinedUser} joined the chat` },
      ]);
    };

    const onUserLeft = ({ username: leftUser, users }: { username: string; users: string[] }) => {
      setOnlineUsers(users);
      setSystemMessages(prev => [
        ...prev,
        { id: `sys-${Date.now()}`, text: `${leftUser} left the chat` },
      ]);
    };

    const onUserTyping = ({ username: typingUser }: { username: string }) => {
      setTypingUsers(prev => (prev.includes(typingUser) ? prev : [...prev, typingUser]));
    };

    const onUserStopTyping = ({ username: typingUser }: { username: string }) => {
      setTypingUsers(prev => prev.filter(u => u !== typingUser));
    };

    socket.on('message_history', onMessageHistory);
    socket.on('receive_message', onReceiveMessage);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stop_typing', onUserStopTyping);

    return () => {
      socket.off('message_history', onMessageHistory);
      socket.off('receive_message', onReceiveMessage);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stop_typing', onUserStopTyping);
    };
  }, [username, currentRoom, isOpen]);

  // ── Handle room change ────────────────────────────────────────────────────────
  const handleRoomChange = (newRoom: string) => {
    setCurrentRoom(newRoom);
    setMessages([]);
    setSystemMessages([]);
    setTypingUsers([]);
    // Will re-join via the useEffect above
  };

  // ── Handle username submit ────────────────────────────────────────────────────
  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = usernameInput.trim();
    if (trimmed) {
      localStorage.setItem('chat_username', trimmed);
      setUsername(trimmed);
    }
  };

  // ── Handle send message ───────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    socket.emit('send_message', {
      room: currentRoom,
      username,
      text: trimmed,
    });

    // Stop typing indicator
    if (isTypingRef.current) {
      socket.emit('stop_typing', { room: currentRoom, username });
      isTypingRef.current = false;
    }

    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Typing indicator logic ────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { room: currentRoom, username });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stop_typing', { room: currentRoom, username });
    }, 1500);
  };

  // ── Toggle panel ──────────────────────────────────────────────────────────────
  const toggleChat = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 250);
    } else {
      setIsOpen(true);
      setUnreadCount(0);
    }
  };

  // ── Format timestamp ──────────────────────────────────────────────────────────
  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ── Merge messages and system messages for display ────────────────────────────
  const allItems = [
    ...messages.map(m => ({ ...m, type: 'msg' as const })),
    ...systemMessages.map(s => ({ ...s, type: 'system' as const, user: '', text: s.text, timestamp: '' })),
  ];

  // ── Render chat content ───────────────────────────────────────────────────────
  const renderChatContent = () => (
    <>
      {/* Username prompt overlay */}
      {!username && (
        <div className="username-overlay">
          <form className="username-form" onSubmit={handleUsernameSubmit}>
            <h3>👋 Welcome!</h3>
            <p>Enter a display name to start chatting</p>
            <input
              type="text"
              placeholder="Your name..."
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              autoFocus
              maxLength={20}
            />
            <button type="submit">Join Chat</button>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>💬 Live Chat</h3>
          <div className="room-name">📍 {currentRoom}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="online-count">
            <span className="online-dot"></span>
            {onlineUsers.length} online
          </div>
          {mode === 'floating' && (
            <button className="chat-close-btn" onClick={toggleChat}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Room selector */}
      {rooms.length > 1 && (
        <div className="room-selector">
          <select
            value={currentRoom}
            onChange={e => handleRoomChange(e.target.value)}
          >
            {rooms.map(r => (
              <option key={r} value={r}>
                📍 {r}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {allItems.map(item =>
          item.type === 'system' ? (
            <div key={item.id} className="msg-system">
              {item.text}
            </div>
          ) : (
            <div
              key={item.id}
              className={`msg ${item.user === username ? 'sent' : 'received'}`}
            >
              {item.user !== username && (
                <div className="msg-user">{item.user}</div>
              )}
              <div>{item.text}</div>
              {item.timestamp && (
                <div className="msg-time">{formatTime(item.timestamp)}</div>
              )}
            </div>
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      <div className="typing-indicator">
        {typingUsers.length > 0 && (
          <>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          type="text"
          placeholder={username ? 'Type a message...' : 'Set your name first...'}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={!username}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!username || !inputText.trim()}
          title="Send message"
        >
          ➤
        </button>
      </div>
    </>
  );

  // ── Full-page mode ────────────────────────────────────────────────────────────
  if (mode === 'fullpage') {
    return <div className="chat-fullpage">{renderChatContent()}</div>;
  }

  // ── Floating mode ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating action button */}
      <button className="chat-fab" onClick={toggleChat} title="Open Chat">
        {isOpen ? '✕' : '💬'}
        {!isOpen && unreadCount > 0 && (
          <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className={`chat-panel ${isClosing ? 'closing' : ''}`}>
          {renderChatContent()}
        </div>
      )}
    </>
  );
};

export default Chat;
