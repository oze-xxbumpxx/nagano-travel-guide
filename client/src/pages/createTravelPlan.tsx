import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateTravelPlan: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    destination: "",
    budget: {
      total: 0,
      currency: "JPY",
      breakdown: {
        accommodation: 0,
        transportation: 0,
        food: 0,
        activities: 0,
        other: 0,
      },
    },
    itinerary: [],
    notes: "",
    isPublic: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith("budget")) {
      const budgetField = name.split(".")[1];
      if (budgetField === "breakdown") {
        const breakdownField = name.split(".")[2];
        setFormData((prev) => ({
          ...prev,
          budget: {
            ...prev.budget,
            breakdown: {
              ...prev.budget.breakdown,
              [breakdownField]: parseFloat(value) || 0,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          budget: {
            ...prev.budget,
            [budgetField]:
              budgetField === "total" ? parseFloat(value) || 0 : value,
          },
        }));
      }
    } else if (name === "isPublic") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) || 0 : value,
      }));
    }
  };
};
