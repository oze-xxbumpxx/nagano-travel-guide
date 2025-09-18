import { Request, Response, NextFunction } from "express";
import TravelPlan from "../models/TravelPlan";
export const createTravel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, startDate, endDate, destination, budget } =
      req.body;

    console.log("📝 受け取ったリクエストデータ:");
    console.log("  title:", title);
    console.log("  description:", description);
    console.log("  startDate:", startDate);
    console.log("  endDate:", endDate);
    console.log("  destination:", destination);
    console.log("  budget:", budget);

    // 仮のレスポンス（動作確認）
    res.status(201).json({
      success: true,
      message: "動作確認用となります。",
      receivedData: {
        title,
        description,
        startDate,
        endDate,
        destination,
        budget,
      },
    });
  } catch (error) {
    next(error);
  }
};
