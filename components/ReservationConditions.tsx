'use client'

import React from 'react'
import { ShieldCheck, Clock, Ban, CreditCard, AlertCircle } from 'lucide-react'

export default function ReservationConditions() {
  const sections = [
    {
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      title: "Booking Hours",
      content: "Reservations can be made from 08:00 AM to 10:00 PM daily. Each slot is 1 hour minimum."
    },
    {
      icon: <CreditCard className="w-5 h-5 text-orange-500" />,
      title: "Payment Policy",
      content: "Payment must be completed within 15 minutes of booking. Unpaid reservations will be automatically cancelled."
    },
    {
      icon: <Ban className="w-5 h-5 text-orange-500" />,
      title: "Cancellation",
      content: "Cancellations made 24 hours in advance are eligible for a full refund. Same-day cancellations are non-refundable."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-orange-500" />,
      title: "Court Etiquette",
      content: "Please wear non-marking indoor court shoes. Maximum 6 players per court at any time."
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900">Terms & Conditions</h2>
        <p className="text-sm text-gray-500">Please read carefully before booking</p>
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex-shrink-0 mt-1">
              {section.icon}
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-800 mb-1">{section.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
        <p className="text-[11px] text-orange-800 font-medium">
          By proceeding with a reservation, you agree to comply with all stadium rules and safety guidelines.
        </p>
      </div>

      <div className="pt-4 text-center">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
          Powered by CourtFlow v2.4.0
        </p>
      </div>
    </div>
  )
}
