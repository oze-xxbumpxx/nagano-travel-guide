import { Request, Response, NextFunction } from 'express';
import Attraction, { IAttraction } from '../models/Attraction';

// 観光地作成
export const createAttraction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attraction = await Attraction.create(req.body);
    res.status(201).json({
      success: true,
      data: attraction
    });
  } catch (error) {
    next(error);
  }
};

// 観光地一覧取得
export const getAttractions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, prefecture, city, rating, isRecommended } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (prefecture) query['location.prefecture'] = new RegExp(prefecture as string, 'i');
    if (city) query['location.city'] = new RegExp(city as string, 'i');
    if (rating) query.rating = { $gte: Number(rating) };
    if (isRecommended !== undefined) query.isRecommended = isRecommended === 'true';

    const attractions = await Attraction.find(query).sort({ rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions
    });
  } catch (error) {
    next(error);
  }
};

// 観光地詳細取得
export const getAttractionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attraction = await Attraction.findById(req.params.id);

    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: '観光地が見つかりません'
      });
    }

    res.status(200).json({
      success: true,
      data: attraction
    });
  } catch (error) {
    next(error);
  }
};

// 観光地更新
export const updateAttraction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attraction = await Attraction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: '観光地が見つかりません'
      });
    }

    res.status(200).json({
      success: true,
      data: attraction
    });
  } catch (error) {
    next(error);
  }
};

// 観光地削除
export const deleteAttraction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attraction = await Attraction.findByIdAndDelete(req.params.id);

    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: '観光地が見つかりません'
      });
    }

    res.status(200).json({
      success: true,
      message: '観光地が削除されました'
    });
  } catch (error) {
    next(error);
  }
};

// カテゴリ別観光地取得
export const getAttractionsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.params;
    const attractions = await Attraction.find({ category }).sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions
    });
  } catch (error) {
    next(error);
  }
};

// おすすめ観光地取得
export const getRecommendedAttractions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attractions = await Attraction.find({ isRecommended: true })
      .sort({ rating: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions
    });
  } catch (error) {
    next(error);
  }
};

// レビュー追加
export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, rating, comment } = req.body;
    
    const attraction = await Attraction.findById(req.params.id);
    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: '観光地が見つかりません'
      });
    }

    attraction.reviews.push({
      user,
      rating,
      comment,
      date: new Date()
    });

    // 平均評価を再計算
    const totalRating = attraction.reviews.reduce((sum, review) => sum + review.rating, 0);
    attraction.rating = totalRating / attraction.reviews.length;

    await attraction.save();

    res.status(200).json({
      success: true,
      data: attraction
    });
  } catch (error) {
    next(error);
  }
};
