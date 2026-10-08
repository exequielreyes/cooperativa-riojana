import React from "react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FloatingInput({ label, id, className = "", ...props }: FloatingInputProps) {
  const inputId = id || props.name;
  
  return (
    <div className="relative">
      <input
        id={inputId}
        {...props}
        className={`input peer !pt-6 !pb-2 placeholder:!text-transparent ${className}`}
        placeholder={label}
      />
      <label
        htmlFor={inputId}
        className="pointer-events-none absolute left-3.5 top-2 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs"
      >
        {label}
      </label>
    </div>
  );
}
