import { Request, Response, NextFunction } from 'express';
import TravelPlan, { ITravelPlan } from '../models/TravelPlan';

// 旅行プラン作成
export const createTravelPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const travelPlan = await TravelPlan.create(req.body);
    res.status(201).json({
      success: true,
      data: travelPlan
    });
  } catch (error) {
    next(error);
  }
};

// 旅行プラン一覧取得
export const getTravelPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { destination, startDate, endDate, isPublic } = req.query;
    const query: any = {};

    if (destination) query.destination = new RegExp(destination as string, 'i');
    if (startDate) query.startDate = { $gte: new Date(startDate as string) };
    if (endDate) query.endDate = { $lte: new Date(endDate as string) };
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    const travelPlans = await TravelPlan.find(query)
      .populate('accommodations')
      .populate('attractions')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: travelPlans.length,
      data: travelPlans
    });
  } catch (error) {
    next(error);
  }
};

// 旅行プラン詳細取得
export const getTravelPlanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const travelPlan = await TravelPlan.findById(req.params.id)
      .populate('accommodations')
      .populate('attractions');

    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        error: '旅行プランが見つかりません'
      });
    }

    res.status(200).json({
      success: true,
      data: travelPlan
    });
  } catch (error) {
    next(error);
  }
};

// 旅行プラン更新
export const updateTravelPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const travelPlan = await TravelPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('accommodations').populate('attractions');

    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        error: '旅行プランが見つかりません'
      });
    }

    res.status(200).json({
      success: true,
      data: travelPlan
    });
  } catch (error) {
    next(error);
  }
};

// 旅行プラン削除
export const deleteTravelPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const travelPlan = await TravelPlan.findByIdAndDelete(req.params.id);

    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        error: '旅行プランが見つかりません'
      });
    }

    res.status(200).json({
      success: true,
      message: '旅行プランが削除されました'
    });
  } catch (error) {
    next(error);
  }
};

// 旅程アイテム追加
export const addItineraryItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, activity } = req.body;
    
    const travelPlan = await TravelPlan.findById(req.params.id);
    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        error: '旅行プランが見つかりません'
      });
    }

    // 既存の日程を探す
    const existingDay = travelPlan.itinerary.find(
      day => day.date.toDateString() === new Date(date).toDateString()
    );

    if (existingDay) {
      existingDay.activities.push(activity);
    } else {
      travelPlan.itinerary.push({
        date: new Date(date),
        activities: [activity]
      });
    }

    await travelPlan.save();

    res.status(200).json({
      success: true,
      data: travelPlan
    });
  } catch (error) {
    next(error);
  }
};

// 旅程アイテム更新
export const updateItineraryItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, activityIndex, activity } = req.body;
    
    const travelPlan = await TravelPlan.findById(req.params.id);
    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        error: '旅行プランが見つかりません'
      });
    }

    const day = travelPlan.itinerary.find(
      d => d.date.toDateString() === new Date(date).toDateString()
    );

    if (!day || !day.activities[activityIndex]) {
      return res.status(404).json({
        success: false,
        error: '旅程アイテムが見つかりません'
      });
    }

    day.activities[activityIndex] = { ...day.activities[activityIndex], ...activity };
    await travelPlan.save();

    res.status(200).json({
      success: true,
      data: travelPlan
    });
  } catch (error) {
    next(error);
  }
};

// 旅程アイテム削除
export const deleteItineraryItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, activityIndex } = req.body;
    
    const travelPlan = await TravelPlan.findById(req.params.id);
    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        error: '旅行プランが見つかりません'
      });
    }

    const day = travelPlan.itinerary.find(
      d => d.date.toDateString() === new Date(date).toDateString()
    );

    if (!day || !day.activities[activityIndex]) {
      return res.status(404).json({
        success: false,
        error: '旅程アイテムが見つかりません'
      });
    }

    day.activities.splice(activityIndex, 1);
    await travelPlan.save();

    res.status(200).json({
      success: true,
      data: travelPlan
    });
  } catch (error) {
    next(error);
  }
};
