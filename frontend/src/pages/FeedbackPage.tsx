import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface FeedbackData {
  id: number;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  clarityScore: number;
  confidenceScore: number;
  strengths: string;
  weaknesses: string;
  detailedReview: string;
  improvementPlan: string;
  recommendationLevel: string;
  qaReview: QaPairDto[];
}

export interface QaPairDto {
  question: string;
  answer: string;
  suggestedAnswer: string;
  scoreClarity: number;
  scoreTechnical: number;
  scoreConfidence: number;
}

export default function FeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + `/interviews/${id}/feedback`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.status === 204) {
          // Feedback not yet generated, need to generate it using backend
          setGenerating(true);
          
          const generateRes = await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + `/interviews/${id}/feedback/generate`, null, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setFeedback(generateRes.data);
          setGenerating(false);
        } else {
          setFeedback(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch/generate feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFeedback();
    }
  }, [id]);

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">
          {generating ? "AI is generating your comprehensive feedback..." : "Loading report..."}
        </h2>
        <p className="text-gray-500 mt-2">This might take a few seconds.</p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to load report</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: ['Technical', 'Communication', 'Clarity', 'Confidence'],
    datasets: [
      {
        label: 'Your Score',
        data: [
          feedback.technicalScore,
          feedback.communicationScore,
          feedback.clarityScore,
          feedback.confidenceScore,
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
      },
    },
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Post-Interview Report</h1>
            <p className="mt-2 text-gray-500">Comprehensive AI analysis of your mock interview performance.</p>
          </div>
          <div className="mt-6 sm:mt-0 flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                <circle 
                  className={feedback.overallScore >= 80 ? "text-green-500" : feedback.overallScore >= 60 ? "text-yellow-500" : "text-red-500"} 
                  strokeWidth="8" 
                  strokeDasharray={251.2} 
                  strokeDashoffset={251.2 - (251.2 * feedback.overallScore) / 100} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" cx="48" cy="48" 
                />
              </svg>
              <span className={`absolute text-2xl font-bold ${getScoreColor(feedback.overallScore)}`}>{feedback.overallScore}</span>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-500">Overall Score</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Radar Chart */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Skill Breakdown</h3>
            <div className="aspect-square">
              <Radar data={chartData} options={chartOptions} />
            </div>
            <div className="mt-6 text-center">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                feedback.recommendationLevel.includes('Strong') ? 'bg-green-100 text-green-800' : 
                feedback.recommendationLevel.includes('Hire') ? 'bg-blue-100 text-blue-800' : 
                'bg-red-100 text-red-800'
              }`}>
                Recommendation: {feedback.recommendationLevel}
              </span>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Review</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{feedback.detailedReview}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-2xl border border-green-100 p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Strengths
                </h3>
                <ul className="list-disc pl-5 text-green-700 space-y-2 text-sm">
                  {feedback.strengths.split('\n').filter(s => s.trim().length > 0).map((s, i) => (
                    <li key={i}>{s.replace(/^- /, '')}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Weaknesses
                </h3>
                <ul className="list-disc pl-5 text-red-700 space-y-2 text-sm">
                  {feedback.weaknesses.split('\n').filter(s => s.trim().length > 0).map((s, i) => (
                    <li key={i}>{s.replace(/^- /, '')}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Improvement Plan
              </h3>
              <ul className="list-disc pl-5 text-blue-700 space-y-2 text-sm">
                {feedback.improvementPlan.split('\n').filter(s => s.trim().length > 0).map((s, i) => (
                  <li key={i}>{s.replace(/^- /, '')}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Q&A Review Section */}
        {feedback.qaReview && feedback.qaReview.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Q&A Review</h2>
            <div className="space-y-8">
              {feedback.qaReview.map((qa, index) => (
                <div key={index} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                  {/* AI Question */}
                  <div className="flex gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">
                      AI
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{qa.question}</p>
                    </div>
                  </div>

                  {/* User Answer & Scores */}
                  <div className="flex gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 font-bold text-sm">
                      You
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">{qa.answer}</p>
                      
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          Clarity: {qa.scoreClarity ?? 0}/100
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          Technical: {qa.scoreTechnical ?? 0}/100
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          Confidence: {qa.scoreConfidence ?? 0}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Answer */}
                  {qa.suggestedAnswer && (
                    <div className="flex gap-4 ml-12">
                      <div className="flex-1 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          Suggested Better Answer
                        </h4>
                        <p className="text-sm text-blue-900">{qa.suggestedAnswer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center pt-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
