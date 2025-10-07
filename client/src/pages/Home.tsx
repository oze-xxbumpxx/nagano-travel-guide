import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { travelAPI, accommodationAPI, attractionAPI } from "../services/api";

const Home: React.FC = () => {
  const [stats, setStats] = useState({
    travelPlans: 0,
    accommodations: 0,
    attractions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [travelPlansRes, accommodationsRes, attractionsRes] =
        await Promise.all([
          travelAPI.getAll(),
          accommodationAPI.getAll(),
          attractionAPI.getAll(),
        ]);

      setStats({
        travelPlans: travelPlansRes.data.data.length,
        accommodations: accommodationsRes.data.data.length,
        attractions: attractionsRes.data.data.length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* ヒーローセクション */}
      <section className="relative bg-gradient-primary text-white rounded-3xl overflow-hidden shadow-2xl">
        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative px-6 py-16 md:px-12 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium backdrop-blur-sm">
                ✨ 歴史ある奈良井宿を訪ねる旅
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                思い出に残る旅を
                <br />
                <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                  計画しよう
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-purple-100 max-w-2xl mx-auto">
                江戸時代の宿場町の面影を残す、歴史的な街並みを巡る旅
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/create-travel-plan"
                  className="group bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold hover:bg-yellow-50 transition-all transform hover:scale-105 shadow-xl text-lg flex items-center justify-center gap-2"
                >
                  <span>🎒</span>
                  旅行プランを作成
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  to="/travel-plans"
                  className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold hover:bg-opacity-30 transition-all border-2 border-white border-opacity-40 text-lg"
                >
                  プラン一覧を見る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 統計情報セクション */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          icon="🗾"
          title="旅行プラン"
          count={stats.travelPlans}
          description="作成された旅行プラン"
          loading={loading}
          color="blue"
        />
        <StatCard
          icon="🏨"
          title="宿泊施設"
          count={stats.accommodations}
          description="登録済みの宿泊施設"
          loading={loading}
          color="green"
        />
        <StatCard
          icon="🗼"
          title="観光地"
          count={stats.attractions}
          description="登録済みの観光スポット"
          loading={loading}
          color="purple"
        />
      </section>

      {/* 機能紹介セクション */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
          主な機能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            icon="🗾"
            title="旅行プラン管理"
            description="日程、予算、目的地を一元管理。あなただけの旅行計画を作成できます。"
            link="/travel-plans"
            linkText="プランを見る"
          />
          <FeatureCard
            icon="🏨"
            title="宿泊施設情報"
            description="旅館、ホテル、民宿など、様々な宿泊施設の情報を管理できます。"
            link="/accommodations"
            linkText="宿泊施設を見る"
          />
          <FeatureCard
            icon="🗼"
            title="観光地ガイド"
            description="奈良井宿の歴史的建造物や観光スポットの詳細情報を確認できます。"
            link="/attractions"
            linkText="観光地を見る"
          />
        </div>
      </section>

      {/* 奈良井宿についてセクション */}
      <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
        {/* 装飾要素 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-pink-300 to-red-300 rounded-full opacity-20 -ml-20 -mb-20"></div>

        <div className="relative">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block mb-4 text-5xl md:text-6xl">🏯</div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              奈良井宿について
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              中山道の歴史的な宿場町を訪ねる
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border-2 border-white transform hover:scale-105 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📜</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  歴史
                </h3>
              </div>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                奈良井宿は江戸時代の中山道の宿場町として栄え、現在も当時の街並みが保存されています。
                重要伝統的建造物群保存地区に指定されており、歴史的な価値が高い地域です。
              </p>
            </div>

            <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border-2 border-white transform hover:scale-105 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  見どころ
                </h3>
              </div>
              <ul className="space-y-3 text-sm md:text-base text-gray-700">
                <li className="flex items-center gap-3 group">
                  <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform">
                    ✓
                  </span>
                  <span>江戸時代の街並み</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform">
                    ✓
                  </span>
                  <span>重要伝統的建造物群</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform">
                    ✓
                  </span>
                  <span>木曽漆器の工房</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform">
                    ✓
                  </span>
                  <span>奈良井宿資料館</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform">
                    ✓
                  </span>
                  <span>宿場町の雰囲気</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="relative bg-gradient-warm text-white rounded-3xl p-8 md:p-16 text-center shadow-2xl overflow-hidden">
        {/* 装飾的な背景 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-75"></div>
        </div>

        <div className="relative">
          <div className="inline-block mb-4 text-6xl md:text-7xl animate-bounce">
            🎌
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6">
            さあ、旅の計画を始めましょう
          </h2>
          <p className="text-xl md:text-2xl mb-8 md:mb-10 text-white text-opacity-90 max-w-2xl mx-auto font-medium">
            歴史ある奈良井宿で、忘れられない思い出を作りませんか？
          </p>
          <Link
            to="/create-travel-plan"
            className="inline-flex items-center gap-3 bg-white text-pink-600 px-10 py-5 rounded-2xl font-black text-lg md:text-xl hover:bg-yellow-50 transition-all transform hover:scale-110 shadow-2xl group"
          >
            <span className="text-2xl">✨</span>
            今すぐプランを作成する
            <svg
              className="w-6 h-6 group-hover:translate-x-2 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

// 統計カードコンポーネント
interface StatCardProps {
  icon: string;
  title: string;
  count: number;
  description: string;
  loading: boolean;
  color: "blue" | "green" | "purple";
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  count,
  description,
  loading,
  color,
}) => {
  const colorClasses = {
    blue: "from-blue-400 via-blue-500 to-blue-600",
    green: "from-emerald-400 via-emerald-500 to-emerald-600",
    purple: "from-purple-400 via-purple-500 to-purple-600",
  };

  const bgClasses = {
    blue: "bg-blue-50",
    green: "bg-emerald-50",
    purple: "bg-purple-50",
  };

  return (
    <div
      className={`${bgClasses[color]} rounded-2xl shadow-lg p-6 card-hover border-2 border-white`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-2xl p-4 shadow-lg transform -rotate-3`}
        >
          <span className="text-4xl md:text-5xl">{icon}</span>
        </div>
        {!loading && (
          <div className="text-right">
            <p
              className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}
            >
              {count}
            </p>
          </div>
        )}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
        {title}
      </h3>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 md:w-32"></div>
        </div>
      ) : (
        <p className="text-gray-600 text-sm md:text-base font-medium">
          {description}
        </p>
      )}
    </div>
  );
};

// 機能カードコンポーネント
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  link,
  linkText,
}) => {
  return (
    <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 md:p-10 group overflow-hidden border-2 border-gray-100">
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
          <span className="text-4xl md:text-5xl">{icon}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
          {title}
        </h3>
        <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>
        <Link
          to={link}
          className="inline-flex items-center gap-2 text-purple-600 font-bold hover:text-purple-800 transition-colors text-base md:text-lg group/link"
        >
          {linkText}
          <svg
            className="w-5 h-5 transform group-hover/link:translate-x-2 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Home;
