import React from "react";

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  onBack?: () => void;
  backText?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  onBack,
  backText = "戻る",
}) => {
  return (
    <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl shadow-xl p-6 md:p-8 overflow-hidden border-2 border-white">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-20 -mr-16 -mt-16"></div>

      <div className="relative">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold mb-4 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {backText}
          </button>
        )}

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6">
            <span className="text-4xl">{icon}</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-medium mt-1">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
