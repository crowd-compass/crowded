'use client';

import { useState } from 'react';

type CongestionStatus = 'empty' | 'few people' | 'moderate' | 'full';

interface CarriageData {
  carriageNumber: number;
  status: CongestionStatus;
  capacity: number;
}

const statusConfig = {
  empty: {
    label: 'Empty',
    color: 'bg-green-500',
    textColor: 'text-green-500',
    bgLight: 'bg-green-50',
  },
  'few people': {
    label: 'Few People',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    bgLight: 'bg-blue-50',
  },
  moderate: {
    label: 'Moderate',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgLight: 'bg-yellow-50',
  },
  full: {
    label: 'Full',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    bgLight: 'bg-red-50',
  },
};

export default function CarriageStatusScreen() {
  // Mock data - in production, this would come from your backend
  const [carriageData] = useState<CarriageData>({
    carriageNumber: 4,
    status: 'moderate',
    capacity: 85,
  });

  const config = statusConfig[carriageData.status];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="w-full max-w-4xl">
        {/* Main Status Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold text-slate-800">
              Carriage Status
            </h1>
            <p className="text-xl text-slate-500">Real-time congestion monitoring</p>
          </div>

          {/* Carriage Number */}
          <div className="text-center py-8">
            <div className="inline-block">
              <div className="text-slate-600 text-2xl font-medium mb-2">
                Carriage
              </div>
              <div className="text-9xl font-bold text-slate-800 leading-none">
                {carriageData.carriageNumber}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <div
              className={`${config.bgLight} ${config.textColor} px-12 py-6 rounded-2xl border-4 ${config.color.replace('bg-', 'border-')}`}
            >
              <div className="text-center">
                <div className="text-sm font-semibold uppercase tracking-wider mb-1">
                  Status
                </div>
                <div className="text-4xl font-bold">{config.label}</div>
              </div>
            </div>
          </div>

          {/* Capacity Percentage */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-slate-600 mb-2">
                Current Capacity
              </div>
              <div className={`text-7xl font-bold ${config.textColor}`}>
                {carriageData.capacity}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-8 overflow-hidden">
              <div
                className={`h-full ${config.color} transition-all duration-500 rounded-full flex items-center justify-end pr-4`}
                style={{ width: `${Math.min(carriageData.capacity, 100)}%` }}
              >
                {carriageData.capacity > 15 && (
                  <span className="text-white font-semibold text-sm">
                    {carriageData.capacity}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-slate-500 text-lg pt-4">
            <p>Next train arriving in 3 minutes</p>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            {Object.entries(statusConfig).map(([key, value]) => (
              <div key={key} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 ${value.color} rounded-lg`} />
                <span className="text-white text-sm font-medium">
                  {value.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
