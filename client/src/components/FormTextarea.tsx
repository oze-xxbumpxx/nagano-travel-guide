import React from "react";

interface FormTextareaProps {
  label: string;
  icon?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  icon,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-bold text-gray-700 mb-2"
      >
        {icon && <span className="mr-1">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base resize-none"
      />
    </div>
  );
};

export default FormTextarea;
