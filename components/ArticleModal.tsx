
import React, { useEffect, useRef } from 'react';
import { NewsArticle } from '../types';

interface ArticleModalProps {
  article: NewsArticle;
  isOpen: boolean;
  onClose: () => void;
  isLoadingContent: boolean;
  fullContent: string | null;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ 
  article, 
  isOpen, 
  onClose, 
  isLoadingContent, 
  fullContent 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reset scroll position when modal opens or article changes
  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [isOpen, article.id]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative border-t-4 border-oman-red transition-transform duration-300 scale-100">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors shadow-sm border border-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Section (Fixed) */}
        <div className="px-6 pt-8 pb-4 flex-shrink-0 bg-white">
           <div className="flex flex-wrap items-center gap-2 mb-3">
             <span className="inline-block px-2.5 py-0.5 text-xs font-bold tracking-wider text-oman-red uppercase bg-red-50 rounded border border-red-100">
                {article.category}
             </span>
             {/* Metadata Displayed Immediately */}
             <div className="flex items-center gap-2 text-xs text-gray-400 font-sans">
                <span>{article.source || "News Source"}</span>
                <span>•</span>
                <span>{article.time || "Today"}</span>
             </div>
           </div>
           
           <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-tight mb-2">
              {article.title}
           </h2>
        </div>

        {/* Scrollable Content Area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto px-6 pb-8 bg-white scroll-smooth"
        >
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
            
             {/* 1. LEAD PARAGRAPH (Instant Summary) 
                 Presented as the first paragraph of the article for immediate readability. 
             */}
             <p className="text-xl text-gray-600 font-medium leading-relaxed mb-6">
               {article.summary}
             </p>

             {/* Divider between Lead and Full Body */}
             <hr className="border-gray-100 my-6" />

             {/* 2. Full Streaming Content */}
             <div className="text-base sm:text-lg text-gray-800 leading-7 text-justify">
               {fullContent && fullContent.split('\n\n').map((paragraph, idx) => {
                   // Skip redundant metadata if the model generates it anyway
                   if (paragraph.includes('来源：') || paragraph.includes('发布时间：')) return null;
                   
                   return (
                      <p key={idx} className="mb-5">
                        {paragraph}
                      </p>
                   );
                })}
             </div>

             {/* 3. Loading Indicator */}
             {isLoadingContent && (
               <div className="mt-4 flex flex-col gap-3 animate-pulse">
                 {!fullContent && (
                   // Subtle skeleton suggesting more text is coming
                   <>
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-5/6" />
                      <div className="h-4 bg-gray-100 rounded w-4/5" />
                   </>
                 )}
                 <div className="flex items-center gap-2 text-xs text-oman-red font-medium mt-2">
                    <span className="w-2 h-2 bg-oman-red rounded-full animate-ping"></span>
                    正在生成详细报道...
                 </div>
               </div>
             )}
             
             {/* Footer Note */}
             {(fullContent && !isLoadingContent) && (
                <div className="mt-10 pt-6 border-t border-dashed border-gray-200 flex items-center gap-2 text-sm text-gray-400 italic">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span>由 Gemini AI 基于实时搜索结果生成</span>
                </div>
             )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur flex justify-between items-center">
             {/* Share hint or other action could go here */}
             <div className="text-xs text-gray-400">
                {fullContent ? "阅读完成" : "阅读中..."}
             </div>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-all active:scale-95 shadow-sm"
            >
              关闭
            </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
