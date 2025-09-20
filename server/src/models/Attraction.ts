import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Accommodation from "./Accommodation";

// インターフェース定義
export interface IAttractionAttributes {
  id: number;
  name: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    prefecture: string;
    city: string;
  };
  category: string;
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
  website?: string;
  phone?: string;
  rating: number;
  reviews: {
    user: string;
    rating: number;
    comment: string;
    date: Date;
  }[];
  isRecommended: boolean;
  tags: string[];
  travelPlanId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttractionCreationAttributes
  extends Optional<IAttractionAttributes, "id" | "createdAt" | "updatedAt"> {}

// モデルクラス
class Attraction
  extends Model<IAttractionAttributes, IAttractionCreationAttributes>
  implements IAttractionAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public location!: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    prefecture: string;
    city: string;
  };
  public category!: string;
  public openingHours!: {
    open: string;
    close: string;
    closedDays?: string[];
  };
  public admission!: {
    adult: number;
    child?: number;
    senior?: number;
    currency: string;
  };
  public features!: string[];
  public photos!: string[];
  public website?: string;
  public phone?: string;
  public rating!: number;
  public reviews!: {
    user: string;
    rating: number;
    comment: string;
    date: Date;
  }[];
  public isRecommended!: boolean;
  public tags!: string[];
  public travelPlanId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// モデル初期化
Attraction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "観光地の名前は必須です",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "説明は必須です",
        },
      },
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidLocation(value: any) {
          if (
            !value ||
            !value.address ||
            !value.coordinates ||
            !value.prefecture ||
            !value.city
          ) {
            throw new Error("住所、座標、都道府県、市区町村は必須です");
          }
          if (
            value.coordinates.latitude < -90 ||
            value.coordinates.latitude > 90
          ) {
            throw new Error("緯度は-90から90の間である必要があります");
          }
          if (
            value.coordinates.longitude < -180 ||
            value.coordinates.longitude > 180
          ) {
            throw new Error("経度は-180から180の間である必要があります");
          }
        },
      },
    },
    category: {
      type: DataTypes.ENUM(
        "観光地",
        "神社・寺院",
        "博物館・美術館",
        "自然",
        "温泉",
        "グルメ",
        "ショッピング",
        "体験",
        "その他"
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "カテゴリは必須です",
        },
      },
    },
    openingHours: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidOpeningHours(value: any) {
          if (!value || !value.open || !value.close) {
            throw new Error("開館時間と閉館時間は必須です");
          }
        },
      },
    },
    admission: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidAdmission(value: any) {
          if (!value || typeof value.adult !== "number" || value.adult < 0) {
            throw new Error("大人料金は0以上である必要があります");
          }
          if (
            !value.currency ||
            !["JPY", "USD", "EUR"].includes(value.currency)
          ) {
            throw new Error(
              "通貨はJPY、USD、EURのいずれかである必要があります"
            );
          }
        },
      },
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: "有効なURLを入力してください",
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    reviews: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    isRecommended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    travelPlanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "travel_plans",
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Attraction",
    tableName: "attractions",
    timestamps: true,
    indexes: [
      {
        fields: ["category"],
      },
      {
        fields: ["rating"],
      },
      {
        fields: ["is_recommended"],
      },
      {
        fields: ["tags"],
      },
    ],
  }
);

// 関係性の定義
declare namespace Attraction {
  function associate(models: any): void;
}

Attraction.associate = (models: any) => {
  // TravelPlan hasMany Accommodatio
  Attraction.belongsTo(models.TravelPlan, {
    foreignKey: "travelPlanId",
    as: "travelPlan",
  });

  // TravelPlan hasMany Attraction
  Attraction.belongsToMany(models.Accommodation, {
    through: "accommodation_attractions",
    foreignKey: "attractionId",
    otherKey: "accommodationId",
    as: "nearbyAccommodations",
  });
};

export default Attraction;
