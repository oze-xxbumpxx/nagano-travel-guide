import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

// インターフェース定義
export interface ITravelPlanAttributes {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  destination: string;
  budget: {
    total: number;
    currency: string;
    breakdown: {
      accommodation: number;
      transportation: number;
      food: number;
      activities: number;
      other: number;
    };
  };
  itinerary: {
    date: Date;
    activities: {
      time: string;
      title: string;
      description: string;
      location: string;
      cost?: number;
      notes?: string;
    }[];
  }[];
  notes: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITravelPlanCreationAttributes
  extends Optional<ITravelPlanAttributes, "id" | "createdAt" | "updatedAt"> {}

// モデルクラス
class TravelPlan extends Model<
  ITravelPlanAttributes,
  ITravelPlanCreationAttributes
> {
  public id!: number;
  public title!: string;
  public description!: string;
  public startDate!: Date;
  public endDate!: Date;
  public destination!: string;
  public budget!: {
    total: number;
    currency: string;
    breakdown: {
      accommodation: number;
      transportation: number;
      food: number;
      activities: number;
      other: number;
    };
  };
  public itinerary!: {
    date: Date;
    activities: {
      time: string;
      title: string;
      description: string;
      location: string;
      cost?: number;
      notes?: string;
    }[];
  }[];
  public notes!: string;
  public isPublic!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// モデルの初期化
TravelPlan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "旅行プランのタイトルは必須です",
        },
        len: {
          args: [1, 100],
          msg: "タイトルは100文字以内でn湯力してください",
        },
      },
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "旅行プランの説明は必須です",
        },
        len: {
          args: [1, 500],
          msg: "説明は500字以内で入力してください",
        },
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "開始日は必須です",
        },
      },
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "終了日は必須です",
        },
        isAfterStartDate(value: Date) {
          const model = this as any;
          if (value <= model.startDate) {
            throw new Error("終了日は開始日より後である必要があります");
          }
        },
      },
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "目的地は必須です",
        },
      },
    },
    budget: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidBudget(value: any) {
          if (!value || typeof value.total !== "number" || value.total < 0) {
            throw new Error("予算の合計は0以上である必要があります");
          }
          if (
            !value.currency ||
            !["JPY", "USD", "EUR"].includes(value.currency)
          ) {
            throw new Error("通過はJPY,USD,EURのいずれかである必要があります");
          }
        },
      },
    },
    itinerary: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: "TravelPlan",
    tableName: "travel_plans",
    timestamps: true,
    indexes: [
      {
        fields: ["start_date", "end_date"],
      },
      {
        fields: ["destination"],
      },
      {
        fields: ["is_public"],
      },
    ],
  }
);

// 関係性の定義
declare namespace TravelPlan {
  function associate(models: any): void;
}

TravelPlan.associate = (models: any) => {
  // TravelPlan hasMany Accommodation
  TravelPlan.hasMany(models.Accommodation, {
    foreignKey: "travelPlanId",
    as: "accommodations",
  });

  // TravelPlan hasMany Attraction
  TravelPlan.hasMany(models.Attraction, {
    foreignKey: "travelPlanId",
    as: "attractions",
  });
};

export default TravelPlan;
