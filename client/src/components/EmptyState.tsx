import React from "react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "📭",
  title,
  description,
  actionText,
  actionLink,
}) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-6xl md:text-8xl mb-6">{icon}</div>
      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
