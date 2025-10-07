import React from "react";

interface FormSelectProps {
  label: string;
  icon?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  children: React.ReactNode;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  icon,
  name,
  value,
  onChange,
  required = false,
  children,
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base font-medium"
      >
        {children}
      </select>
    </div>
  );
};

export default FormSelect;
