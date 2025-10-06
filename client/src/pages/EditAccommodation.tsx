import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { accommodationAPI, travelAPI } from "../services/api";

interface AccommodationFormData {
  name: string;
  description: string;
  type: string;
  location: {
    prefecture: string;
    city: string;
    address: string;
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
  policies: {
    payment: string;
    cancellation: string;
  };
  rating: number;
  isRecommended: boolean;
  tags: string[];
  rooms: any[];
  photos: string[];
  reviews: any[];
  travelPlanId?: number;
}

interface TravelPlan {
  id: number;
  title: string;
}

const EditAccommodation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);

  const [formData, setFormData] = useState<AccommodationFormData>({
    name: "",
    description: "",
    type: "ホテル",
    location: {
      prefecture: "",
      city: "",
      address: "",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    contact: {
      email: "",
      phone: "",
      website: "",
    },
    amenities: [],
    checkIn: "15:00",
    checkOut: "11:00",
    policies: {
      payment: "",
      cancellation: "",
    },
    rating: 0,
    isRecommended: false,
    tags: [],
    rooms: [],
    photos: [],
    reviews: [],
    travelPlanId: undefined,
  });

  useEffect(() => {
    fetchTravelPlans();
    if (id) {
      fetchAccommodation(parseInt(id));
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

  const fetchAccommodation = async (accommodationId: number) => {
    try {
      setLoading(true);
      const response = await accommodationAPI.getById(accommodationId);
      const accommodation = response.data.data;

      setFormData({
        name: accommodation.name,
        description: accommodation.description,
        type: accommodation.type,
        location: accommodation.location,
        contact: accommodation.contact || { email: "", phone: "", website: "" },
        amenities: accommodation.amenities || [],
        checkIn: accommodation.checkIn || "15:00",
        checkOut: accommodation.checkOut || "11:00",
        policies: accommodation.policies || { payment: "", cancellation: "" },
        rating: accommodation.rating || 0,
        isRecommended: accommodation.isRecommended || false,
        tags: accommodation.tags || [],
        rooms: accommodation.rooms || [],
        photos: accommodation.photos || [],
        reviews: accommodation.reviews || [],
        travelPlanId: accommodation.travelPlanId || undefined,
      });
    } catch (error: any) {
      console.error("Error fetching accommodation:", error);
      setErrors(["宿泊施設の取得に失敗しました"]);
    } finally {
      setLoading(false);
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

      await accommodationAPI.update(parseInt(id), formData);
      alert("宿泊施設を更新しました");
      navigate("/accommodations");
    } catch (error: any) {
      console.error("Error updating accommodation:", error);
      setErrors(["宿泊施設の更新に失敗しました"]);
    } finally {
      setSaving(false);
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
    } else if (name.startsWith("contact.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value,
        },
      }));
    } else if (name.startsWith("policies.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        policies: {
          ...prev.policies,
          [field]: value,
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
          onClick={() => navigate("/accommodations")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← 宿泊施設一覧に戻る
        </button>
        <h1 className="text-3xl font-bold text-gray-900">宿泊施設を編集</h1>
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
                宿泊施設名 *
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
                タイプ *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ホテル">ホテル</option>
                <option value="旅館">旅館</option>
                <option value="民宿">民宿</option>
                <option value="ゲストハウス">ゲストハウス</option>
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

        {/* 連絡先セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">連絡先</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                name="contact.email"
                value={formData.contact.email}
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
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ウェブサイト
            </label>
            <input
              type="url"
              name="contact.website"
              value={formData.contact.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* その他の情報セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">その他の情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                チェックイン時間
              </label>
              <input
                type="time"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                チェックアウト時間
              </label>
              <input
                type="time"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              支払いポリシー
            </label>
            <textarea
              name="policies.payment"
              value={formData.policies.payment}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              キャンセルポリシー
            </label>
            <textarea
              name="policies.cancellation"
              value={formData.policies.cancellation}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              評価 (0-5)
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              min="0"
              max="5"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isRecommended"
                checked={formData.isRecommended}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                おすすめの宿泊施設
              </span>
            </label>
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
            onClick={() => navigate("/accommodations")}
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

export default EditAccommodation;
