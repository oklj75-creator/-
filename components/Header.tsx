import React, { useState } from 'react';

const Header: React.FC = () => {
  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const [showToast, setShowToast] = useState(false);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: 'Middle East Kaleidoscope | 中东万花筒',
      text: '查看中东地区最新每日新闻动态',
      url: shareUrl,
    };

    if (typeof navigator.share === 'function') {
      const canShare = typeof navigator.canShare === 'function' 
        ? navigator.canShare(shareData) 
        : true;

      if (canShare) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            return;
          }
          console.warn('Native share failed/unsupported, falling back to clipboard:', err);
        }
      }
    }

    const copyToClipboard = async (text: string): Promise<boolean> => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (err) {
          console.warn('Async Clipboard API failed:', err);
        }
      }

      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        console.error('Legacy copy failed:', err);
        return false;
      }
    };

    const success = await copyToClipboard(shareUrl);
    if (success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } else {
      alert("无法自动复制链接，请手动复制浏览器地址栏。");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo Area */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-oman-red rounded-full flex items-center justify-center shadow-md text-white font-bold font-serif text-lg sm:text-xl">
                M
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-lg sm:text-2xl font-serif font-bold text-gray-900 tracking-tight whitespace-nowrap">
                  ME Kaleidoscope <span className="text-oman-red text-sm sm:text-lg font-sans font-normal opacity-80 hidden xs:inline">| 中东万花筒</span>
                </h1>
              </div>
            </div>

            {/* Right Side: Share Button & Date */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={handleShare}
                className="bg-gray-900 hover:bg-black text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden xs:inline">分享</span>
                <span className="xs:hidden">分享</span>
              </button>

              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{today}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification for Desktop Copy */}
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up">
          <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            链接已复制，快去分享吧！
          </div>
        </div>
      )}
    </>
  );
};

export default Header;