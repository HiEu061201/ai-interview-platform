import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  StudyCategory, 
  StudyMaterialSummary, 
  StudyMaterialDetail,
  getStudyCategories,
  getMaterialsByCategory,
  getMaterialDetail
} from '../services/studyApi';
import { ChevronRight, BookOpen, Loader2 } from 'lucide-react';

const StudyMaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, materialSlug } = useParams<{ categorySlug?: string; materialSlug?: string }>();

  const [categories, setCategories] = useState<StudyCategory[]>([]);
  const [materials, setMaterials] = useState<StudyMaterialSummary[]>([]);
  const [materialDetail, setMaterialDetail] = useState<StudyMaterialDetail | null>(null);
  
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch Categories
  useEffect(() => {
    getStudyCategories().then(data => {
      setCategories(data);
      setLoadingCategories(false);
      
      // Auto-select first category if none selected
      if (!categorySlug && data.length > 0) {
        navigate(`/study/${data[0].slug}`, { replace: true });
      }
    }).catch(err => {
      console.error("Failed to load categories", err);
      setLoadingCategories(false);
    });
  }, [categorySlug, navigate]);

  // Fetch Materials when category changes
  useEffect(() => {
    if (categorySlug) {
      setLoadingMaterials(true);
      getMaterialsByCategory(categorySlug).then(data => {
        setMaterials(data);
        setLoadingMaterials(false);
        
        // Auto-select first material if none selected
        if (!materialSlug && data.length > 0) {
          navigate(`/study/${categorySlug}/${data[0].slug}`, { replace: true });
        }
      }).catch(err => {
        console.error("Failed to load materials", err);
        setLoadingMaterials(false);
      });
    }
  }, [categorySlug, materialSlug, navigate]);

  // Fetch Material Detail when materialSlug changes
  useEffect(() => {
    if (materialSlug) {
      setLoadingDetail(true);
      getMaterialDetail(materialSlug).then(data => {
        setMaterialDetail(data);
        setLoadingDetail(false);
      }).catch(err => {
        console.error("Failed to load material detail", err);
        setLoadingDetail(false);
      });
    } else {
      setMaterialDetail(null);
    }
  }, [materialSlug]);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-gray-50 border-t -m-8">
      {/* Left Sidebar - Navigation */}
      <div className="w-80 border-r bg-white flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Tài liệu ôn tập</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loadingCategories ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            categories.map(category => (
              <div key={category.id} className="space-y-2">
                <h3 
                  className={`font-semibold text-sm uppercase tracking-wider cursor-pointer ${categorySlug === category.slug ? 'text-blue-600' : 'text-gray-500'}`}
                  onClick={() => navigate(`/study/${category.slug}`)}
                >
                  {category.name}
                </h3>
                
                {/* Only show materials if this category is selected */}
                {categorySlug === category.slug && (
                  <div className="flex flex-col space-y-1 ml-2 border-l-2 border-gray-100 pl-3">
                    {loadingMaterials ? (
                       <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-2" />
                    ) : (
                      materials.length === 0 ? (
                        <p className="text-sm text-gray-400">Chưa có bài học</p>
                      ) : (
                        materials.map(material => (
                          <div 
                            key={material.id}
                            onClick={() => navigate(`/study/${category.slug}/${material.slug}`)}
                            className={`text-sm py-1.5 px-2 rounded-md cursor-pointer flex items-center justify-between group ${materialSlug === material.slug ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                          >
                            <span className="truncate">{material.title}</span>
                            {materialSlug === material.slug && (
                              <ChevronRight className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        ))
                      )
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Main Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loadingDetail ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : materialDetail ? (
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <div className="mb-8">
              <div className="text-sm text-blue-600 font-medium mb-2">{materialDetail.categoryName}</div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{materialDetail.title}</h1>
            </div>
            <div className="prose prose-blue prose-lg max-w-none text-gray-700">
              <ReactMarkdown>{materialDetail.content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-400">
            <BookOpen className="h-16 w-16 mb-4 text-gray-300" />
            <p>Chọn một bài học từ danh sách bên trái để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMaterialsPage;
