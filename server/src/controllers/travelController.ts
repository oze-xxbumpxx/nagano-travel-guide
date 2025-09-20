import { Request, Response, NextFunction } from "express";
import TravelPlan from "../models/TravelPlan";
import Accommodation from "../models/Accommodation";
import Attraction from "../models/Attraction";

// バリデーション関数
const validateTravelPlan = (data: any) => {
  const errors: string[] = [];

  if (!data.title || data.title.trim() === "") {
    errors.push("タイトルは必須です");
  }

  if (!data.description || data.description.trim() === "") {
    errors.push("説明は必須です");
  }

  if (!data.startDate || !data.endDate) {
    errors.push("開始日と終了日は必須です");
  }

  if (
    data.startDate &&
    data.endDate &&
    new Date(data.endDate) <= new Date(data.startDate)
  ) {
    errors.push("終了日は開始日よりも後である必要があります");
  }

  if (!data.destination || data.destination.trim() === "") {
    errors.push("目的地は必須です");
  }

  if (
    !data.budget ||
    typeof data.budget.total !== "number" ||
    data.budget.total < 0
  ) {
    errors.push("予算の合計は0以上である必要があります");
  }

  return errors;
};

export const getAllTravelPlans = async (req: Request, res: Response) => {
  // 全旅行プランを取得（関連データを含む）
  try {
    const travelPlans = await TravelPlan.findAll({
      include: [
        {
          model: Accommodation,
          as: "accommodations",
          attributes: ["id", "name", "type", "location", "rating"],
        },
        {
          model: Attraction,
          as: "attractions",
          attributes: ["id", "name", "location", "rating"],
        },
      ],
      order: [["startDate", "DESC"]],
    });

    res.json({
      success: true,
      data: travelPlans,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "旅行プランの取得に失敗しました",
      error: error.message,
    });
  }
};

export const getTravelPlanById = async (req: Request, res: Response) => {
  // IDで旅行プランを取得（関連データを含む）
  try {
    const { id } = req.params;
    const travelPlan = await TravelPlan.findByPk(id, {
      include: [
        {
          model: Accommodation,
          as: "accommodations",
          attributes: [
            "id",
            "name",
            "type",
            "location",
            "rating",
            "description",
          ],
        },
        {
          model: Attraction,
          as: "attractions",
          attributes: [
            "id",
            "name",
            "category",
            "location",
            "rating",
            "description",
          ],
        },
      ],
    });
    if (!travelPlan) {
      return res.status(404).json({
        success: false,
        message: "旅行プランが見つかりません",
      });
    }
    return res.json({
      success: true,
      data: travelPlan,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "旅行プランの取得に失敗しました",
      error: error.message,
    });
  }
};

export const createTravel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      destination,
      budget,
      itinerary,
      notes,
      isPublic,
    } = req.body;

    // バリデーション
    const validationErrors = validateTravelPlan(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "バリデーションエラー",
        errors: validationErrors,
      });
    }

    // DBに保存
    const newTravelPlan = await TravelPlan.create({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      destination,
      budget,
      itinerary: itinerary || [],
      notes: notes || "",
      isPublic: isPublic || false,
    });

    // 作成された旅行プランを関連データと一緒に取得
    const createdTravelPlan = await TravelPlan.findByPk(newTravelPlan.id, {
      include: [
        {
          model: Accommodation,
          as: "accommodations",
          attributes: ["id", "name", "type", "location", "rating"],
        },
        {
          model: Attraction,
          as: "attractions",
          attributes: ["id", "name", "location", "rating"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "旅行プランが正常に作成されました",
      data: createdTravelPlan,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "旅行プランの作成に失敗しました",
      error: error.message,
    });
  }
};

export const updateTravelPlan = async (req: Request, res: Response) => {
  // 旅行プランを更新
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedRowsCount] = await TravelPlan.update(updateData, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "旅行プランが見つかりません",
      });
    }

    return res.json({
      success: true,
      message: "旅行プランが更新されました",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "旅行プランの更新に失敗しました",
      error: error.message,
    });
  }
};

export const deleteTravelPlan = async (req: Request, res: Response) => {
  // 旅行プランを削除
  try {
    const { id } = req.params;

    const deletedRowsCount = await TravelPlan.destroy({
      where: { id },
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "旅行プランが見つかりません",
      });
    }

    return res.json({
      success: true,
      message: "旅行プランが削除されました",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "旅行プランの削除に失敗しました",
      error: error.message,
    });
  }
};
