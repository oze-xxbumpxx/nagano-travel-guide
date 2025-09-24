export interface TravelPlan {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
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
  itinerary: any[];
  notes: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  accommodations?: Accommodation[];
  attractions?: Attraction[];
}
// Accommodation 型定義
export interface Accommodation {
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
    date: string;
  }[];
  isRecommended: boolean;
  tags: string[];
  travelPlanId: number;
  createdAt: string;
  updatedAt: string;
  travelPlan?: TravelPlan;
}

// Attraction 型定義
export interface Attraction {
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
    date: string;
  }[];
  isRecommended: boolean;
  tags: string[];
  travelPlanId: number;
  createdAt: string;
  updatedAt: string;
  travelPlan?: TravelPlan;
}

// API レスポンス型定義
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// フォーム用の型定義
export interface TravelPlanFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
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
  itinerary: any[];
  notes: string;
  isPublic: boolean;
}

export interface accommodationFormData {
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
    date: string;
  }[];
  isRecommended: boolean;
  tags: string[];
  travelPlanId: number;
}

export interface attractionFormData {
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
    date: string;
  }[];
  isRecommended: boolean;
  tags: string[];
  travelPlanId: number;
}
