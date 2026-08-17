'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({ label, error, helper, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
        {...props}
      />
      {helper && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-xs text-neutral-500">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-danger-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Textarea({ label, error, helper, className = '', id, ...props }: TextareaProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={`input min-h-[100px] resize-y ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
        {...props}
      />
      {helper && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-xs text-neutral-500">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-danger-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, helper, options, className = '', id, ...props }: SelectProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={`input ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''} ${className}`}
        aria-invalid={!!error}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helper && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-xs text-neutral-500">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-danger-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}