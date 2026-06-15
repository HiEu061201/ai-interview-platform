import { Users, BarChart3, Settings2, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface InterviewSession {
  id: number;
  positionRole: string;
  experienceLevel: string;
  interviewType: string;
  language: string;
  status: string;
  overallScore: number | null;
  createdAt: string;
}

interface UserAnalyticsDto {
  sessionId: number;
  date: string;
  positionRole: string;
  overallScore: number;
  technicalScore: number;
  clarityScore: number;
  confidenceScore: number;
}

interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  level: number;
  exp: number;
}

interface UserQuest {
  id: number;
  questType: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  rewardExp: number;
  isCompleted: boolean;
}

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalyticsDto[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<UserQuest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [interviewsRes, analyticsRes, profileRes, questsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + '/interviews', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + '/users/profile/analytics', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + '/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + '/quests/daily', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        // Assuming Spring Data Page response format (content array)
        if (interviewsRes.data && interviewsRes.data.content) {
          setInterviews(interviewsRes.data.content);
        } else if (Array.isArray(interviewsRes.data)) {
          setInterviews(interviewsRes.data);
        }

        if (Array.isArray(analyticsRes.data)) {
          setAnalytics(analyticsRes.data);
        }
        
        if (profileRes.data) {
          setProfile(profileRes.data);
        }

        if (questsRes.data) {
          setQuests(questsRes.data);
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr: any) => {
    if (!dateStr) return 'N/A';
    let d;
    if (Array.isArray(dateStr)) {
      d = new Date(dateStr[0], dateStr[1] - 1, dateStr[2], dateStr[3] || 0, dateStr[4] || 0, dateStr[5] || 0);
    } else {
      d = new Date(dateStr);
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getAverageScore = () => {
    const scoredInterviews = interviews.filter(i => i.overallScore != null);
    if (scoredInterviews.length === 0) return 0;
    const sum = scoredInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
    return (sum / scoredInterviews.length).toFixed(1);
  };

  // Chart configuration
  const chartData = {
    labels: analytics.map(a => formatDate(a.date)),
    datasets: [
      {
        label: 'Overall',
        data: analytics.map(a => a.overallScore),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgb(59, 130, 246)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
      {
        label: 'Technical',
        data: analytics.map(a => a.technicalScore),
        borderColor: 'rgb(34, 197, 94)', // green-500
        backgroundColor: 'rgb(34, 197, 94)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
      {
        label: 'Clarity',
        data: analytics.map(a => a.clarityScore),
        borderColor: 'rgb(245, 158, 11)', // amber-500
        backgroundColor: 'rgb(245, 158, 11)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
      {
        label: 'Confidence',
        data: analytics.map(a => a.confidenceScore),
        borderColor: 'rgb(168, 85, 247)', // purple-500
        backgroundColor: 'rgb(168, 85, 247)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            const item = analytics[index];
            return `${item.positionRole} - ${formatDate(item.date)}`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">User Dashboard</h1>
        <Link 
          to="/interviews/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-blue-200"
        >
          <Play className="w-4 h-4 fill-current" />
          Start New Interview
        </Link>
      </div>

      {profile && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-yellow-300">★</span> Level {profile.level}
              </h2>
              <p className="text-blue-100 text-sm mt-1">Keep practicing to reach Level {profile.level + 1}!</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold">{profile.exp}</span>
              <span className="text-blue-200 text-sm"> / {profile.level * 100} EXP</span>
            </div>
          </div>
          <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min((profile.exp / (profile.level * 100)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Quick stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Interviews</p>
              <p className="text-2xl font-bold text-slate-800">{interviews.length}</p>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Average Score</p>
              <p className="text-2xl font-bold text-slate-800">{getAverageScore()}/100</p>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Skills Covered</p>
              <div className="flex gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {quests.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">📜</span>
            <h2 className="text-lg font-semibold text-slate-800">Daily Quests</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quests.map(quest => (
              <div key={quest.id} className={`p-5 rounded-2xl border ${quest.isCompleted ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`font-semibold ${quest.isCompleted ? 'text-green-800' : 'text-slate-800'}`}>{quest.title}</h3>
                    <p className={`text-sm mt-1 ${quest.isCompleted ? 'text-green-600' : 'text-slate-500'}`}>{quest.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg">+{quest.rewardExp} EXP</span>
                    {quest.isCompleted && <span className="text-green-500 text-xl">✅</span>}
                  </div>
                </div>
                {!quest.isCompleted && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                      <span>Progress</span>
                      <span>{quest.currentValue} / {quest.targetValue}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 rounded-full h-2 transition-all" style={{ width: `${(quest.currentValue / quest.targetValue) * 100}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Progress Analytics</h2>
          <div className="h-80 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">My Interviews</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-4 px-6 text-sm font-semibold text-slate-600">Date</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600">Position</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600">Level</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600">Score</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {interviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No interviews found. Start a new one!
                  </td>
                </tr>
              ) : (
                interviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${interview.id}&backgroundColor=e2e8f0`} alt="avatar" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                          {formatDate(interview.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{interview.positionRole}</td>
                    <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{interview.experienceLevel}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">
                      {interview.overallScore != null ? (
                        <span className={`px-2 py-1 rounded-md ${interview.overallScore >= 80 ? 'bg-green-100 text-green-700' : interview.overallScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {interview.overallScore}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not available</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {interview.status === 'COMPLETED' ? (
                        <button 
                          onClick={() => navigate(`/interviews/${interview.id}/report`)}
                          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
                        >
                          View Details
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400 italic">{interview.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
