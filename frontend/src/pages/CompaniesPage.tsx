import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../services/interviewCompanyApi';

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getCompanies()
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch companies", err);
        setLoading(false);
      });
  }, []);

  const filteredCompanies = companies.filter(company => 
    company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Interview Problems by Company</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for a company..."
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredCompanies.map((company) => (
            <Link 
              key={company} 
              to={`/companies/${encodeURIComponent(company)}`}
              className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-center flex items-center justify-center h-24"
            >
              <span className="font-semibold text-gray-800">{company}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
