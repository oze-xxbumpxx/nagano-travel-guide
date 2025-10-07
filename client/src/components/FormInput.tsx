import React from "react";

interface FormInputProps {
  label: string;
  icon?: string;
  type?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  icon,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  step,
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
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base"
      />
    </div>
  );
};

export default FormInput;
