import { Request, Response } from "express";
import Accommodation from "../models/Accommodation";
import TravelPlan from "../models/TravelPlan";

// バリデーション関数
const validateAccommodation = (data: any) => {
  const errors: string[] = [];

  if (!data.name || data.name.trim() === "") {
    errors.push("宿泊施設名は必須です");
  }

  if (!data.type || data.type.trim() === "") {
    errors.push("宿泊施設タイプは必須です");
  } else {
    const validTypes = [
      "ホテル",
      "旅館",
      "民宿",
      "ゲストハウス",
      "ペンション",
      "リゾート",
      "その他",
    ];
    if (!validTypes.includes(data.type)) {
      errors.push(
        `宿泊施設タイプは以下のいずれかである必要があります: ${validTypes.join(
          ", "
        )}`
      );
    }
  }

  if (!data.description || data.description.trim() === "") {
    errors.push("説明は必須です");
  }

  // location オブジェクトのバリデーション
  if (!data.location || typeof data.location !== "object") {
    errors.push("場所情報は必須です");
  } else {
    if (!data.location.address || data.location.address.trim() === "") {
      errors.push("住所は必須です");
    }
    if (!data.location.prefecture || data.location.prefecture.trim() === "") {
      errors.push("都道府県は必須です");
    }
    if (!data.location.city || data.location.city.trim() === "") {
      errors.push("市区町村は必須です");
    }
  }

  // contact オブジェクトのバリデーション
  if (!data.contact || typeof data.contact !== "object") {
    errors.push("連絡先情報は必須です");
  } else {
    if (!data.contact.phone || data.contact.phone.trim() === "") {
      errors.push("電話番号は必須です");
    }
  }

  if (!data.travelPlanId || typeof data.travelPlanId !== "number") {
    errors.push("旅行プランIDは必須です");
  }

  if (data.rating && (data.rating < 0 || data.rating > 5)) {
    errors.push("評価は0~5の範囲で入力してください");
  }

  return errors;
};

// 宿泊施設取得
export const getAllAccommodations = async (req: Request, res: Response) => {
  try {
    const accommodations = await Accommodation.findAll({
      include: [
        {
          model: TravelPlan,
          as: "travelPlan",
          attributes: ["id", "title", "destination"],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: accommodations,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "宿泊施設の取得に失敗しました",
      error: error.message,
    });
  }
};

// IDで宿泊施設取得
export const getAccommodationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const accommodation = await Accommodation.findByPk(id, {
      include: [
        {
          model: TravelPlan,
          as: "travelPlan",
          attributes: ["id", "title", "destination", "startDate", "endDate"],
        },
      ],
    });

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: "宿泊施設が見つかりません",
      });
    }

    return res.json({
      success: true,
      data: accommodation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "宿泊施設の取得に失敗しました",
      error: error.message,
    });
  }
};

// 宿泊施設作成
export const createAccommodation = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      type,
      location,
      contact,
      amenities,
      rooms,
      checkIn,
      checkOut,
      policies,
      photos,
      rating,
      reviews,
      isRecommended,
      tags,
      travelPlanId,
    } = req.body;

    // バリデーション
    const validationErrors = validateAccommodation(req.body);
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
        message: "旅行プランが見つかりません",
      });
    }

    // データベースに保存
    const accommodation = await Accommodation.create({
      name,
      description,
      type,
      location,
      contact,
      amenities: amenities || [],
      rooms: rooms || [],
      checkIn,
      checkOut,
      policies,
      photos: photos || [],
      rating: rating || 0,
      reviews: reviews || [],
      isRecommended: isRecommended || false,
      tags: tags || [],
      travelPlanId,
    });

    // 作成された宿泊施設を関連データと一緒に取得
    const createdAccommodation = await Accommodation.findByPk(
      accommodation.id,
      {
        include: [
          {
            model: TravelPlan,
            as: "travelPlan",
            attributes: ["id", "title", "destination"],
          },
        ],
      }
    );

    return res.status(201).json({
      success: true,
      message: "宿泊施設が正常に作成されました",
      data: createdAccommodation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "宿泊施設の作成に失敗しました",
      error: error.message,
    });
  }
};

// 宿泊施設更新
export const updateAccommodation = async (req: Request, res: Response) => {
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

    const [updatedRowsCount] = await Accommodation.update(updateData, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "宿泊施設が見つかりません",
      });
    }

    // 更新された宿泊施設を取得
    const updateAccommodation = await Accommodation.findByPk(id, {
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
      message: "宿泊施設が更新されました",
      data: updateAccommodation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "宿泊施設の更新に失敗しました",
      error: error.message,
    });
  }
};

// 宿泊施設削除
export const deleteAccommodation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedRowsCount = await Accommodation.destroy({
      where: { id },
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "宿泊施設が見つかりません",
      });
    }

    return res.json({
      success: true,
      message: "宿泊施設が削除されました",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "宿泊施設の削除に失敗しました",
      error: error.message,
    });
  }
};
