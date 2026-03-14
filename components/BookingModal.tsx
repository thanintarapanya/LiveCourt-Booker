'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Calendar, Clock, MapPin, Loader2, CheckCircle } from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { handleFirestoreError, OperationType } from '@/lib/firestore-utils'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  court: string
  time: string
  date: Date
}

export default function BookingModal({ isOpen, onClose, court, time, date }: BookingModalProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [hours, setHours] = useState(1)
  const [bookingId] = useState(() => `CF-${Math.floor(Math.random() * 90000) + 10000}`)
  const [error, setError] = useState<string | null>(null)

  const PRICE_PER_HOUR = 250
  const totalPrice = hours * PRICE_PER_HOUR

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('loading')
    setError(null)
    
    try {
      // Map "Court 1" -> "0", "Court 2" -> "1", etc.
      const courtId = (parseInt(court.split(' ')[1]) - 1).toString()
      
      // Calculate ISO strings
      const [startH, startM] = time.split(':').map(Number)
      const startDate = new Date(date)
      startDate.setHours(startH, startM, 0, 0)
      
      const endDate = new Date(startDate)
      endDate.setHours(startDate.getHours() + hours)

      const bookingData = {
        courtId,
        customerName: name,
        phone: phone,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        serverCreatedAt: serverTimestamp()
      }

      await addDoc(collection(db, 'reservations'), bookingData)

      setStep('success')
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'reservations');
      } catch (finalErr) {
        console.error('Error saving to Firestore:', finalErr)
        setError(finalErr instanceof Error ? finalErr.message : 'An unexpected error occurred')
        setStep('form')
      }
    }
  }

  const getEndTime = (startTime: string, duration: number) => {
    const [h, m] = startTime.split(':').map(Number)
    const endH = h + duration
    return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {step === 'success' ? 'Booking Confirmed' : 'Confirm Reservation'}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {step === 'form' && (
              <form onSubmit={handleBook} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-gray-700">{court}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-gray-700">
                      {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-gray-700">{time} - {getEndTime(time, hours)} ({hours} hr{hours > 1 ? 's' : ''})</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Phone Number</label>
                      <input 
                        required
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08X-XXX-XXXX"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Hours</label>
                      <select 
                        value={hours}
                        onChange={(e) => setHours(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                      >
                        {[1, 2, 3, 4].map(h => (
                          <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Price</p>
                    <p className="text-2xl font-black text-gray-900">฿{totalPrice.toLocaleString()}</p>
                  </div>
                  <button 
                    type="submit"
                    className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98]"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}

            {step === 'loading' && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-sm font-medium text-gray-600">Processing your reservation...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Your court has been reserved successfully.
                  </p>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                    Booking ID: {bookingId}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
                >
                  Back to Table
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
