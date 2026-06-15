import { useState, useEffect, useRef } from 'react';
import { Mic, Send, LogOut, MessageSquare, Clock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

interface ChatMessage {
  sender: 'USER' | 'AI';
  content: string;
}

interface Evaluation {
  clarity: number;
  technicalDepth: number;
  confidence: number;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function InterviewRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation>({
    clarity: 0,
    technicalDepth: 0,
    confidence: 0
  });

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const stompClientRef = useRef<Client | null>(null);

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [timeoutCount, setTimeoutCount] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) {
      const newCount = timeoutCount + 1;
      setTimeoutCount(newCount);

      if (newCount >= 2) {
        handleEndInterview();
      } else {
        if (stompClientRef.current?.connected) {
          stompClientRef.current.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify({ sessionId: id, content: "I didn't answer in time. Please skip to the next question." })
          });
        }
        setTimeLeft(300);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timeoutCount, id]);

  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !id) return;
        const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + `/interviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'COMPLETED' || res.data.status === 'CANCELLED') {
          navigate(`/interviews/${id}/report`);
        }
      } catch (err) {
        console.error("Failed to fetch session status", err);
      }
    };
    checkSessionStatus();
  }, [id, navigate]);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting speech recognition", e);
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      const token = localStorage.getItem('token');
      if (token && id) {
        // Use keepalive to ensure the request goes through even as the page unloads
        fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + `/interviews/${id}/finish`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          keepalive: true
        }).catch(err => console.error("Failed to finish interview on unload", err));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [id]);

  useEffect(() => {
    // We assume the user has logged in and has a token
    const token = localStorage.getItem('token');

    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/ws' : 'http://localhost:8080/ws')}` + '/interview'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        // Subscribe to AI responses for this specific session
        client.subscribe(`/topic/interview/${id}`, async (message) => {
          const payload = JSON.parse(message.body);

          if (payload.type === 'THINKING') {
            // Show a loading indicator in UI by pushing a temporary message
            setMessages(prev => {
              if (prev[prev.length - 1]?.sender === 'AI' && prev[prev.length - 1]?.content === 'Thinking...') return prev;
              return [...prev, { sender: 'AI', content: 'Thinking...' }];
            });
          } else if (payload.type === 'AI_RESPONSE') {
            setMessages(prev => {
              // Remove "Thinking..." message
              const newMsgs = prev.filter(m => m.content !== 'Thinking...');
              return [...newMsgs, { sender: 'AI', content: payload.content }];
            });
            setEvaluation({
              clarity: payload.clarity,
              technicalDepth: payload.technicalDepth,
              confidence: payload.confidence
            });

            setTimeLeft(300); // Reset timer when AI speaks

            // Text-to-Speech
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel(); // Stop any ongoing speech
              const utterance = new SpeechSynthesisUtterance(payload.content);
              utterance.lang = 'en-US';
              window.speechSynthesis.speak(utterance);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [id]);

  const handleSendMessage = () => {
    const plainText = input.replace(/<[^>]+>/g, '').trim();
    if (!plainText) return;

    // Optimistically add user message to UI
    setMessages(prev => [...prev, { sender: 'USER', content: input }]);

    // Send to backend
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({ sessionId: id, content: input })
      });
    }

    setInput('');
    setTimeoutCount(0); // Reset consecutive timeouts on valid message
    setTimeLeft(300); // Reset timer while waiting for AI
  };

  const handleEndInterview = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + `/interviews/${id}/finish`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/interviews/${id}/report`);
    } catch (error) {
      console.error('Failed to end interview:', error);
      // Even if it fails (e.g. already finished), try to navigate to report
      navigate(`/interviews/${id}/report`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19 12c0 3.866-3.134 7-7 7s-7-3.134-7-7 3.134-7 7-7 7 3.134 7 7z" strokeDasharray="4 4"></path>
              </svg>
            </div>
          </div>
          <span className="font-semibold text-lg text-slate-800">AI Mock Interview</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium font-mono text-sm border ${timeLeft <= 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            <Clock className={`w-4 h-4 ${timeLeft <= 60 ? 'text-red-500' : 'text-slate-500'}`} />
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <button
            onClick={handleEndInterview}
            className="flex items-center gap-2 px-4 py-2 border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            End Interview
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative w-full h-full p-4 lg:p-8 flex flex-col lg:flex-row gap-6 justify-center max-w-[1600px] mx-auto animate-in fade-in duration-700">

        {/* Left Side: Video & Chat Overlay */}
        <div className="flex-1 bg-[#1e293b] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col min-h-[500px]">
          {/* Mock Video Feed */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
              alt="AI Interviewer"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          </div>

          {/* Messages Overlay */}
          <div className="absolute inset-x-0 bottom-24 top-0 p-8 flex flex-col gap-4 overflow-y-auto z-10">
            {messages.map((msg, idx) => (
              msg.sender === 'AI' ? (
                <div key={idx} className="max-w-sm self-start animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div
                    className="bg-blue-600/90 backdrop-blur-md text-white p-4 rounded-2xl rounded-tl-sm shadow-lg leading-relaxed prose prose-sm prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content) }}
                  />
                </div>
              ) : (
                <div key={idx} className="max-w-sm self-end animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="bg-slate-800/80 backdrop-blur-md text-white p-4 rounded-2xl rounded-br-sm shadow-lg flex items-center gap-3">
                    <div className="text-sm prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content) }} />
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Mic className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Chat toggle button */}
          <button className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 backdrop-blur-md text-white rounded-lg text-sm font-medium border border-white/10 hover:bg-slate-900/70 transition-colors">
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
        </div>

        {/* Right Side: Evaluation & Input */}
        <div className="w-full lg:w-[450px] flex flex-col gap-6 shrink-0 z-10">

          {/* Title - visible only on large screens */}
          <div className="text-center mb-2 hidden lg:block">
            <h2 className="text-2xl font-bold text-slate-800">Interview Room</h2>
          </div>

          {/* Real-time Evaluation Panel (Glassmorphism) */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
            <h3 className="font-semibold text-slate-800 mb-6">Real-time Evaluation</h3>

            <div className="space-y-5">
              {/* Clarity */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Clarity</span>
                  <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">{evaluation.clarity}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full transition-all duration-1000" style={{ width: `${evaluation.clarity}%` }}></div>
                </div>
              </div>

              {/* Technical Depth */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Technical Depth</span>
                  <span className="text-xs font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">{evaluation.technicalDepth}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${evaluation.technicalDepth}%` }}></div>
                </div>
              </div>

              {/* Confidence */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Confidence</span>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">{evaluation.confidence}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${evaluation.confidence}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Question */}
          <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 flex-1 flex flex-col justify-center min-h-[140px]">
            <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Latest Question</h3>
            <p className="text-slate-800 text-lg leading-relaxed font-medium">
              {messages.filter(m => m.sender === 'AI').pop()?.content || 'Waiting for AI...'}
            </p>
          </div>

          {/* Voice-to-text input */}
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-4 flex flex-col gap-3 border border-slate-100 mt-auto">
            <div className="flex-1 text-slate-700 bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-200">
              <ReactQuill
                theme="snow"
                value={input}
                onChange={setInput}
                placeholder="Type your detailed answer here... (Formatting supported)"
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    ['clean']
                  ]
                }}
                className="w-full border-none [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-white [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:max-h-[200px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:px-5 [&_.ql-editor]:py-4 [&_.ql-editor]:text-base"
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <button
                onClick={toggleListen}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium shadow-sm ${isListening ? 'bg-red-500 hover:bg-red-600 shadow-red-200 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                <Mic className="w-5 h-5" />
                {isListening ? 'Listening...' : 'Voice Input'}
              </button>
              <button
                onClick={handleSendMessage}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-200 flex items-center gap-2"
              >
                Send Answer
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
