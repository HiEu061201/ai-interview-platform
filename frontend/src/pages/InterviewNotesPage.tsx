import React, { useEffect, useState } from 'react';
import { getMyNotes, InterviewNoteResponse } from '../services/studyApi';
import { BookOpen, CheckCircle, ChevronDown, ChevronRight, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const InterviewNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Record<string, InterviewNoteResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await getMyNotes();
      setNotes(data);
      // Auto-expand first topic
      if (Object.keys(data).length > 0) {
        setExpandedTopics({ [Object.keys(data)[0]]: true });
      }
    } catch (error) {
      console.error('Failed to fetch notes', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  const toggleNote = (noteId: number) => {
    setExpandedNotes(prev => ({ ...prev, [noteId]: !prev[noteId] }));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (Object.keys(notes).length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-500">
        <BookOpen className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-semibold">Chưa có sổ tay ôn tập nào</h2>
        <p className="mt-2">Hãy tham gia phỏng vấn, AI sẽ tự động phân loại và lưu lại các câu trả lời cần cải thiện của bạn tại đây.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          Sổ tay lỗi sai & Ôn tập
        </h1>
        <p className="mt-2 text-gray-600">Các câu trả lời của bạn đã được AI phân loại. Hãy ôn tập lại cách trả lời chuẩn nhé!</p>
      </div>

      <div className="space-y-6">
        {Object.entries(notes).map(([topic, topicNotes]) => (
          <div key={topic} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
            <button
              onClick={() => toggleTopic(topic)}
              className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                {expandedTopics[topic] ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-lg text-indigo-700">{topic}</span>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                  {topicNotes.length} câu
                </span>
              </div>
            </button>

            {expandedTopics[topic] && (
              <div className="divide-y divide-gray-100">
                {topicNotes.map((note) => (
                  <div key={note.id} className="p-6 transition-colors hover:bg-gray-50">
                    <button 
                      className="w-full text-left focus:outline-none"
                      onClick={() => toggleNote(note.id)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{note.questionContent}</h3>
                          {!expandedNotes[note.id] && (
                            <p className="mt-1 line-clamp-1 text-sm text-gray-500">{note.userContent}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {note.scoreTechnical && note.scoreTechnical >= 80 ? (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Technical: {note.scoreTechnical}</span>
                          ) : note.scoreTechnical ? (
                            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Technical: {note.scoreTechnical}</span>
                          ) : null}
                          {expandedNotes[note.id] ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {expandedNotes[note.id] && (
                      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* User Answer */}
                        <div className="rounded-lg bg-red-50/50 p-4 ring-1 ring-red-100">
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-800">
                            <XCircle className="h-4 w-4" />
                            Câu trả lời của bạn
                          </div>
                          <div className="prose prose-sm prose-red max-w-none text-gray-700">
                            <ReactMarkdown>{note.userContent}</ReactMarkdown>
                          </div>
                        </div>

                        {/* AI Suggested Answer */}
                        <div className="rounded-lg bg-green-50/50 p-4 ring-1 ring-green-100">
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            AI Gợi ý trả lời
                          </div>
                          <div className="prose prose-sm prose-green max-w-none text-gray-700">
                            <ReactMarkdown>{note.suggestedAnswer}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
