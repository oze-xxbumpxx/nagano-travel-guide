import mongoose, { Document, Schema } from 'mongoose';

export interface IAttraction extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const AttractionSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, '観光地の名前は必須です'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, '説明は必須です'],
    trim: true
  },
  location: {
    address: {
      type: String,
      required: [true, '住所は必須です'],
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, '緯度は必須です'],
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: [true, '経度は必須です'],
        min: -180,
        max: 180
      }
    },
    prefecture: {
      type: String,
      required: [true, '都道府県は必須です'],
      trim: true
    },
    city: {
      type: String,
      required: [true, '市区町村は必須です'],
      trim: true
    }
  },
  category: {
    type: String,
    required: [true, 'カテゴリは必須です'],
    enum: ['観光地', '神社・寺院', '博物館・美術館', '自然', '温泉', 'グルメ', 'ショッピング', '体験', 'その他']
  },
  openingHours: {
    open: {
      type: String,
      required: [true, '開館時間は必須です']
    },
    close: {
      type: String,
      required: [true, '閉館時間は必須です']
    },
    closedDays: [{
      type: String,
      enum: ['月', '火', '水', '木', '金', '土', '日']
    }]
  },
  admission: {
    adult: {
      type: Number,
      required: [true, '大人料金は必須です'],
      min: 0
    },
    child: {
      type: Number,
      min: 0
    },
    senior: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'JPY',
      enum: ['JPY', 'USD', 'EUR']
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  photos: [{
    type: String
  }],
  website: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isRecommended: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// インデックスの設定
AttractionSchema.index({ 'location.prefecture': 1, 'location.city': 1 });
AttractionSchema.index({ category: 1 });
AttractionSchema.index({ rating: -1 });
AttractionSchema.index({ isRecommended: 1 });
AttractionSchema.index({ tags: 1 });

export default mongoose.model<IAttraction>('Attraction', AttractionSchema);
