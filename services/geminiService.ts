import { GoogleGenAI } from "@google/genai";
import { NewsArticle, NewsResponse, NewsSource, CategoryData } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches the latest news for a specific Middle Eastern region.
 */
export const fetchRegionalNews = async (topic: string): Promise<NewsResponse> => {
  // Calculate strict dates to prevent old news
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const todayStr = now.toLocaleDateString("en-US", dateOptions);
  const yesterdayStr = yesterday.toLocaleDateString("en-US", dateOptions);
  const currentYear = now.getFullYear();

  // Determine search context based on topic
  let searchContext = "";
  switch (topic) {
    case '海湾地区':
      searchContext = "Gulf Cooperation Council (GCC) countries (Saudi Arabia, UAE, Qatar, Kuwait, Bahrain) current news exclude Oman";
      break;
    case '伊朗':
      searchContext = "Iran current news politics economy";
      break;
    case '巴以局势':
      searchContext = "Israel Palestine conflict Gaza strip war latest news";
      break;
    case '也门胡塞':
      searchContext = "Yemen Houthis conflict Red Sea crisis latest news";
      break;
    case '叙利亚':
      searchContext = "Syria civil war politics latest news";
      break;
    case '欧盟':
      searchContext = "European Union politics foreign affairs latest news";
      break;
    case '美国':
      searchContext = "USA politics foreign policy economy latest news";
      break;
    case '中国':
      searchContext = "China politics economy foreign affairs latest news";
      break;
    case '阿曼':
    default:
      searchContext = "Oman latest news";
      break;
  }

  // Explicitly list allowed dates for the prompt to be super strict
  const prompt = `
    TASK: Search for and list the top news stories related to: ${searchContext}.
    
    CRITICAL TIME FILTER:
    - You must ONLY include news published on: ${todayStr} OR ${yesterdayStr}.
    - CHECK THE YEAR: It MUST be ${currentYear}.
    - IF a story is from ${currentYear - 1} or earlier, DO NOT INCLUDE IT.
    - Verify the "published time" in the search results carefully.
    
    Please format your response strictly as follows for each news story:
    
    START_ARTICLE
    CATEGORY: [One word category in Chinese e.g. 政治, 经济, 军事, 外交]
    TITLE: [The Headline in Chinese]
    SOURCE: [Name of the media source e.g. Al Jazeera, Tehran Times, SPA]
    TIME: [Time ago or specific date e.g. "2小时前", "今天上午", "Yesterday"]
    SUMMARY: [A concise summary in Chinese, approx 50-80 words]
    END_ARTICLE

    Provide at least 20 distinct, RECENT news stories.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Extract Grounding Metadata (Sources)
    const sources: NewsSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "News Source",
            uri: chunk.web.uri || "#",
          });
        }
      });
    }

    // Parse the text into structured articles
    const articles: NewsArticle[] = [];
    const categoryCounts: Record<string, number> = {};

    const rawArticles = text.split("START_ARTICLE").slice(1); // Skip preamble

    rawArticles.forEach((raw, index) => {
      const categoryMatch = raw.match(/CATEGORY:\s*(.+)/);
      const titleMatch = raw.match(/TITLE:\s*(.+)/);
      const sourceMatch = raw.match(/SOURCE:\s*(.+)/);
      const timeMatch = raw.match(/TIME:\s*(.+)/);
      const summaryMatch = raw.match(/SUMMARY:\s*([\s\S]*?)(?=\nEND_ARTICLE|$)/);

      if (titleMatch && summaryMatch) {
        const category = categoryMatch ? categoryMatch[1].trim() : "综合";
        const title = titleMatch[1].trim();
        const summary = summaryMatch[1].trim();
        const source = sourceMatch ? sourceMatch[1].trim() : "未知来源";
        const time = timeMatch ? timeMatch[1].trim() : "";

        // Update category counts for the chart
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;

        articles.push({
          id: `news-${topic}-${index}`,
          category,
          title,
          summary,
          source,
          time
        });
      }
    });

    // Format category data for Recharts
    const categories: CategoryData[] = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      articles,
      sources: removeDuplicates(sources),
      categories,
      rawText: text,
    };
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

/**
 * Generates a full news report for a specific article title using streaming.
 */
export const fetchArticleDetailsStream = async (
  title: string, 
  category: string,
  onChunk: (text: string) => void
): Promise<void> => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    You are a professional journalist for "Middle East Kaleidoscope" (中东万花筒). 
    Write a detailed news report in Simplified Chinese (简体中文) about: "${title}".
    
    CRITICAL INSTRUCTIONS:
    1. **VERIFY DATE**: Ensure this news actually happened within the last 48 hours (Current Date: ${dateStr}).
    2. **START IMMEDIATELY**: Do NOT output the Title, Source, or Time at the top. Start the first paragraph of the body text immediately.
    3. **SINGLE SOURCE**: Base this on reputable media outlets relevant to the Middle East.
    
    Structure:
    - Body Paragraphs (300-500 words)
    
    Keep it professional and objective.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
    }
  } catch (error) {
    console.error("Error fetching article details:", error);
    onChunk("\n\n[获取详情失败，请检查网络连接或稍后重试]");
  }
};

function removeDuplicates(sources: NewsSource[]): NewsSource[] {
  const unique = new Map();
  sources.forEach(s => unique.set(s.uri, s));
  return Array.from(unique.values());
}