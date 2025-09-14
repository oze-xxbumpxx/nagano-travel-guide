// インターフェース定義
export interface ITravelPlanAttributes {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  destination: string;
  budget: {
    toatal: number;
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
