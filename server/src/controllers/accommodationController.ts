import { Request, Response, NextFunction } from 'express';
import Accommodation, { IAccommodation } from '../models/Accommodation';

// 宿泊施設作成
export const createAccommodation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accommodation = await Accommodation.create(req.body);
    res.status(201).json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    next(error);
  }
};

// 宿泊施設一覧取得
export const getAccommodations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, prefecture, city, rating, isRecommended } = req.query;
    const query: any = {};

    if (type) query.type = type;
    if (prefecture) query['location.prefecture'] = new RegExp(prefecture as string, 'i');
    if (city) query['location.city'] = new RegExp(city as string, 'i');
    if (rating) query.rating = { $gte: Number(rating) };
    if (isRecommended !== undefined) query.isRecommended = isRecommended === 'true';

    const accommodations = await Accommodation.find(query).sort({ rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: accommodations.length,
      data: accommodations
    });
  } catch (error) {
    next(error);
  }
};

// 宿泊施設詳細取得
export const getAccommodationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        error: '宿泊施設が見つかりません'
      });
    }

    res.status(200).json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    next(error);
  }
};

// 宿泊施設更新
export const updateAccommodation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        error: '宿泊施設が見つかりません'
      });
    }

    res.status(200).json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    next(error);
  }
};

// 宿泊施設削除
export const deleteAccommodation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accommodation = await Accommodation.findByIdAndDelete(req.params.id);

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        error: '宿泊施設が見つかりません'
      });
    }

    res.status(200).json({
      success: true,
      message: '宿泊施設が削除されました'
    });
  } catch (error) {
    next(error);
  }
};

// タイプ別宿泊施設取得
export const getAccommodationsByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;
    const accommodations = await Accommodation.find({ type }).sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: accommodations.length,
      data: accommodations
    });
  } catch (error) {
    next(error);
  }
};

// おすすめ宿泊施設取得
export const getRecommendedAccommodations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accommodations = await Accommodation.find({ isRecommended: true })
      .sort({ rating: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: accommodations.length,
      data: accommodations
    });
  } catch (error) {
    next(error);
  }
};

// レビュー追加
export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, rating, comment } = req.body;
    
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({
        success: false,
        error: '宿泊施設が見つかりません'
      });
    }

    accommodation.reviews.push({
      user,
      rating,
      comment,
      date: new Date()
    });

    // 平均評価を再計算
    const totalRating = accommodation.reviews.reduce((sum, review) => sum + review.rating, 0);
    accommodation.rating = totalRating / accommodation.reviews.length;

    await accommodation.save();

    res.status(200).json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    next(error);
  }
};
