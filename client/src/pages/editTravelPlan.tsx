import { useEffect, useState } from "react";
import { TravelPlanFormData } from "../types";
import { travelAPI } from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

const EditTravelPlan: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState<TravelPlanFormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    destination: "",
    budget: {
      total: 0,
      currency: "JPY",
      breakdown: {
        accommodation: 0,
        transportation: 0,
        food: 0,
        activities: 0,
        other: 0,
      },
    },
    itinerary: [],
    notes: "",
    isPublic: false,
  });

  useEffect(() => {
    if (id) {
      fetchTravelPlan(parseInt(id));
    }
  }, [id]);

  const fetchTravelPlan = async (planId: number) => {
    try {
      setLoading(true);
      const response = await travelAPI.getById(planId);
      const plan = response.data.data;

      // 既存データをフォームに設定
      setFormData({
        title: plan.title,
        description: plan.description,
        startDate: plan.startDate.split("T")[0], // YYYY-MM-DD形式に変換
        endDate: plan.endDate.split("T")[0],
        destination: plan.destination,
        budget: plan.budget,
        itinerary: plan.itinerary || [],
        notes: plan.notes || "",
        isPublic: plan.isPublic || false,
      });
    } catch (error: any) {
      console.error("Error fetching travel plan", error);
      setErrors(["旅行プランの取得に失敗しました"]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith("budget")) {
      const budgetField = name.split(".")[1];
      if (budgetField === "breakdown") {
        const breakdownField = name.split(".")[2];
        setFormData((prev) => ({
          ...prev,
          budget: {
            ...prev.budget,
            breakdown: {
              ...prev.budget.breakdown,
              [breakdownField]: parseFloat(value) || 0,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          budget: {
            ...prev.budget,
            [budgetField]:
              budgetField === "total" ? parseFloat(value) || 0 : value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    try {
      if (!id) {
        throw new Error("IDが指定されていません");
      }

      await travelAPI.update(parseInt(id), formData);
      alert("旅行プランが更新されました");
      navigate("/travel-plans");
    } catch (error: any) {
      console.error("Error updating travel plan:", error);
      setErrors(["旅行プランの更新に失敗しました"]);
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/travel-plans")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← 旅行プラン一覧に戻る
        </button>
        <h1 className="text-3xl font-bold text-gray-900">旅行プランを編集</h1>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">基本情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目的地 *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開始日 *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                終了日 *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 予算セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">予算</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                総予算 *
              </label>
              <input
                type="number"
                name="budget.total"
                value={formData.budget.total}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                通貨
              </label>
              <select
                name="budget.currency"
                value={formData.budget.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="JPY">JPY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-3">予算内訳</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  宿泊費
                </label>
                <input
                  type="number"
                  name="budget.breakdown.accommodation"
                  value={formData.budget.breakdown.accommodation}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交通費
                </label>
                <input
                  type="number"
                  name="budget.breakdown.transportation"
                  value={formData.budget.breakdown.transportation}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  食費
                </label>
                <input
                  type="number"
                  name="budget.breakdown.food"
                  value={formData.budget.breakdown.food}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アクティビティ
                </label>
                <input
                  type="number"
                  name="budget.breakdown.activities"
                  value={formData.budget.breakdown.activities}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  その他
                </label>
                <input
                  type="number"
                  name="budget.breakdown.other"
                  value={formData.budget.breakdown.other}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* その他の設定 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">その他の設定</h2>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メモ
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                このプランを公開する
              </span>
            </label>
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/travel-plans")}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "更新中..." : "更新"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTravelPlan;
