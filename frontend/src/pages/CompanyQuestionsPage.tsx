import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompanyQuestions, InterviewQuestion } from '../services/interviewCompanyApi';

const CompanyQuestionsPage: React.FC = () => {
  const { company } = useParams<{ company: string }>();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (company) {
      getCompanyQuestions(company)
        .then((data) => {
          setQuestions(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(`Failed to fetch questions for ${company}`, err);
          setLoading(false);
        });
    }
  }, [company]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link to="/companies" className="text-blue-600 hover:underline mr-4">&larr; Back to Companies</Link>
        <h1 className="text-3xl font-bold">{company} Interview Questions</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg">No questions found for this company.</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questions.map((q, idx) => {
                let acc = 0;
                try { acc = parseFloat(q.acceptanceRate) * 100; } catch (e) {}
                const freq = parseFloat(q.frequency) || 0;
                
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <a href={q.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                        {q.title}
                      </a>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${q.difficulty === 'EASY' ? 'bg-green-100 text-green-800' : 
                          q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                      {acc ? acc.toFixed(1) + '%' : q.acceptanceRate}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                      {freq.toFixed(1)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 max-w-xs truncate" title={q.topics}>
                      {q.topics}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompanyQuestionsPage;
