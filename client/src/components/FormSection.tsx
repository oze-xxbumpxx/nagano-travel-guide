import React from "react";

interface FormSectionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  colorFrom?: string;
  colorTo?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  icon,
  title,
  children,
  colorFrom = "purple-500",
  colorTo = "pink-500",
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-10 h-10 bg-gradient-to-br from-${colorFrom} to-${colorTo} rounded-xl flex items-center justify-center shadow-md`}
        >
          <span className="text-xl">{icon}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900">
          {title}
        </h2>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default FormSection;
