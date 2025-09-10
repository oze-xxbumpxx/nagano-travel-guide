import mongoose, { Document, Schema } from 'mongoose';

export interface IAccommodation extends Document {
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

const AccommodationSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, '宿泊施設の名前は必須です'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, '説明は必須です'],
    trim: true
  },
  type: {
    type: String,
    required: [true, '宿泊施設のタイプは必須です'],
    enum: ['ホテル', '旅館', '民宿', 'ゲストハウス', 'ペンション', 'リゾート', 'その他']
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
  contact: {
    phone: {
      type: String,
      required: [true, '電話番号は必須です'],
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  amenities: [{
    type: String,
    trim: true
  }],
  rooms: [{
    type: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      perNight: {
        type: Number,
        required: true,
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
    }]
  }],
  checkIn: {
    type: String,
    required: [true, 'チェックイン時間は必須です']
  },
  checkOut: {
    type: String,
    required: [true, 'チェックアウト時間は必須です']
  },
  policies: {
    cancellation: {
      type: String,
      required: [true, 'キャンセルポリシーは必須です'],
      trim: true
    },
    payment: {
      type: String,
      required: [true, '支払い方法は必須です'],
      trim: true
    },
    other: {
      type: String,
      trim: true
    }
  },
  photos: [{
    type: String
  }],
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
AccommodationSchema.index({ 'location.prefecture': 1, 'location.city': 1 });
AccommodationSchema.index({ type: 1 });
AccommodationSchema.index({ rating: -1 });
AccommodationSchema.index({ isRecommended: 1 });
AccommodationSchema.index({ tags: 1 });

export default mongoose.model<IAccommodation>('Accommodation', AccommodationSchema);
