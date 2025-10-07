import React from "react";

interface ErrorAlertProps {
  errors: string[];
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4 md:p-6 shadow-lg animate-shake">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white text-xl font-bold">!</span>
        </div>
        <div className="flex-1">
          <h3 className="font-black text-red-800 mb-2 text-lg">
            入力エラーがあります
          </h3>
          <ul className="space-y-1.5">
            {errors.map((error, index) => (
              <li
                key={index}
                className="text-red-700 text-sm flex items-start gap-2 font-medium"
              >
                <span className="text-red-500 font-bold">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
