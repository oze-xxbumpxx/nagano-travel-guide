import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { travelAPI } from "../services/api";
import { TravelPlan } from "../types";

const TravelPlans: React.FC = () => {
  const navigate = useNavigate();
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTravelPlans();
  }, []);

  const fetchTravelPlans = async () => {
    try {
      setLoading(true);
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
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchTravelPlans}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">旅行プラン</h1>
        <button
          onClick={() => navigate("/create-travel-plan")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          新しいプランを作成
        </button>
      </div>

      {travelPlans.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            まだ旅行プランがありません
          </div>
          <button
            onClick={() => navigate("/create-travel-plan")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            最初のプランを作成
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {travelPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {plan.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{plan.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        📍 {plan.destination}
                      </span>
                      <span className="flex items-center">
                        📅 {formatDate(plan.startDate)} -{" "}
                        {formatDate(plan.endDate)}
                      </span>
                      <span className="flex items-center">
                        💰{" "}
                        {formatCurrency(
                          plan.budget.total,
                          plan.budget.currency
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors">
                      編集
                    </button>
                    <button className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors">
                      削除
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center">
                        <span className="text-gray-500">宿泊施設: </span>
                        <span className="font-medium text-blue-600">
                          {plan.accommodations?.length || 0}件
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500">観光地: </span>
                        <span className="font-medium text-green-600">
                          {plan.attractions?.length || 0}件
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500">公開: </span>
                        <span
                          className={`font-medium ${
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
