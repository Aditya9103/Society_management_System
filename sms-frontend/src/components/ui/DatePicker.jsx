import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, Clock } from 'lucide-react';
import { cn } from './Button';

export default function DatePicker({ selected, onChange, label, error, className, minDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState('date'); // 'date' | 'time'
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const timeInputRef = useRef(null);
  const [alignment, setAlignment] = useState('left-0');

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // If the input is on the right half of the screen, anchor to the right to prevent overflow
      if (rect.left > window.innerWidth / 2) {
        setAlignment('right-0');
      } else {
        setAlignment('left-0');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close if click is outside both the trigger container and the dropdown portal
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDateChange = (date) => {
    if (!selected) {
      // If no time is set, default to 12:00 PM for better UX
      date.setHours(12, 0, 0, 0);
      onChange(date);
    } else {
      const newDate = new Date(selected);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      onChange(newDate);
    }
  };

  const handleTimeChange = (e) => {
    const timeStr = e.target.value; // "HH:MM"
    if (!timeStr) return;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = selected ? new Date(selected) : new Date();
    newDate.setHours(hours, minutes, 0, 0);
    onChange(newDate);
  };

  const timeValue = selected ? 
    `${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}` : '';

  const dropdownContent = (
    <div 
      ref={dropdownRef}
      className={cn(
        "absolute z-[100] mt-2 w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl",
        alignment
      )}
    >
      <div className="flex mb-4 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab('date')}
          className={cn("flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors", tab === 'date' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900")}
        >
          <Calendar className="h-4 w-4" />
          Date
        </button>
        <button
          type="button"
          onClick={() => setTab('time')}
          className={cn("flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors", tab === 'time' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900")}
        >
          <Clock className="h-4 w-4" />
          Time
        </button>
      </div>

      {tab === 'date' && (
        <div className="flex justify-center pb-2">
          <ReactDatePicker
            selected={selected}
            onChange={handleDateChange}
            inline
            minDate={minDate}
          />
        </div>
      )}

      {tab === 'time' && (
        <div className="py-6 px-4">
          <label className="block text-sm font-medium text-slate-700 mb-4 text-center">Set Exact Time</label>
          <input
            ref={timeInputRef}
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            onClick={() => {
              try {
                timeInputRef.current?.showPicker();
              } catch (e) {
                // Ignore if showPicker is not supported in the browser
              }
            }}
            className="w-full cursor-pointer text-center text-3xl font-semibold text-slate-800 border-2 border-slate-200 rounded-xl py-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full relative" ref={containerRef}>
       {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
       <button
         type="button"
         onClick={() => setIsOpen(!isOpen)}
         className={cn(
           "flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all",
           error && "border-red-500 focus:ring-red-500",
           className
         )}
       >
         <span className={selected ? 'text-slate-900 font-medium' : 'text-slate-400'}>
           {selected ? selected.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Select Date & Time'}
         </span>
         <Calendar className="h-5 w-5 text-indigo-500" />
       </button>
       {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

       {isOpen && dropdownContent}
    </div>
  );
}
