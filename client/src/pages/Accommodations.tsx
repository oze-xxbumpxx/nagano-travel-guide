import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { accommodationAPI } from "../services/api";
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">宿泊施設一覧</h1>
        <p className="text-gray-600 mt-2">登録済みの宿泊施設を管理できます</p>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="宿泊施設名または都市名で検索"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイプ
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="ホテル">ホテル</option>
              <option value="旅館">旅館</option>
              <option value="民宿">民宿</option>
              <option value="ゲストハウス">ゲストハウス</option>
            </select>
          </div>
        </div>
      </div>

      {/* 新規作成ボタン */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/create-accommodation")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + 新しい宿泊施設を追加
        </button>
      </div>

      {/* 宿泊施設一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccommodation.map((accommodation) => (
          <div
            key={accommodation.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {accommodation.name}
                </h3>
                {accommodation.isRecommended && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    おすすめ
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4">{accommodation.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">タイプ:</span>
                  <span className="ml-2">{accommodation.type}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">場所:</span>
                  <span className="ml-2">{accommodation.location.city}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">評価:</span>
                  <span className="ml-2">{accommodation.rating}/5</span>
                </div>
              </div>

              {accommodation.travelPlan && (
                <div className="mb-4">
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    関連プラン: {accommodation.travelPlan.title}
                  </span>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(accommodation.id)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(accommodation.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAccommodation.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">宿泊施設が見つかりませんでした</p>
        </div>
      )}
    </div>
  );
};
export default Accommodations;
