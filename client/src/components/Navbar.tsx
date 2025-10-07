import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinkClass = (path: string) =>
    `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      isActive(path)
        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
    }`;

  return (
    <nav className="glass-effect shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* ロゴ */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all">
              <span className="text-xl md:text-2xl">🗾</span>
            </div>
            <div>
              <div className="text-lg md:text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                <span className="hidden sm:inline">奈良井旅行のしおり</span>
                <span className="sm:hidden">奈良井旅行</span>
              </div>
              <div className="text-xs text-gray-500 font-medium hidden md:block">
                Travel Planner
              </div>
            </div>
          </Link>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex space-x-4">
            <Link to="/" className={navLinkClass("/")}>
              ホーム
            </Link>
            <Link to="/travel-plans" className={navLinkClass("/travel-plans")}>
              旅行プラン
            </Link>
            <Link
              to="/accommodations"
              className={navLinkClass("/accommodations")}
            >
              宿泊施設
            </Link>
            <Link to="/attractions" className={navLinkClass("/attractions")}>
              観光地
            </Link>
          </div>

          {/* モバイルメニューボタン */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="メニュー"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
            <Link
              to="/"
              className={navLinkClass("/")}
              onClick={() => setIsMenuOpen(false)}
            >
              🏠 ホーム
            </Link>
            <Link
              to="/travel-plans"
              className={navLinkClass("/travel-plans")}
              onClick={() => setIsMenuOpen(false)}
            >
              🗾 旅行プラン
            </Link>
            <Link
              to="/create-travel-plan"
              className={navLinkClass("/create-travel-plan")}
              onClick={() => setIsMenuOpen(false)}
            >
              ➕ プラン作成
            </Link>
            <Link
              to="/accommodations"
              className={navLinkClass("/accommodations")}
              onClick={() => setIsMenuOpen(false)}
            >
              🏨 宿泊施設
            </Link>
            <Link
              to="/attractions"
              className={navLinkClass("/attractions")}
              onClick={() => setIsMenuOpen(false)}
            >
              🗼 観光地
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
