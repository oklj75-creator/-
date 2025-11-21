
import React from 'react';
import { NewsArticle } from '../types';

interface ArticleCardProps {
  article: NewsArticle;
  onReadMore: (article: NewsArticle) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onReadMore }) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer relative" onClick={() => onReadMore(article)}>
      {/* Top Colored Bar based on category */}
      <div className="h-1.5 bg-oman-red w-full"></div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
           <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-oman-red border border-red-100">
            {article.category}
          </span>
        </div>

        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 leading-snug group-hover:text-oman-red transition-colors">
          {article.title}
        </h3>

        {/* Source and Time Metadata - Displayed AFTER Title as requested */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 mb-4 font-sans">
          {article.source && (
            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
              {article.source}
            </span>
          )}
          
          {article.source && article.time && (
            <span className="text-gray-300">•</span>
          )}

          {article.time && (
            <span className="flex items-center gap-1 text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {article.time}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed flex-grow line-clamp-4">
          {article.summary}
        </p>
        
        <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">详情 &gt;</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onReadMore(article);
              }}
              className="text-oman-red text-sm font-medium flex items-center gap-1 group/btn hover:underline"
            >
              阅读全文
              <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
