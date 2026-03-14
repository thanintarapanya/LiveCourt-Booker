'use client'

import React from 'react'
import { motion } from 'motion/react'

export default function CourtLayout() {
  const courts = Array.from({ length: 8 }, (_, i) => i + 1)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Court Layout</h2>
        <p className="text-sm text-gray-500">Visual map of our badminton facilities</p>
      </div>

      <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          {/* Left Wing */}
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Zone A</div>
            {courts.slice(0, 4).map(num => (
              <motion.div 
                key={num}
                whileHover={{ scale: 1.02 }}
                className="aspect-[4/3] bg-white rounded-lg border-2 border-orange-200 flex flex-col items-center justify-center shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                <span className="text-lg font-black text-orange-600">C{num}</span>
                <span className="text-[8px] text-gray-400 uppercase font-bold">Premium Court</span>
              </motion.div>
            ))}
          </div>

          {/* Right Wing */}
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Zone B</div>
            {courts.slice(4, 8).map(num => (
              <motion.div 
                key={num}
                whileHover={{ scale: 1.02 }}
                className="aspect-[4/3] bg-white rounded-lg border-2 border-orange-200 flex flex-col items-center justify-center shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                <span className="text-lg font-black text-orange-600">C{num}</span>
                <span className="text-[8px] text-gray-400 uppercase font-bold">Standard Court</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Entrance / Lobby */}
        <div className="mt-8 pt-4 border-t border-gray-300 flex justify-center">
          <div className="px-8 py-2 bg-gray-200 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Entrance & Lobby
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Facilities</div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Shower Rooms</li>
            <li>• Pro Shop</li>
            <li>• Cafe & Drinks</li>
          </ul>
        </div>
        <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Parking</div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 50+ Car Slots</li>
            <li>• Bike Parking</li>
            <li>• EV Charging</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
