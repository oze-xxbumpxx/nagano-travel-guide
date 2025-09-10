import mongoose, { Document, Schema } from 'mongoose';

export interface ITravelPlan extends Document {
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
  accommodations: mongoose.Types.ObjectId[];
  attractions: mongoose.Types.ObjectId[];
  photos: string[];
  notes: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TravelPlanSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, '旅行プランのタイトルは必須です'],
    trim: true,
    maxlength: [100, 'タイトルは100文字以内で入力してください']
  },
  description: {
    type: String,
    required: [true, '旅行プランの説明は必須です'],
    trim: true,
    maxlength: [500, '説明は500文字以内で入力してください']
  },
  startDate: {
    type: Date,
    required: [true, '開始日は必須です']
  },
  endDate: {
    type: Date,
    required: [true, '終了日は必須です'],
    validate: {
      validator: function(this: ITravelPlan, value: Date) {
        return value > this.startDate;
      },
      message: '終了日は開始日より後である必要があります'
    }
  },
  destination: {
    type: String,
    required: [true, '目的地は必須です'],
    trim: true
  },
  budget: {
    total: {
      type: Number,
      required: [true, '予算の合計は必須です'],
      min: [0, '予算は0以上である必要があります']
    },
    currency: {
      type: String,
      default: 'JPY',
      enum: ['JPY', 'USD', 'EUR']
    },
    breakdown: {
      accommodation: { type: Number, default: 0, min: 0 },
      transportation: { type: Number, default: 0, min: 0 },
      food: { type: Number, default: 0, min: 0 },
      activities: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    }
  },
  itinerary: [{
    date: {
      type: Date,
      required: true
    },
    activities: [{
      time: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      location: {
        type: String,
        required: true,
        trim: true
      },
      cost: {
        type: Number,
        min: 0
      },
      notes: {
        type: String,
        trim: true
      }
    }]
  }],
  accommodations: [{
    type: Schema.Types.ObjectId,
    ref: 'Accommodation'
  }],
  attractions: [{
    type: Schema.Types.ObjectId,
    ref: 'Attraction'
  }],
  photos: [{
    type: String
  }],
  notes: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// インデックスの設定
TravelPlanSchema.index({ startDate: 1, endDate: 1 });
TravelPlanSchema.index({ destination: 1 });
TravelPlanSchema.index({ isPublic: 1 });

export default mongoose.model<ITravelPlan>('TravelPlan', TravelPlanSchema);
