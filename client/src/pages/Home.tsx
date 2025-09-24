import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* ヒーローセクション */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
        <h1 className="text-4xl font-bold mb-4">長野県奈良井旅行のしおり</h1>
        <p className="text-xl mb-8">
          歴史ある奈良井宿を訪れる旅行を有意義にするために計画をしましょう！
        </p>
        <Link
          to="/travel-plans"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          旅行プランを作成する
        </Link>
      </div>
      {/* 機能紹介セクション */}
      {/* 機能紹介セクション */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-blue-600 text-4xl mb-4">🗾</div>
          <h3 className="text-xl font-semibold mb-2">旅行プラン</h3>
          <p className="text-gray-600 mb-4">
            旅行の日程、予算、目的地を管理できます
          </p>
          <Link
            to="/travel-plans"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            プラン一覧を見る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-blue-600 text-4xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold mb-2">宿泊施設</h3>
          <p className="text-gray-600 mb-4">
            旅館、ホテル、民宿などの宿泊情報を管理
          </p>
          <Link
            to="/accommodations"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            宿泊施設を見る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-blue-600 text-4xl mb-4">🗼</div>
          <h3 className="text-xl font-semibold mb-2">観光地</h3>
          <p className="text-gray-600 mb-4">
            奈良井宿の歴史的建造物や観光スポット
          </p>
          <Link
            to="/attractions"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            観光地を見る
          </Link>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          奈良井宿について
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">歴史</h3>
            <p className="text-gray-600">
              奈良井宿は江戸時代の中山道の宿場町として栄え、現在も当時の街並みが保存されています。
              重要伝統的建造物群保存地区に指定されており、歴史的な価値が高い地域です。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">見どころ</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• 江戸時代の街並み</li>
              <li>• 重要伝統的建造物群</li>
              <li>• 木曽漆器の工房</li>
              <li>• 奈良井宿資料館</li>
              <li>• 宿場町の雰囲気</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
