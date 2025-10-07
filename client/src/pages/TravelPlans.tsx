import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { travelAPI } from "../services/api";
import { TravelPlan } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const TravelPlans: React.FC = () => {
  const navigate = useNavigate();
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTravelPlans();
  }, []);

  const fetchTravelPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await travelAPI.getAll();
      setTravelPlans(response.data.data);
    } catch (err: any) {
      setError("旅行プランの取得に失敗しました");
      console.error("Error fetching travel plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("この旅行プランを削除しますか？")) {
      return;
    }
    try {
      await travelAPI.delete(id);
      fetchTravelPlans();
    } catch (error: any) {
      console.error("Error deleting travel plan:", error);
      alert("旅行プランの削除に失敗しました。");
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit-travel-plan/${id}`);
  };

  const filteredPlans = travelPlans.filter(
    (plan) =>
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner size="lg" text="旅行プランを読み込み中..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{error}</h3>
        <button
          onClick={fetchTravelPlans}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl shadow-xl p-6 md:p-8 overflow-hidden border-2 border-white">
        {/* 装飾 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-20 -mr-16 -mt-16"></div>

        <div className="relative">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🗾</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  旅行プラン
                </h1>
              </div>
              <p className="text-sm md:text-base text-gray-600 font-medium ml-15">
                あなたの旅行計画を管理します
              </p>
            </div>
            <button
              onClick={() => navigate("/create-travel-plan")}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg font-bold text-sm md:text-base flex items-center justify-center gap-2"
            >
              <span className="text-xl">✨</span>
              新しいプランを作成
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

          {/* 検索バー */}
          {travelPlans.length > 0 && (
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="タイトルや目的地で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-4 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base bg-white shadow-inner"
              />
            </div>
          )}
        </div>
      </div>

      {/* 空の状態 */}
      {travelPlans.length === 0 ? (
        <EmptyState
          icon="🗾"
          title="まだ旅行プランがありません"
          description="最初の旅行プランを作成して、素敵な旅の計画を始めましょう！"
          actionText="最初のプランを作成"
          actionLink="/create-travel-plan"
        />
      ) : filteredPlans.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="検索結果がありません"
          description="別のキーワードで検索してみてください"
        />
      ) : (
        <div className="grid gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 card-hover overflow-hidden border-2 border-gray-100"
            >
              {/* カラフルなトップバー */}
              <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0 transform -rotate-6">
                        🎒
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                          {plan.title}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 line-clamp-2 leading-relaxed">
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold border border-purple-200">
                        📍 {plan.destination}
                      </span>
                      <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold border border-blue-200">
                        📅 {formatDate(plan.startDate)} -{" "}
                        {formatDate(plan.endDate)}
                      </span>
                      <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold border border-green-200">
                        💰{" "}
                        {formatCurrency(
                          plan.budget.total,
                          plan.budget.currency
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(plan.id)}
                      className="flex-1 md:flex-none bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md transform hover:scale-105"
                    >
                      ✏️ 編集
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="flex-1 md:flex-none bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-red-600 hover:to-pink-600 transition-all shadow-md transform hover:scale-105"
                    >
                      🗑️ 削除
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-4">
                  <div className="flex flex-wrap justify-between gap-4 text-xs md:text-sm">
                    <div className="flex flex-wrap gap-4 md:gap-6">
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <span className="text-gray-600">🏨</span>
                        <span className="font-bold text-blue-600">
                          {plan.accommodations?.length || 0}
                        </span>
                        <span className="text-gray-500">宿泊施設</span>
                      </div>
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                        <span className="text-gray-600">🗼</span>
                        <span className="font-bold text-green-600">
                          {plan.attractions?.length || 0}
                        </span>
                        <span className="text-gray-500">観光地</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <span className="text-gray-600">👁️</span>
                        <span
                          className={`font-bold ${
                            plan.isPublic ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {plan.isPublic ? "はい" : "いいえ"}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400 text-xs">
                      作成日: {formatDate(plan.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelPlans;
