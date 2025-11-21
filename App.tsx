import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import ArticleModal from './components/ArticleModal';
import Dashboard from './components/Dashboard';
import { fetchRegionalNews, fetchArticleDetailsStream } from './services/geminiService';
import { NewsArticle, NewsSource, CategoryData } from './types';

const TABS = ['阿曼', '海湾地区', '伊朗', '巴以局势', '也门胡塞', '叙利亚', '欧盟', '美国', '中国'];

interface CachedNewsData {
  articles: NewsArticle[];
  sources: NewsSource[];
  categories: CategoryData[];
  timestamp: Date;
}

const App: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<string>('阿曼');

  // Client-side cache to improve switching speed
  const [newsCache, setNewsCache] = useState<Record<string, CachedNewsData>>({});

  // Article Modal State
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingFullContent, setLoadingFullContent] = useState(false);
  const [fullArticleContent, setFullArticleContent] = useState<string | null>(null);

  const loadNews = useCallback(async (tab: string, forceRefresh = false) => {
    setError(null);

    // 1. Check cache first (if not forcing refresh)
    if (!forceRefresh && newsCache[tab]) {
      const cached = newsCache[tab];
      setArticles(cached.articles);
      setSources(cached.sources);
      setCategories(cached.categories);
      setLastUpdated(cached.timestamp);
      setLoading(false);
      return;
    }

    // 2. If no cache, show loading skeleton immediately
    setLoading(true);
    setArticles([]); 
    setSources([]);
    setCategories([]);

    try {
      const data = await fetchRegionalNews(tab);
      
      const newCacheData = {
        articles: data.articles,
        sources: data.sources,
        categories: data.categories,
        timestamp: new Date()
      };

      // Update state
      setArticles(data.articles);
      setSources(data.sources);
      setCategories(data.categories);
      setLastUpdated(newCacheData.timestamp);

      // Update cache
      setNewsCache(prev => ({
        ...prev,
        [tab]: newCacheData
      }));
    } catch (err) {
      setError("获取新闻失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, [newsCache]);

  useEffect(() => {
    loadNews(activeTab);
  }, [activeTab, loadNews]);

  // Handle "Read More" click
  const handleReadMore = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    setFullArticleContent(null); // Reset previous content

    // Check if we already have content cached for this article
    if (article.content) {
      setFullArticleContent(article.content);
      return;
    }

    // Fetch full details with streaming
    setLoadingFullContent(true);
    setFullArticleContent(""); // Initialize as empty string for streaming
    let accumulatedText = "";

    try {
      await fetchArticleDetailsStream(article.title, article.category, (chunk) => {
        accumulatedText += chunk;
        setFullArticleContent(accumulatedText);
      });
      
      // Cache the content in the article object to avoid re-fetching
      const updateArticleContentInCache = (tabName: string, articleId: string, content: string) => {
        setNewsCache(prev => {
          if (!prev[tabName]) return prev;
          return {
            ...prev,
            [tabName]: {
              ...prev[tabName],
              articles: prev[tabName].articles.map(a => a.id === articleId ? { ...a, content } : a)
            }
          };
        });
      };

      // Update local state
      setArticles(prev => prev.map(a => 
        a.id === article.id ? { ...a, content: accumulatedText } : a
      ));

      // Update global cache
      updateArticleContentInCache(activeTab, article.id, accumulatedText);

    } catch (err) {
      console.error("Failed to load article details", err);
    } finally {
      setLoadingFullContent(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing selection to avoid UI flicker during transition
    setTimeout(() => {
      setSelectedArticle(null);
      setFullArticleContent(null);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-10">
      <Header />

      {/* Main container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome / Status Section */}
        <div className="mb-6 sm:mb-8">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
             <div>
               <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">今日要闻</h2>
               <p className="text-sm sm:text-base text-gray-500 mt-1">
                 实时聚合中东地区最新动态 (24小时内)
               </p>
             </div>
             <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
               {lastUpdated && (
                 <span className="text-xs text-gray-400 font-medium">
                   更新于 {lastUpdated.getHours().toString().padStart(2, '0')}:{lastUpdated.getMinutes().toString().padStart(2, '0')}
                 </span>
               )}
               <button 
                onClick={() => loadNews(activeTab, true)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 active:scale-95 ${
                  loading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
                }`}
               >
                 {loading ? (
                   <>
                     <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                     更新中
                   </>
                 ) : (
                   <>
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                     刷新
                   </>
                 )}
               </button>
             </div>
           </div>

           {/* Category Tabs */}
           <div className="flex overflow-x-auto pb-2 gap-2 sm:gap-3 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
             {TABS.map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm sm:text-base font-medium transition-all duration-200 flex-shrink-0 ${
                   activeTab === tab 
                     ? 'bg-oman-red text-white shadow-md scale-105' 
                     : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                 }`}
               >
                 {tab}
               </button>
             ))}
           </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: News Feed */}
          <div className="lg:col-span-2 space-y-6">
            {loading && articles.length === 0 ? (
               // Skeleton Loader
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                 {[1, 2, 3, 4, 5, 6].map((i) => (
                   <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 h-56 animate-pulse flex flex-col p-6">
                     <div className="h-3 bg-gray-200 rounded w-16 mb-4"></div>
                     <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                     <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                     <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                   </div>
                 ))}
               </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-100">
                <p className="font-medium mb-2">{error}</p>
                <button onClick={() => loadNews(activeTab, true)} className="text-sm underline font-bold">点击重试</button>
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {articles.map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    onReadMore={handleReadMore}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 mb-4">未找到相关新闻</p>
                <button 
                  onClick={() => loadNews(activeTab, true)}
                  className="text-oman-red font-medium text-sm px-4 py-2 bg-red-50 rounded-lg"
                >
                  强制刷新
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Dashboard/Sidebar */}
          <div className="lg:col-span-1">
             <div className="lg:sticky lg:top-24 space-y-8">
               {/* Show dashboard even during loading if we have some cached data or wait until loaded */}
               { (articles.length > 0 || (loading && categories.length > 0)) && (
                 <Dashboard categories={categories} sources={sources} />
               )}
               
               {/* Mini Footer */}
               <div className="pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
                 <p>&copy; {new Date().getFullYear()} Middle East Kaleidoscope.</p>
                 <p className="mt-1">Powered by Gemini 2.5 Flash</p>
               </div>
             </div>
          </div>

        </div>
      </main>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <ArticleModal 
          article={selectedArticle}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isLoadingContent={loadingFullContent}
          fullContent={fullArticleContent}
        />
      )}
    </div>
  );
};

export default App;