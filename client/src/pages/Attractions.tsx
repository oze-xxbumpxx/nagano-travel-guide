import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { attractionAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

interface Attraction {
  id: number;
  name: string;
  description: string;
  category: string;
  location: {
    city: string;
    address: string;
    prefecture: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  openingHours: {
    [key: string]: string;
  };
  admission: {
    adult: number;
    child: number;
    student: number;
  };
  features: string[];
  photos: string[];
  website: string;
  phone: string;
  rating: number;
  reviews: any[];
  isRecommended: boolean;
  tags: string[];
  travelPlan?: {
    id: number;
    title: string;
  };
}

const Attractions: React.FC = () => {
  const navigate = useNavigate();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const response = await attractionAPI.getAll();
      setAttractions(response.data.data);
    } catch (error) {
      console.error("Error fetching attractions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("この観光地を削除しますか？")) {
      try {
        await attractionAPI.delete(id);
        setAttractions(
          attractions.filter((attraction) => attraction.id !== id)
        );
        alert("観光地を削除しました");
      } catch (error) {
        console.error("Error deleting attraction:", error);
        alert("観光地の削除に失敗しました");
      }
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit-attraction/${id}`);
  };

  const filteredAttractions = attractions.filter((attraction) => {
    const matchesSearch =
      attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attraction.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || attraction.category === filterCategory;
    const matchesLocation =
      filterLocation === "all" ||
      attraction.location.prefecture === filterLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="観光地を読み込み中..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ヘッダーセクション */}
      <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl shadow-xl p-6 md:p-8 overflow-hidden border-2 border-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-300 to-emerald-300 rounded-full opacity-20 -mr-16 -mt-16"></div>

        <div className="relative flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🗼</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              観光地一覧
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-medium">
              登録済みの観光地を管理できます
            </p>
          </div>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔍 検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="観光地名または都市名で検索"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🏷️ カテゴリ
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base font-medium"
            >
              <option value="all">すべて</option>
              <option value="観光地">🗼 観光地</option>
              <option value="神社・寺院">⛩️ 神社・寺院</option>
              <option value="博物館・美術館">🏛️ 博物館・美術館</option>
              <option value="自然">🌲 自然</option>
              <option value="温泉">♨️ 温泉</option>
              <option value="グルメ">🍜 グルメ</option>
              <option value="ショッピング">🛍️ ショッピング</option>
              <option value="体験">🎨 体験</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📍 都道府県
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base font-medium"
            >
              <option value="all">すべて</option>
              <option value="長野県">🏔️ 長野県</option>
              <option value="東京都">🗼 東京都</option>
              <option value="大阪府">🏯 大阪府</option>
            </select>
          </div>
        </div>
      </div>

      {/* 新規作成ボタン */}
      <div>
        <button
          onClick={() => navigate("/create-attraction")}
          className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg font-bold flex items-center gap-2"
        >
          <span className="text-xl">✨</span>
          新しい観光地を追加
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* 観光地一覧 */}
      {filteredAttractions.length === 0 ? (
        <EmptyState
          icon="🗼"
          title="観光地が見つかりませんでした"
          description="別の条件で検索してみてください"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((attraction) => (
            <div
              key={attraction.id}
              className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all card-hover overflow-hidden border-2 border-gray-100"
            >
              {/* カラフルなトップバー */}
              <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
                      🗼
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-gray-900">
                      {attraction.name}
                    </h3>
                  </div>
                  {attraction.isRecommended && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md flex-shrink-0">
                      ⭐ おすすめ
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {attraction.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                      🏷️
                    </span>
                    <span className="font-bold text-gray-700">
                      {attraction.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      📍
                    </span>
                    <span className="text-gray-600">
                      {attraction.location.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                      ⭐
                    </span>
                    <span className="font-bold text-yellow-600">
                      {attraction.rating}
                    </span>
                    <span className="text-gray-500">/ 5.0</span>
                  </div>
                </div>

                {attraction.travelPlan && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-3 py-1.5 rounded-lg font-semibold border border-purple-200">
                      🗾 {attraction.travelPlan.title}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleEdit(attraction.id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md transform hover:scale-105"
                  >
                    ✏️ 編集
                  </button>
                  <button
                    onClick={() => handleDelete(attraction.id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:from-red-600 hover:to-pink-600 transition-all shadow-md transform hover:scale-105"
                  >
                    🗑️ 削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attractions;
