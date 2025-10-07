import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { accommodationAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
interface Accommodation {
  id: number;
  name: string;
  description: string;
  type: string;
  location: {
    city: string;
    address: string;
    prefecture: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  amenities: string[];
  checkIn: string;
  checkOut: string;
  rating: number;
  isRecommended: boolean;
  tags: string[];
  travelPlan?: {
    id: number;
    title: string;
  };
}

const Accommodations: React.FC = () => {
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchAccommodations();
  }, []);
  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const response = await accommodationAPI.getAll();
      setAccommodations(response.data.data);
    } catch (error: any) {
      console.error("Error fetching accommodations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("この宿泊施設を削除しますか？")) {
      try {
        await accommodationAPI.delete(id);
        setAccommodations(accommodations.filter((acc) => acc.id !== id));
        alert("宿泊施設を削除しました");
      } catch (error: any) {
        console.error("Error deleting accommodation:", error);
        alert("宿泊施設の削除に失敗しました。もう一度お試しください。");
      }
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit-accommodation/${id}`);
  };

  const filteredAccommodation = accommodations.filter((accommodations) => {
    const matchesSearch =
      accommodations.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodations.location.city
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" || accommodations.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="宿泊施設を読み込み中..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ヘッダーセクション */}
      <div className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-3xl shadow-xl p-6 md:p-8 overflow-hidden border-2 border-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full opacity-20 -mr-16 -mt-16"></div>

        <div className="relative flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🏨</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              宿泊施設一覧
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-medium">
              登録済みの宿泊施設を管理できます
            </p>
          </div>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔍 検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="宿泊施設名または都市名で検索"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🏷️ タイプ
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base font-medium"
            >
              <option value="all">すべて</option>
              <option value="ホテル">🏨 ホテル</option>
              <option value="旅館">🎌 旅館</option>
              <option value="民宿">🏡 民宿</option>
              <option value="ゲストハウス">🏠 ゲストハウス</option>
            </select>
          </div>
        </div>
      </div>

      {/* 新規作成ボタン */}
      <div>
        <button
          onClick={() => navigate("/create-accommodation")}
          className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg font-bold flex items-center gap-2"
        >
          <span className="text-xl">✨</span>
          新しい宿泊施設を追加
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

      {/* 宿泊施設一覧 */}
      {filteredAccommodation.length === 0 ? (
        <EmptyState
          icon="🏨"
          title="宿泊施設が見つかりませんでした"
          description="別の条件で検索してみてください"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccommodation.map((accommodation) => (
            <div
              key={accommodation.id}
              className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all card-hover overflow-hidden border-2 border-gray-100"
            >
              {/* カラフルなトップバー */}
              <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"></div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
                      🏨
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-gray-900">
                      {accommodation.name}
                    </h3>
                  </div>
                  {accommodation.isRecommended && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
                      ⭐ おすすめ
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {accommodation.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                      🏷️
                    </span>
                    <span className="font-bold text-gray-700">
                      {accommodation.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      📍
                    </span>
                    <span className="text-gray-600">
                      {accommodation.location.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                      ⭐
                    </span>
                    <span className="font-bold text-yellow-600">
                      {accommodation.rating}
                    </span>
                    <span className="text-gray-500">/ 5.0</span>
                  </div>
                </div>

                {accommodation.travelPlan && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-3 py-1.5 rounded-lg font-semibold border border-purple-200">
                      🗾 {accommodation.travelPlan.title}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleEdit(accommodation.id)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md transform hover:scale-105"
                  >
                    ✏️ 編集
                  </button>
                  <button
                    onClick={() => handleDelete(accommodation.id)}
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
export default Accommodations;
