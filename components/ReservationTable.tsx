'use client'

import React, { useState, useEffect } from 'react'
import { collection, onSnapshot, query, where, getDocFromServer, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { handleFirestoreError, OperationType } from '@/lib/firestore-utils'
import BookingModal from './BookingModal'

interface ReservationTableProps {
  selectedDate: Date
}

interface Reservation {
  id: string
  courtId: string
  customerName: string
  startTime: string
  endTime: string
  status?: string
}

const COURTS = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6', 'Court 7', 'Court 8']
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', 
  '20:00', '21:00', '22:00'
]

export default function ReservationTable({ selectedDate }: ReservationTableProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ court: string, time: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    
    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    // Setup real-time listener for the selected date
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const q = query(
      collection(db, 'reservations'),
      where('startTime', '>=', startOfDay.toISOString()),
      where('startTime', '<=', endOfDay.toISOString())
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[]
      setReservations(resData)
      setLoading(false)
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reservations');
    })

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [selectedDate])

  const isOccupied = (court: string, time: string) => {
    const courtIdx = COURTS.indexOf(court).toString()
    const [h, m] = time.split(':').map(Number)
    
    return reservations.find(res => {
      const resStart = new Date(res.startTime)
      const resEnd = new Date(res.endTime)
      const slotTime = new Date(selectedDate)
      slotTime.setHours(h, m, 0, 0)
      
      return res.courtId === courtIdx && slotTime >= resStart && slotTime < resEnd
    })
  }

  const isPast = (time: string) => {
    if (!mounted) return false // Default to not past during SSR to match server render
    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const compareDate = new Date(selectedDate)
    compareDate.setHours(0, 0, 0, 0)

    if (compareDate < today) return true
    if (compareDate > today) return false

    // If today, check time
    const [h, m] = time.split(':').map(Number)
    const slotTime = new Date()
    slotTime.setHours(h, m, 0, 0)
    
    return slotTime < now
  }

  const handleSlotClick = (court: string, time: string) => {
    if (isOccupied(court, time) || isPast(time)) return
    setSelectedSlot({ court, time })
    setIsModalOpen(true)
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 p-2 border-b border-r border-gray-200 font-bold text-gray-600 min-w-[80px]">
                Court/Time
              </th>
              {TIME_SLOTS.map(time => (
                <th key={time} className="p-2 border-b border-gray-200 bg-gray-50 font-bold text-gray-600 min-w-[100px]">
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COURTS.map(court => (
              <tr key={court}>
                <td className="sticky left-0 z-10 bg-orange-50 p-2 border-b border-r border-gray-200 font-bold text-orange-700">
                  {court}
                </td>
                {TIME_SLOTS.map(time => {
                  const occupied = isOccupied(court, time)
                  const past = isPast(time)
                  
                  let cellClass = "p-2 border-b border-gray-200 text-center transition-colors h-12 "
                  let label = "Available"

                  if (loading) {
                    cellClass += "bg-gray-50 animate-pulse"
                    label = "..."
                  } else if (past) {
                    cellClass += "bg-gray-100 text-gray-400 cursor-not-allowed"
                    label = "Passed"
                  } else if (occupied) {
                    cellClass += "bg-orange-500 text-white font-medium cursor-not-allowed"
                    label = occupied.customerName || "Reserved"
                  } else {
                    cellClass += "bg-white text-gray-600 hover:bg-orange-50 cursor-pointer"
                    label = "Book"
                  }

                  return (
                    <td 
                      key={`${court}-${time}`}
                      onClick={() => handleSlotClick(court, time)}
                      className={cellClass}
                    >
                      {label}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
          <span>Available for booking</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>Occupied / Reserved</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>Time Passed</span>
        </div>
      </div>

      {selectedSlot && (
        <BookingModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          court={selectedSlot.court}
          time={selectedSlot.time}
          date={selectedDate}
        />
      )}
    </div>
  )
}
