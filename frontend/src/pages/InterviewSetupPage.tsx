import { useState } from 'react';
import { Briefcase, BarChart, Layers, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function InterviewSetupPage() {
  const [level, setLevel] = useState('Fresher');
  const [type, setType] = useState('Technical');
  const [jobTitle, setJobTitle] = useState('Frontend Developer');
  const [techStack, setTechStack] = useState<string[]>(['Java', 'Spring Boot', 'ReactJS']);
  const [techInput, setTechInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [isHardcore, setIsHardcore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLaunch = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + '/interviews', {
        positionRole: jobTitle,
        experienceLevel: level,
        interviewType: type,
        language: 'English',
        targetTurns: 5,
        techStack: techStack,
        jobDescription: jobDescription,
        resumeText: resumeText,
        isHardcore: isHardcore
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/interviews/${res.data.id}`);
    } catch (err) {
      console.error('Failed to create interview session', err);
      setError('Failed to create interview session. Please ensure you are logged in and the server is running.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');

      const res = await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + '/interviews/extract-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      setResumeText(res.data.text);
      setUploadSuccess(true);
    } catch (err) {
      console.error('Failed to upload CV', err);
      setError('Failed to process the PDF. Please try another file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!techStack.includes(techInput.trim())) {
        setTechStack([...techStack, techInput.trim()]);
      }
      setTechInput('');
    }
  };

  const removeTech = (skillToRemove: string) => {
    setTechStack(techStack.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Interview Setup</h1>
        
        {/* Stepper */}
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-400">
          <div className="flex items-center gap-2 text-blue-600">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
            Role Details
          </div>
          <div className="w-12 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">2</span>
            Mock Evaluation
          </div>
          <div className="w-12 h-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">3</span>
            Finalize
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Set Up Your Mock Interview</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
              >
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Data Analyst</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Experience Level</label>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 min-h-[48px] py-2">
                {['Fresher', 'Junior', 'Senior'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="level"
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                      checked={level === opt}
                      onChange={() => setLevel(opt)}
                    />
                    <span className="text-sm text-slate-600 font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tech Stack / Key Skills (Press Enter to add)</label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[50px]">
                 {techStack.map(skill => (
                   <span key={skill} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium shadow-sm flex items-center gap-1">
                     {skill}
                     <button onClick={() => removeTech(skill)} className="text-slate-400 hover:text-red-500 font-bold ml-1">&times;</button>
                   </span>
                 ))}
                 <input 
                   type="text" 
                   placeholder="Add more..." 
                   className="bg-transparent outline-none flex-1 min-w-[100px] text-sm text-slate-700" 
                   value={techInput}
                   onChange={e => setTechInput(e.target.value)}
                   onKeyDown={handleAddTech}
                 />
              </div>
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Interview Type</label>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 min-h-[48px] py-2">
                {['Technical', 'Behavioral'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="type"
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                      checked={type === opt}
                      onChange={() => setType(opt)}
                    />
                    <span className="text-sm text-slate-600 font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
            <textarea 
              rows={4}
              placeholder="Paste specific 'Job Description', for Gemini to analyze."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Hardcore Mode */}
          <div className="mb-6">
            <label className="flex items-center gap-3 p-4 border border-red-200 bg-red-50/50 hover:bg-red-50 rounded-xl cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-red-600 focus:ring-red-500 rounded accent-red-600" 
                checked={isHardcore}
                onChange={(e) => setIsHardcore(e.target.checked)}
              />
              <div>
                <span className="block text-sm font-bold text-red-700">🔥 Hardcore Mode (High Pressure)</span>
                <span className="block text-xs text-red-600 mt-1">AI will act as a strict, aggressive interviewer asking deep technical questions.</span>
              </div>
            </label>
          </div>

          {/* Upload CV */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload CV / Resume (Optional)</label>
            <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${uploadSuccess ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                {uploadSuccess ? (
                  <>
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p className="text-sm font-semibold text-green-700">CV Extracted Successfully!</p>
                    <p className="text-xs text-green-600 mt-1">Ready to use for this interview.</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white border border-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-3 shadow-sm">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Click or drag PDF here to upload</p>
                    <p className="text-xs text-slate-500 mt-1">{isUploading ? 'Extracting text...' : 'Max 5MB. PDF only.'}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
             <button className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
               Previous
             </button>
             <button 
               onClick={handleLaunch}
               className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-blue-200"
             >
               <Play className="w-4 h-4 fill-current" />
               Launch Interview
             </button>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 h-fit">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Summary</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                 <Briefcase className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-xs text-slate-500 font-medium mb-1">Job Title</p>
                 <p className="text-sm font-semibold text-slate-800">{jobTitle}</p>
               </div>
            </div>
            
            <div className="flex gap-4">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                 <BarChart className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-xs text-slate-500 font-medium mb-1">Experience Level</p>
                 <p className="text-sm font-semibold text-slate-800">{level}</p>
               </div>
            </div>

            <div className="flex gap-4">
               <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
                 <Layers className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-xs text-slate-500 font-medium mb-2">Tech Stack / Key Skills</p>
                 <div className="flex flex-wrap gap-2">
                    {techStack.length > 0 ? techStack.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">{skill}</span>
                    )) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
