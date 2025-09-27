import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            長野県奈良井旅行のしおり
          </Link>

          <div className="flex space-x-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              ホーム
            </Link>
            <Link
              to="/travel-plans"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/travel-plans")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              旅行プラン
            </Link>
            <Link
              to="/create-travel-plan"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/create-travel-plan")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              プラン作成
            </Link>
            <Link
              to="/accommodations"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/accommodations")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              宿泊施設
            </Link>
            <Link
              to="/attractions"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/attractions")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              観光地
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
