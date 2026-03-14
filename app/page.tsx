'use client'

import React, { useState, useRef } from 'react'
import { Calendar, Map, Info, ChevronLeft, ChevronRight, CheckCircle2, LogIn, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import ReservationTable from '@/components/ReservationTable'
import CourtLayout from '@/components/CourtLayout'
import ReservationConditions from '@/components/ReservationConditions'
import DatePickerModal from '@/components/DatePickerModal'

type Tab = 'table' | 'layout' | 'conditions'

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>('table')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 2)
  maxDate.setHours(23, 59, 59, 999)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    
    // Clamp date within range
    if (newDate < today) {
      setSelectedDate(today)
    } else if (newDate > maxDate) {
      setSelectedDate(maxDate)
    } else {
      setSelectedDate(newDate)
    }
  }

  const isToday = selectedDate.getTime() <= today.getTime()
  const isMaxDate = selectedDate.getTime() >= maxDate.getTime()

  return (
    <main>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white border-bottom border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">CourtFlow</h1>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase hidden sm:inline">{user.displayName?.split(' ')[0]}</span>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors text-xs font-bold"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
          <a 
            href="https://courtflow.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-gray-400 uppercase hover:text-gray-600 transition-colors"
          >
            Staff
          </a>
        </div>
      </header>

      {/* Date Picker (Only for Table Tab) */}
      {activeTab === 'table' && (
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <button 
            onClick={() => changeDate(-1)}
            disabled={isToday}
            className={`p-1 rounded-full transition-colors ${isToday ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
          >
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-sm">
              {mounted ? formatDate(selectedDate) : 'Loading...'}
            </span>
          </button>

          <button 
            onClick={() => changeDate(1)}
            disabled={isMaxDate}
            className={`p-1 rounded-full transition-colors ${isMaxDate ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'table' && <ReservationTable selectedDate={selectedDate} />}
            {activeTab === 'layout' && <CourtLayout />}
            {activeTab === 'conditions' && <ReservationConditions />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Date Picker Modal */}
      <DatePickerModal 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        minDate={today}
        maxDate={maxDate}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around py-2 px-4 z-20">
        <button
          onClick={() => setActiveTab('table')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            activeTab === 'table' ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Table</span>
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            activeTab === 'layout' ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <Map className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Layout</span>
        </button>
        <button
          onClick={() => setActiveTab('conditions')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            activeTab === 'conditions' ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          <Info className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Rules</span>
        </button>
      </nav>
      </div>
    </main>
  )
}
