import { Request, Response, NextFunction } from "express";
import Attraction from "../models/Attraction";
import TravelPlan from "../models/TravelPlan";

// バリデーション関数
const validateAttraction = (data: any) => {
  const errors: string[] = [];

  if (!data.name || data.name.trim() === "") {
    errors.push("観光地名は必須です");
  }

  if (!data.description || data.description.trim() === "") {
    errors.push("説明は必須です");
  }

  if (!data.category || data.category.trim() === "") {
    errors.push("カテゴリは必須です");
  }

  if (!data.location || !data.location.address || !data.location.coordinates) {
    errors.push("住所と座標は必須です");
  }

  if (
    !data.openingHours ||
    !data.openingHours.open ||
    !data.openingHours.close
  ) {
    errors.push("開館時間と閉館時間は必須です");
  }

  if (
    !data.admission ||
    typeof data.admission.adult !== "number" ||
    data.admission.adult < 0
  ) {
    errors.push("大人料金は0以上である必要があります");
  }

  if (!data.travelPlanId || typeof data.travelPlanId !== "number") {
    errors.push("旅行プランIDは必須です");
  }

  if (data.rating && (data.rating < 0 || data.rating > 5)) {
    errors.push("評価は0-5の範囲で入力してください");
  }

  return errors;
};
// 全観光地取得
export const getAllAttractions = async (req: Request, res: Response) => {
  try {
    const attractions = await Attraction.findAll({
      include: [
        {
          model: TravelPlan,
          as: "travelPlan",
          attributes: ["id", "title", "destination"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      data: attractions,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "観光地の取得に失敗しました",
      error: error.message,
    });
  }
};

// IDで観光地取得
export const getAttractionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attraction = await Attraction.findByPk(id, {
      include: [
        {
          model: TravelPlan,
          as: "travelPlan",
          attributes: ["id", "title", "destination", "startDate", "endDate"],
        },
      ],
    });

    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: "観光地が見つかりません",
      });
    }

    return res.json({
      success: true,
      data: attraction,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "観光地の取得に失敗しました",
      error: error.message,
    });
  }
};

// 観光地作成
export const createAttraction = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      location,
      category,
      openingHours,
      admission,
      features,
      photos,
      website,
      phone,
      rating,
      reviews,
      isRecommended,
      tags,
      travelPlanId,
    } = req.body;

    // バリデーション
    const validationErrors = validateAttraction(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "バリデーションエラー",
        errors: validationErrors,
      });
    }

    // 旅行プランの存在確認
    const travelPlan = await TravelPlan.findByPk(travelPlanId);
    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        message: "指定された旅行プランが見つかりません",
      });
    }

    // データベースに保存
    const attraction = await Attraction.create({
      name,
      description,
      location,
      category,
      openingHours,
      admission,
      features: features || [],
      photos: photos || [],
      website,
      phone,
      rating: rating || 0,
      reviews: reviews || [],
      isRecommended: isRecommended || false,
      tags: tags || [],
      travelPlanId,
    });

    // 作成された観光地を関連データと一緒に取得
    const createdAttraction = await Attraction.findByPk(attraction.id, {
      include: [
        {
          model: TravelPlan,
          as: "travelPlan",
          attributes: ["id", "title", "destination"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "観光地が正常に作成されました",
      data: createdAttraction,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "観光地の作成に失敗しました",
      error: error.message,
    });
  }
};

// 観光地更新
export const updateAttraction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 旅行プランIDが更新される場合、その存在確認
    if (updateData.travelPlanId) {
      const travelPlan = await TravelPlan.findByPk(updateData.travelPlanId);
      if (!travelPlan) {
        return res.status(404).json({
          success: false,
          message: "指定された旅行プランが見つかりません",
        });
      }
    }

    const [updatedRowsCount] = await Attraction.update(updateData, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "観光地が見つかりません",
      });
    }

    // 更新された観光地を取得
    const updatedAttraction = await Attraction.findByPk(id, {
      include: [
        {
          model: TravelPlan,
          as: "travelPlan",
          attributes: ["id", "title", "destination"],
        },
      ],
    });

    return res.json({
      success: true,
      message: "観光地が更新されました",
      data: updatedAttraction,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "観光地の更新に失敗しました",
      error: error.message,
    });
  }
};

// 観光地削除
export const deleteAttraction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedRowsCount = await Attraction.destroy({
      where: { id },
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "観光地が見つかりません",
      });
    }

    return res.json({
      success: true,
      message: "観光地が削除されました",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "観光地の削除に失敗しました",
      error: error.message,
    });
  }
};
