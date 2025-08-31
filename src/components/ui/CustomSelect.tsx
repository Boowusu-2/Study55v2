import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  onOpenChange,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);

  // Notify parent when dropdown state changes
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen]); // Remove onOpenChange from dependencies to prevent infinite loop

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
          setHighlightedIndex(-1);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-left text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-purple-400/50"
        }`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="select-label"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span
              className={`block truncate ${
                selectedOption ? "text-white" : "text-slate-400"
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.description && (
              <span className="block text-xs text-slate-300 truncate">
                {selectedOption.description}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-2 bg-slate-800 border border-white/30 rounded-xl shadow-2xl max-h-60 overflow-auto">
          <ul role="listbox" className="py-2" aria-label="Select an option">
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                  option.value === value
                    ? "bg-purple-500/20 text-white"
                    : highlightedIndex === index
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setHighlightedIndex(-1);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="block truncate font-medium">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="block text-xs text-slate-300 truncate mt-1">
                        {option.description}
                      </span>
                    )}
                  </div>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-purple-400 ml-2 flex-shrink-0" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
