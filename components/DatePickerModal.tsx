'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  onSelectDate: (date: Date) => void
  minDate: Date
  maxDate: Date
}

export default function DatePickerModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onSelectDate,
  minDate,
  maxDate
}: DatePickerModalProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate))

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const handlePrevMonth = () => {
    const newDate = new Date(viewDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setViewDate(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(viewDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setViewDate(newDate)
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    if (newDate >= minDate && newDate <= maxDate) {
      onSelectDate(newDate)
      onClose()
    }
  }

  const renderDays = () => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const totalDays = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)
    const days = []

    // Empty slots for days of previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />)
    }

    // Days of current month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day)
      const isSelected = date.toDateString() === selectedDate.toDateString()
      const isToday = date.toDateString() === new Date().toDateString()
      const isDisabled = date < minDate || date > maxDate

      days.push(
        <button
          key={day}
          disabled={isDisabled}
          onClick={() => handleDateClick(day)}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all
            ${isSelected ? 'bg-orange-500 text-white font-bold' : ''}
            ${!isSelected && isToday ? 'text-orange-500 font-bold border border-orange-200' : ''}
            ${!isSelected && !isToday && !isDisabled ? 'hover:bg-orange-50 text-gray-700' : ''}
            ${isDisabled ? 'text-gray-200 cursor-not-allowed' : ''}
          `}
        >
          {day}
        </button>
      )
    }

    return days
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-[320px] bg-white rounded-3xl overflow-hidden shadow-2xl p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Select Date</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-full">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-bold text-gray-800">
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-full">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-10 w-10 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                {day}
              </div>
            ))}
            {renderDays()}
          </div>

          <button 
            onClick={() => {
              onSelectDate(new Date())
              onClose()
            }}
            className="w-full mt-4 py-2 text-sm font-bold text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
          >
            Go to Today
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
