import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { attractionAPI } from "../services/api";

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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">観光地一覧</h1>
        <p className="text-gray-600 mt-2">登録済みの観光地を管理できます</p>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="観光地名または都市名で検索"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="観光地">観光地</option>
              <option value="神社・寺院">神社・寺院</option>
              <option value="博物館・美術館">博物館・美術館</option>
              <option value="自然">自然</option>
              <option value="温泉">温泉</option>
              <option value="グルメ">グルメ</option>
              <option value="ショッピング">ショッピング</option>
              <option value="体験">体験</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              都道府県
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="長野県">長野県</option>
              <option value="東京都">東京都</option>
              <option value="大阪府">大阪府</option>
            </select>
          </div>
        </div>
      </div>

      {/* 新規作成ボタン */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/create-attraction")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + 新しい観光地を追加
        </button>
      </div>

      {/* 観光地一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAttractions.map((attraction) => (
          <div
            key={attraction.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {attraction.name}
                </h3>
                {attraction.isRecommended && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    おすすめ
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4">{attraction.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">カテゴリ:</span>
                  <span className="ml-2">{attraction.category}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">場所:</span>
                  <span className="ml-2">{attraction.location.city}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">評価:</span>
                  <span className="ml-2">{attraction.rating}/5</span>
                </div>
              </div>

              {attraction.travelPlan && (
                <div className="mb-4">
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    関連プラン: {attraction.travelPlan.title}
                  </span>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(attraction.id)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(attraction.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAttractions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">観光地が見つかりませんでした</p>
        </div>
      )}
    </div>
  );
};

export default Attractions;
