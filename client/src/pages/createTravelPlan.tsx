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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ヘッダーセクション */}
      <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl shadow-xl p-6 md:p-8 overflow-hidden border-2 border-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-20 -mr-16 -mt-16"></div>
        
        <div className="relative">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold mb-4 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            旅行プラン一覧に戻る
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6">
              <span className="text-4xl">✨</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                新しい旅行プランを作成
              </h1>
              <p className="text-sm md:text-base text-gray-600 font-medium mt-1">
                素敵な旅の計画を始めましょう
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* エラーメッセージ */}
      {errors.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4 md:p-6 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white text-xl font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="font-black text-red-800 mb-2 text-lg">入力エラーがあります</h3>
              <ul className="space-y-1.5">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm flex items-start gap-2 font-medium">
                    <span className="text-red-500 font-bold">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報セクション */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border-2 border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-xl">📝</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">基本情報</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                  ✏️ タイトル *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base"
                  placeholder="旅行プランのタイトルを入力"
                  required
                />
              </div>

              <div>
                <label htmlFor="destination" className="block text-sm font-bold text-gray-700 mb-2">
                  📍 目的地 *
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base"
                  placeholder="例: 奈良井宿"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                📋 説明 *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base"
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
          </div>
        </div>

        {/* ボタンセクション */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border-2 border-gray-100">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 md:py-4 border-2 border-gray-300 rounded-2xl text-sm md:text-base font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group px-8 py-3 md:py-4 rounded-2xl text-sm md:text-base font-black text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  作成中...
                </>
              ) : (
                <>
                  <span className="text-xl">🚀</span>
                  旅行プランを作成
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTravelPlan;
