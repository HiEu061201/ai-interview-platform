import { useState, useEffect } from 'react';
import axios from 'axios';

interface JobRecommendation {
  title: string;
  company: string;
  salary: string;
  requirements: string;
  link: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [jobKeyword, setJobKeyword] = useState("Java");

  const fetchJobs = async (keyword: string) => {
    setIsJobsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}` + `/jobs/recommendations?keyword=${encodeURIComponent(keyword)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setJobs(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs("Java");
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">💼</span>
            <h2 className="text-lg font-semibold text-slate-800">Gợi ý việc làm (AI Powered)</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={jobKeyword}
              onChange={(e) => setJobKeyword(e.target.value)}
              placeholder="Nhập kỹ năng (VD: React, Node...)"
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-48"
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs(jobKeyword)}
            />
            <button
              onClick={() => fetchJobs(jobKeyword)}
              disabled={isJobsLoading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-70 transition-colors"
            >
              {isJobsLoading ? 'Đang tìm...' : 'Tìm'}
            </button>
          </div>
        </div>

        {isJobsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Gemini AI đang lướt web tìm job mới nhất...</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-slate-50 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-700 text-lg mb-1">{job.title}</h3>
                  <p className="text-slate-700 font-medium text-sm mb-2">🏢 {job.company}</p>
                  <p className="text-slate-500 text-sm italic">📋 Yêu cầu: {job.requirements}</p>
                </div>
                <div className="flex flex-col items-start md:items-end justify-between gap-2 md:w-48">
                  <span className="inline-block bg-green-100 text-green-800 font-semibold px-2 py-1 rounded text-sm whitespace-nowrap">
                    💰 {job.salary}
                  </span>
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Xem chi tiết ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            Không tìm thấy kết quả nào. Hãy thử từ khóa khác!
          </div>
        )}
      </div>
    </div>
  );
}
