import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { attractionAPI, travelAPI } from "../services/api";

interface AttractionFormData {
  name: string;
  description: string;
  category: string;
  location: {
    prefecture: string;
    city: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  openingHours: {
    open: string;
    close: string;
    closedDays?: string[];
  };
  admission: {
    adult: number;
    child?: number;
    senior?: number;
    currency: string;
  };
  features: string[];
  photos: string[];
  reviews: any[];
  website: string;
  phone: string;
  rating: number;
  isRecommended: boolean;
  tags: string[];
  travelPlanId?: number;
}

interface TravelPlan {
  id: number;
  title: string;
}

const EditAttraction: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);

  const [formData, setFormData] = useState<AttractionFormData>({
    name: "",
    description: "",
    category: "観光地",
    location: {
      prefecture: "",
      city: "",
      address: "",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    openingHours: {
      open: "09:00",
      close: "18:00",
      closedDays: [],
    },
    admission: {
      adult: 0,
      child: 0,
      senior: 0,
      currency: "JPY",
    },
    features: [],
    photos: [],
    reviews: [],
    website: "",
    phone: "",
    rating: 0,
    isRecommended: false,
    tags: [],
    travelPlanId: undefined,
  });

  useEffect(() => {
    fetchTravelPlans();
    if (id) {
      fetchAttraction(parseInt(id));
    }
  }, [id]);

  const fetchTravelPlans = async () => {
    try {
      const response = await travelAPI.getAll();
      setTravelPlans(response.data.data);
    } catch (error) {
      console.error("Error fetching travel plans:", error);
    }
  };

  const fetchAttraction = async (attractionId: number) => {
    try {
      setLoading(true);
      const response = await attractionAPI.getById(attractionId);
      const attraction = response.data.data;

      setFormData({
        name: attraction.name,
        description: attraction.description,
        category: attraction.category,
        location: attraction.location,
        openingHours: attraction.openingHours || {
          open: "09:00",
          close: "18:00",
          closedDays: [],
        },
        admission: attraction.admission || {
          adult: 0,
          child: 0,
          senior: 0,
          currency: "JPY",
        },
        features: attraction.features || [],
        photos: attraction.photos || [],
        reviews: attraction.reviews || [],
        website: attraction.website || "",
        phone: attraction.phone || "",
        rating: attraction.rating || 0,
        isRecommended: attraction.isRecommended || false,
        tags: attraction.tags || [],
        travelPlanId: attraction.travelPlanId || undefined,
      });
    } catch (error: any) {
      console.error("Error fetching attraction:", error);
      setErrors(["観光地の取得に失敗しました"]);
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

    if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
        },
      }));
    } else if (name.startsWith("admission.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        admission: {
          ...prev.admission,
          [field]: parseFloat(value) || 0,
        },
      }));
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

      await attractionAPI.update(parseInt(id), formData);
      alert("観光地を更新しました");
      navigate("/attractions");
    } catch (error: any) {
      console.error("Error updating attraction:", error);
      setErrors(["観光地の更新に失敗しました"]);
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
          onClick={() => navigate("/attractions")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← 観光地一覧に戻る
        </button>
        <h1 className="text-3xl font-bold text-gray-900">観光地を編集</h1>
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
                観光地名 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="観光地">観光地</option>
                <option value="神社・寺院">神社・寺院</option>
                <option value="博物館・美術館">博物館・美術館</option>
                <option value="自然">自然</option>
                <option value="温泉">温泉</option>
                <option value="グルメ">グルメ</option>
                <option value="ショッピング">ショッピング</option>
                <option value="体験">体験</option>
                <option value="その他">その他</option>
              </select>
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
        </div>

        {/* 場所情報セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">場所情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                都道府県 *
              </label>
              <input
                type="text"
                name="location.prefecture"
                value={formData.location.prefecture}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                市区町村 *
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              住所 *
            </label>
            <input
              type="text"
              name="location.address"
              value={formData.location.address}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 料金情報セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">料金情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                大人料金
              </label>
              <input
                type="number"
                name="admission.adult"
                value={formData.admission.adult}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                子供料金
              </label>
              <input
                type="number"
                name="admission.child"
                value={formData.admission.child}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                シニア料金
              </label>
              <input
                type="number"
                name="admission.senior"
                value={formData.admission.senior}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 連絡先セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">連絡先</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ウェブサイト
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話番号
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 旅行プラン選択セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">関連旅行プラン</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              旅行プラン
            </label>
            <select
              name="travelPlanId"
              value={formData.travelPlanId || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">旅行プランを選択してください（任意）</option>
              {travelPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/attractions")}
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

export default EditAttraction;
