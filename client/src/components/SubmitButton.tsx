import React from "react";

interface SubmitButtonProps {
  loading: boolean;
  loadingText?: string;
  submitText?: string;
  icon?: string;
  onCancel?: () => void;
  cancelText?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  loadingText = "処理中...",
  submitText = "送信",
  icon = "🚀",
  onCancel,
  cancelText = "キャンセル",
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border-2 border-gray-100">
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 md:py-4 border-2 border-gray-300 rounded-2xl text-sm md:text-base font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
            disabled={loading}
          >
            {cancelText}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="group px-8 py-3 md:py-4 rounded-2xl text-sm md:text-base font-black text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {loadingText}
            </>
          ) : (
            <>
              <span className="text-xl">{icon}</span>
              {submitText}
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubmitButton;
