import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

// インターフェース定義
export interface IAccommodationAttributes {
  id: number;
  name: string;
  description: string;
  type: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    prefecture: string;
    city: string;
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  amenities: string[];
  rooms: {
    type: string;
    capacity: number;
    price: {
      perNight: number;
      currency: string;
    };
    features: string[];
  }[];
  checkIn: string;
  checkOut: string;
  policies: {
    cancellation: string;
    payment: string;
    other?: string;
  };
  photos: string[];
  rating: number;
  reviews: {
    user: string;
    rating: number;
    comment: string;
    date: Date;
  }[];
  isRecommended: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccommodationCreationAttributes
  extends Optional<
    IAccommodationAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

// モデルクラス
class Accommodation
  extends Model<IAccommodationAttributes, IAccommodationCreationAttributes>
  implements IAccommodationAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public type!: string;
  public location!: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    prefecture: string;
    city: string;
  };
  public contact!: {
    phone: string;
    email?: string;
    website?: string;
  };
  public amenities!: string[];
  public rooms!: {
    type: string;
    capacity: number;
    price: {
      perNight: number;
      currency: string;
    };
    features: string[];
  }[];
  public checkIn!: string;
  public checkOut!: string;
  public policies!: {
    cancellation: string;
    payment: string;
    other?: string;
  };
  public photos!: string[];
  public rating!: number;
  public reviews!: {
    user: string;
    rating: number;
    comment: string;
    date: Date;
  }[];
  public isRecommended!: boolean;
  public tags!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// モデル初期化
Accommodation.init(
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
          msg: "宿泊施設の名前は必須です",
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
    type: {
      type: DataTypes.ENUM(
        "ホテル",
        "旅館",
        "民宿",
        "ゲストハウス",
        "ペンション",
        "リゾート",
        "その他"
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "宿泊施設のタイプは必須です",
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
    contact: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidContact(value: any) {
          if (!value || !value.phone) {
            throw new Error("電話番号は必須です");
          }
        },
      },
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    rooms: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    checkIn: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "チェックイン時間は必須です",
        },
      },
    },
    checkOut: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "チェックアウト時間は必須です",
        },
      },
    },
    policies: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidPolicies(value: any) {
          if (!value || !value.cancellation || !value.payment) {
            throw new Error("キャンセルポリシーと支払い方法は必須です");
          }
        },
      },
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
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
    modelName: "Accommodation",
    tableName: "accommodations",
    timestamps: true,
    indexes: [
      {
        fields: ["type"],
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

export default Accommodation;
