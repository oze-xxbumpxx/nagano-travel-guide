import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { travelAPI } from "../services/api";
import { TravelPlanFormData } from "../types";

const CreateTravelPlan: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    } else if (name === "isPublic") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  // バリデーション関数
  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!formData.title || formData.title.trim() === "") {
      validationErrors.push("タイトルは必須です");
    }

    if (!formData.description || formData.description.trim() === "") {
      validationErrors.push("説明は必須です");
    }

    if (!formData.startDate) {
      validationErrors.push("開始日は必須です");
    }

    if (!formData.endDate) {
      validationErrors.push("終了日は必須です");
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        validationErrors.push("終了日は開始日より後である必要があります");
      }
    }

    if (!formData.destination || formData.destination.trim() === "") {
      validationErrors.push("目的地は必須です");
    }

    if (!formData.budget.total || formData.budget.total < 0) {
      validationErrors.push("予算は0以上である必要があります");
    }

    return validationErrors;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const response = await travelAPI.create(formData);

      if (response.data.success) {
        // 成功処理
        alert("旅行プランが正常に作成されました！");
        navigate("/travel-plans");
      } else {
        setErrors(response.data.errors || ["旅行プランの作成に失敗しました"]);
      }
    } catch (error: any) {
      console.error("Error creating travel plan", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors(["サーバーエラーが発生しました"]);
      }
    } finally {
      setLoading(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    if (window.confirm("入力内容が失われますが、よろしいですか？")) {
      navigate("/travel-plans");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            新しい旅行プランを作成
          </h1>

          {/* エラーメッセージ */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    以下のエラーがあります：
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基本情報 */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">基本情報</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    タイトル *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="旅行プランのタイトルを入力"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="destination"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    目的地 *
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例: 奈良井宿"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  説明 *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="旅行プランの詳細な説明を入力"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    開始日 *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    終了日 *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 予算情報 */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">予算情報</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="budget.total"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    総予算 (円)
                  </label>
                  <input
                    type="number"
                    id="budget.total"
                    name="budget.total"
                    value={formData.budget.total}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="budget.currency"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    通貨
                  </label>
                  <select
                    id="budget.currency"
                    name="budget.currency"
                    value={formData.budget.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="JPY">JPY (日本円)</option>
                    <option value="USD">USD (米ドル)</option>
                    <option value="EUR">EUR (ユーロ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="budget.breakdown.accommodation"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    宿泊費
                  </label>
                  <input
                    type="number"
                    id="budget.breakdown.accommodation"
                    name="budget.breakdown.accommodation"
                    value={formData.budget.breakdown.accommodation}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="budget.breakdown.transportation"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    交通費
                  </label>
                  <input
                    type="number"
                    id="budget.breakdown.transportation"
                    name="budget.breakdown.transportation"
                    value={formData.budget.breakdown.transportation}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="budget.breakdown.food"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    食費
                  </label>
                  <input
                    type="number"
                    id="budget.breakdown.food"
                    name="budget.breakdown.food"
                    value={formData.budget.breakdown.food}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="budget.breakdown.activities"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    アクティビティ費
                  </label>
                  <input
                    type="number"
                    id="budget.breakdown.activities"
                    name="budget.breakdown.activities"
                    value={formData.budget.breakdown.activities}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="budget.breakdown.other"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    その他
                  </label>
                  <input
                    type="number"
                    id="budget.breakdown.other"
                    name="budget.breakdown.other"
                    value={formData.budget.breakdown.other}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* その他の設定 */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                その他の設定
              </h2>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  メモ
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="追加のメモや注意事項を入力"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 block text-sm text-gray-900"
                >
                  この旅行プランを公開する
                </label>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "作成中..." : "旅行プランを作成"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTravelPlan;
