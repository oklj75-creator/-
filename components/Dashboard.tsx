import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CategoryData, NewsSource } from '../types';

interface DashboardProps {
  categories: CategoryData[];
  sources: NewsSource[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#DB161B', '#8884d8'];

const Dashboard: React.FC<DashboardProps> = ({ categories, sources }) => {
  return (
    <div className="space-y-8">
      {/* Topic Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-oman-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
          新闻话题分布
        </h2>
        <div className="h-64 w-full">
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="count"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              暂无数据
            </div>
          )}
        </div>
      </div>

      {/* Sources List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          参考来源
        </h2>
        {sources.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
            {sources.map((source, idx) => (
              <a 
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800 truncate pr-2">{source.title}</span>
                  <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">{new URL(source.uri).hostname}</div>
              </a>
            ))}
          </div>
        ) : (
            <p className="text-sm text-gray-500 italic">正在获取来源...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;