'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Clock, 
  MoreVertical, 
  Paperclip, 
  Image as ImageIcon,
  Phone,
  Video,
  Info,
  Smile,
  Mic,
  Check,
  CheckCheck,
  ArrowLeft,
  Filter,
  Archive,
  Delete,
  Bell,
  Shield,
  Plus
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Conversation {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  online: boolean;
  muted: boolean;
  archived: boolean;
  lastSeen?: string;
}

interface Message {
  id: number;
  sender: 'me' | 'other';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    type: 'image' | 'file';
    name: string;
    url: string;
    size?: string;
  }>;
}

export default function TeacherMessagesPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [conversationMenuOpen, setConversationMenuOpen] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'students' | 'parents'>('all');
  const [isMobile, setIsMobile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Example conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      name: 'أحمد محمد',
      role: 'طالب - الصف الأول الثانوي',
      lastMessage: 'شكراً يا أستاذ على الشرح الممتاز',
      timestamp: '10:30 ص',
      unread: 0,
      avatar: 'أ',
      online: true,
      muted: false,
      archived: false,
      lastSeen: 'آخر ظهور: الآن'
    },
    {
      id: 2,
      name: 'سارة علي',
      role: 'ولي أمر',
      lastMessage: 'متى موعد الامتحان القادم؟',
      timestamp: 'أمس',
      unread: 2,
      avatar: 'س',
      online: false,
      muted: true,
      archived: false,
      lastSeen: 'آخر ظهور: منذ ساعتين'
    },
    {
      id: 3,
      name: 'محمد حسن',
      role: 'طالب - الصف الثاني الثانوي',
      lastMessage: 'هل يمكن إعادة شرح المعادلات؟',
      timestamp: 'الأحد',
      unread: 1,
      avatar: 'م',
      online: true,
      muted: false,
      archived: false,
      lastSeen: 'آخر ظهور: الآن'
    },
    {
      id: 4,
      name: 'فاطمة أحمد',
      role: 'طالب - الصف الثالث الثانوي',
      lastMessage: 'تم إرسال الواجب',
      timestamp: 'السبت',
      unread: 0,
      avatar: 'ف',
      online: false,
      muted: false,
      archived: true,
      lastSeen: 'آخر ظهور: أمس'
    },
    {
      id: 5,
      name: 'خالد عبدالله',
      role: 'طالب - الصف الأول الثانوي',
      lastMessage: 'شكراً على التوضيح',
      timestamp: 'الجمعة',
      unread: 0,
      avatar: 'خ',
      online: true,
      muted: false,
      archived: false,
      lastSeen: 'آخر ظهور: الآن'
    },
  ]);

  // Example messages data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'other',
      content: 'السلام عليكم يا أستاذ، عندي سؤال في الدرس الأخير',
      timestamp: '09:15 ص',
      status: 'read'
    },
    {
      id: 2,
      sender: 'me',
      content: 'وعليكم السلام، تفضل اسأل',
      timestamp: '09:20 ص',
      status: 'read'
    },
    {
      id: 3,
      sender: 'other',
      content: 'لم أفهم طريقة حل المعادلات التربيعية بالقانون العام',
      timestamp: '09:22 ص',
      status: 'read'
    },
    {
      id: 4,
      sender: 'me',
      content: 'حاضر، سأشرحها لك بطريقة مبسطة. القانون العام هو: x = (-b ± √(b² - 4ac)) / 2a',
      timestamp: '09:25 ص',
      status: 'read'
    },
    {
      id: 5,
      sender: 'other',
      content: 'شكراً يا أستاذ على الشرح الممتاز، الآن فهمت الموضوع جيداً',
      timestamp: '10:30 ص',
      status: 'read'
    },
    {
      id: 6,
      sender: 'me',
      content: 'تم رفع ملف مراجعة جديد على المنصة يمكنك الاطلاع عليه',
      timestamp: '11:00 ص',
      status: 'read',
      attachments: [
        {
          type: 'file',
          name: 'مراجعة_المعادلات_التربيعية.pdf',
          url: '#',
          size: '2.4 MB'
        }
      ]
    },
    {
      id: 7,
      sender: 'other',
      content: 'شكراً جزيلاً، سأقوم بتحميله الآن',
      timestamp: '11:05 ص',
      status: 'read'
    },
  ]);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations
    .filter(conv => {
      if (activeFilter === 'unread') return conv.unread > 0;
      if (activeFilter === 'students') return conv.role.includes('طالب');
      if (activeFilter === 'parents') return conv.role.includes('ولي أمر');
      if (conv.archived) return false;
      return true;
    })
    .filter(conv => 
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: 'me',
        content: message,
        timestamp: new Date().toLocaleTimeString('ar-EG', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: 'sent'
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        const replyMessage: Message = {
          id: messages.length + 2,
          sender: 'other',
          content: 'شكراً على التوضيح!',
          timestamp: new Date().toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'read'
        };
        setMessages(prev => [...prev, replyMessage]);
        setIsTyping(false);
        
        // Update conversation last message
        setConversations(prev => prev.map(conv => 
          conv.id === selectedChat 
            ? { ...conv, lastMessage: message, timestamp: 'الآن', unread: 0 }
            : conv
        ));
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachmentClick = (type: 'image' | 'file') => {
    setShowAttachmentMenu(false);
    // Handle attachment logic here
    alert(`تم اختيار ${type === 'image' ? 'صورة' : 'ملف'}`);
  };

  const toggleConversationMenu = (id: number) => {
    setConversationMenuOpen(conversationMenuOpen === id ? null : id);
  };

  const handleConversationAction = (id: number, action: string) => {
    setConversationMenuOpen(null);
    
    switch (action) {
      case 'archive':
        setConversations(prev => prev.map(conv => 
          conv.id === id ? { ...conv, archived: true } : conv
        ));
        break;
      case 'delete':
        setConversations(prev => prev.filter(conv => conv.id !== id));
        if (selectedChat === id) setSelectedChat(null);
        break;
      case 'mute':
        setConversations(prev => prev.map(conv => 
          conv.id === id ? { ...conv, muted: !conv.muted } : conv
        ));
        break;
      case 'mark-read':
        setConversations(prev => prev.map(conv => 
          conv.id === id ? { ...conv, unread: 0 } : conv
        ));
        break;
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex flex-col md:flex-row gap-4 md:gap-6 p-3 md:p-6 bg-gray-50">
        {/* Conversations List - Sidebar */}
        <div className={`${isMobile && selectedChat ? 'hidden' : 'flex'} flex-col w-full md:w-96 bg-white rounded-2xl border border-gray-200 shadow-sm flex-shrink-0`}>
          {/* Conversations Header */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">الرسائل</h2>
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setShowChatInfo(false)}
                >
                  <Plus size={20} className="text-gray-600" />
                </button>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {conversations.filter(c => !c.archived).length} محادثة
                </span>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المحادثات..."
                className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-2 text-sm rounded-lg transition-all ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                الكل
              </button>
              <button
                onClick={() => setActiveFilter('unread')}
                className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${activeFilter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <span>غير المقروء</span>
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {conversations.filter(c => c.unread > 0).length}
                </span>
              </button>
              <button
                onClick={() => setActiveFilter('students')}
                className={`px-3 py-2 text-sm rounded-lg transition-all ${activeFilter === 'students' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                الطلاب
              </button>
              <button
                onClick={() => setActiveFilter('parents')}
                className={`px-3 py-2 text-sm rounded-lg transition-all ${activeFilter === 'parents' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                أولياء الأمور
              </button>
            </div>
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد محادثات</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'لم يتم العثور على نتائج' : 'ابدأ محادثة جديدة'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`relative p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedChat === conv.id ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''
                  }`}
                  onClick={() => {
                    setSelectedChat(conv.id);
                    setShowChatInfo(false);
                    if (isMobile) setShowChatInfo(false);
                    
                    // Mark as read when selected
                    if (conv.unread > 0) {
                      setConversations(prev => prev.map(c => 
                        c.id === conv.id ? { ...c, unread: 0 } : c
                      ));
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar with Online Indicator */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {conv.avatar}
                      </div>
                      {conv.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                      {conv.muted && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                          <Bell size={12} />
                        </div>
                      )}
                    </div>
                    
                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{conv.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{conv.timestamp}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleConversationMenu(conv.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <MoreVertical size={16} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{conv.role}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1 mr-2">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{conv.unread}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Conversation Menu Dropdown */}
                  {conversationMenuOpen === conv.id && (
                    <div className="absolute left-4 top-14 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <button
                        onClick={() => handleConversationAction(conv.id, 'mark-read')}
                        className="w-full px-4 py-2 text-right hover:bg-gray-100 flex items-center justify-end gap-2"
                      >
                        <span>تحديد كمقروء</span>
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleConversationAction(conv.id, 'mute')}
                        className="w-full px-4 py-2 text-right hover:bg-gray-100 flex items-center justify-end gap-2"
                      >
                        <span>{conv.muted ? 'إلغاء كتم' : 'كتم الإشعارات'}</span>
                        <Bell size={16} />
                      </button>
                      <button
                        onClick={() => handleConversationAction(conv.id, 'archive')}
                        className="w-full px-4 py-2 text-right hover:bg-gray-100 flex items-center justify-end gap-2"
                      >
                        <span>أرشفة</span>
                        <Archive size={16} />
                      </button>
                      <button
                        onClick={() => handleConversationAction(conv.id, 'delete')}
                        className="w-full px-4 py-2 text-right hover:bg-gray-100 text-red-600 flex items-center justify-end gap-2"
                      >
                        <span>حذف المحادثة</span>
                        <Delete size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat ? (
          <div className={`flex-1 flex flex-col ${isMobile ? 'w-full' : ''}`}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                  )}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {selectedConversation?.avatar}
                    </div>
                    {selectedConversation?.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {selectedConversation?.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">
                        {selectedConversation?.role}
                      </p>
                      <span className="text-xs text-gray-500">•</span>
                      <p className="text-xs text-gray-500">
                        {selectedConversation?.online ? 'متصل الآن' : selectedConversation?.lastSeen}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                    <Phone size={20} className="text-gray-600" />
                  </button>
                  <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                    <Video size={20} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={() => setShowChatInfo(!showChatInfo)}
                    className={`p-3 hover:bg-gray-100 rounded-xl transition-colors ${showChatInfo ? 'bg-gray-100' : ''}`}
                  >
                    <Info size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Chat Content Area */}
              <div className="flex-1 flex overflow-hidden">
                {/* Messages Area */}
                <div className={`flex-1 flex flex-col ${showChatInfo && !isMobile ? 'w-2/3' : 'w-full'}`}>
                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
                    {/* Date Separator */}
                    <div className="text-center">
                      <span className="inline-block px-4 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                        اليوم
                      </span>
                    </div>
                    
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] md:max-w-[70%] ${msg.sender === 'me' ? '' : ''}`}>
                          <div className="flex items-end gap-2">
                            {msg.sender === 'other' && (
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {selectedConversation?.avatar.charAt(0)}
                              </div>
                            )}
                            
                            <div>
                              <div
                                className={`rounded-2xl p-4 ${
                                  msg.sender === 'me'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                                } shadow-sm`}
                              >
                                {msg.attachments && (
                                  <div className="mb-3 space-y-2">
                                    {msg.attachments.map((att, idx) => (
                                      <div key={idx} className="flex items-center gap-2 p-3 bg-black/10 rounded-lg">
                                        {att.type === 'file' ? (
                                          <Paperclip size={16} />
                                        ) : (
                                          <ImageIcon size={16} />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{att.name}</p>
                                          {att.size && (
                                            <p className="text-xs opacity-80">{att.size}</p>
                                          )}
                                        </div>
                                        <button className="text-sm font-medium hover:underline">
                                          تحميل
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                              </div>
                              
                              <div className={`flex items-center gap-2 mt-1 px-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-xs text-gray-500">{msg.timestamp}</span>
                                {msg.sender === 'me' && msg.status && (
                                  <>
                                    {msg.status === 'sent' && <Check size={12} className="text-gray-400" />}
                                    {msg.status === 'delivered' && <CheckCheck size={12} className="text-gray-400" />}
                                    {msg.status === 'read' && <CheckCheck size={12} className="text-blue-500" />}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[70%]">
                          <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {selectedConversation?.avatar.charAt(0)}
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      {/* Attachment Button */}
                      <div className="relative">
                        <button
                          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                          className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <Paperclip size={20} className="text-gray-600" />
                        </button>
                        
                        {showAttachmentMenu && (
                          <div className="absolute bottom-14 left-0 z-10 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                            <button
                              onClick={() => handleAttachmentClick('image')}
                              className="w-full px-4 py-3 text-right hover:bg-gray-100 flex items-center justify-end gap-3"
                            >
                              <span>صورة</span>
                              <ImageIcon size={18} className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleAttachmentClick('file')}
                              className="w-full px-4 py-3 text-right hover:bg-gray-100 flex items-center justify-end gap-3"
                            >
                              <span>ملف</span>
                              <Paperclip size={18} className="text-gray-600" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                        <Smile size={20} className="text-gray-600" />
                      </button>
                      
                      <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="اكتب رسالتك هنا..."
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      
                      <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                        <Mic size={20} className="text-gray-600" />
                      </button>
                      
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className={`p-3 rounded-xl transition-all ${message.trim() ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chat Info Sidebar */}
                {showChatInfo && !isMobile && (
                  <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-6 text-lg">معلومات المحادثة</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">المعلومات الشخصية</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <User size={18} className="text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-600">الاسم</p>
                                <p className="font-medium">{selectedConversation?.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Shield size={18} className="text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-600">الصفة</p>
                                <p className="font-medium">{selectedConversation?.role}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">الإشعارات</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">كتم الإشعارات</p>
                                <p className="text-sm text-gray-600">تعطيل إشعارات هذه المحادثة</p>
                              </div>
                              <button 
                                onClick={() => selectedConversation && handleConversationAction(selectedConversation.id, 'mute')}
                                className={`w-12 h-6 rounded-full transition-colors ${selectedConversation?.muted ? 'bg-red-500' : 'bg-gray-300'}`}
                              >
                                <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${selectedConversation?.muted ? 'translate-x-7' : 'translate-x-1'}`}></div>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">الملفات المشتركة</h4>
                          <div className="space-y-2">
                            {messages.flatMap(msg => msg.attachments || []).map((att, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  {att.type === 'file' ? (
                                    <Paperclip size={18} className="text-blue-600" />
                                  ) : (
                                    <ImageIcon size={18} className="text-blue-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{att.name}</p>
                                  <p className="text-xs text-gray-500">{att.size}</p>
                                </div>
                                <button className="text-blue-600 text-sm font-medium hover:underline">
                                  فتح
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200">
                          <button
                            onClick={() => selectedConversation && handleConversationAction(selectedConversation.id, 'delete')}
                            className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <Delete size={18} />
                            <span>حذف المحادثة</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty Chat State */
          !isMobile && (
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare size={48} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">اختر محادثة</h3>
                <p className="text-gray-600 max-w-md mb-6">
                  اختر محادثة من القائمة لعرض الرسائل وبدء المحادثة
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Search size={16} className="inline ml-2" />
                    بحث سريع
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors">
                    بدء محادثة جديدة
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </DashboardLayout>
  );
}