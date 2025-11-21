'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import VideoAnalyzer from '@/components/VideoAnalyzer';

type CongestionStatus = 'empty' | 'few people' | 'moderate' | 'full';

interface StationFeed {
  stationId: string;
  stationName: string;
  stationNameJa: string;
  lineId: string;
  lineName: string;
  lineNameJa: string;
  carriageNumber: number;
  videoUrl: string;
  status: CongestionStatus;
  capacity: number;
  color: string;
}

// Sample stations with their video feeds
const stationFeeds: StationFeed[] = [
  {
    stationId: 'shibuya',
    stationName: 'Shibuya',
    stationNameJa: '渋谷',
    lineId: 'ginza',
    lineName: 'Ginza Line',
    lineNameJa: '銀座線',
    carriageNumber: 3,
    videoUrl: '/train-videos/3/video_120.mp4',
    status: 'full',
    capacity: 95,
    color: 'bg-orange-500',
  },
  {
    stationId: 'shinjuku',
    stationName: 'Shinjuku',
    stationNameJa: '新宿',
    lineId: 'marunouchi',
    lineName: 'Marunouchi Line',
    lineNameJa: '丸ノ内線',
    carriageNumber: 4,
    videoUrl: '/train-videos/4/video_150.mp4',
    status: 'full',
    capacity: 98,
    color: 'bg-red-500',
  },
  {
    stationId: 'ginza',
    stationName: 'Ginza',
    stationNameJa: '銀座',
    lineId: 'ginza',
    lineName: 'Ginza Line',
    lineNameJa: '銀座線',
    carriageNumber: 2,
    videoUrl: '/train-videos/2/video_100.mp4',
    status: 'moderate',
    capacity: 75,
    color: 'bg-orange-500',
  },
  {
    stationId: 'akihabara',
    stationName: 'Akihabara',
    stationNameJa: '秋葉原',
    lineId: 'hibiya',
    lineName: 'Hibiya Line',
    lineNameJa: '日比谷線',
    carriageNumber: 1,
    videoUrl: '/train-videos/1/video_60.mp4',
    status: 'few people',
    capacity: 55,
    color: 'bg-gray-500',
  },
  {
    stationId: 'ueno',
    stationName: 'Ueno',
    stationNameJa: '上野',
    lineId: 'ginza',
    lineName: 'Ginza Line',
    lineNameJa: '銀座線',
    carriageNumber: 5,
    videoUrl: '/train-videos/5/video_40.mp4',
    status: 'empty',
    capacity: 35,
    color: 'bg-orange-500',
  },
];

const statusConfig = {
  empty: {
    color: 'bg-green-500',
    textColor: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
  },
  'few people': {
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
  },
  moderate: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  full: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
  },
};

export default function LiveFeedPage() {
  const t = useTranslations('liveFeed');
  const [feeds, setFeeds] = useState<StationFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<StationFeed | null>(null);

  // Randomly select 3-4 station feeds on mount
  useEffect(() => {
    const shuffled = [...stationFeeds].sort(() => Math.random() - 0.5);
    const count = 3 + Math.floor(Math.random() * 2); // 3 or 4 feeds
    const selected = shuffled.slice(0, count);
    setFeeds(selected);
    setSelectedFeed(selected[0]);
  }, []);

  const handleAnalysis = (feedId: string, result: { status: CongestionStatus; capacity: number }) => {
    setFeeds(prev =>
      prev.map(feed =>
        feed.stationId === feedId
          ? { ...feed, status: result.status, capacity: result.capacity }
          : feed
      )
    );
  };

  const getStatusLabel = (status: CongestionStatus) => {
    const statusMap = {
      empty: t('empty'),
      'few people': t('fewPeople'),
      moderate: t('moderate'),
      full: t('full'),
    };
    return statusMap[status];
  };

  if (feeds.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading feeds...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 p-6">
      <LanguageSwitcher />
      <main className="w-full max-w-[1920px] mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-800">
                  {t('title')}
                </h1>
                <p className="text-lg text-slate-600 mt-2">
                  Real-time monitoring from {feeds.length} random stations
                </p>
              </div>
              <Link
                href="/"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Main Feed Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Selected Feed - Large View */}
            {selectedFeed && (
              <div className="xl:col-span-2 bg-white rounded-3xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`${selectedFeed.color} w-3 h-16 rounded-full`} />
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800">
                        {selectedFeed.stationNameJa} ({selectedFeed.stationName})
                      </h2>
                      <p className="text-slate-600">
                        {selectedFeed.lineNameJa} - {t('carriage')} {selectedFeed.carriageNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full font-bold ${statusConfig[selectedFeed.status].badge}`}>
                      {getStatusLabel(selectedFeed.status)}
                    </span>
                    <span className="text-3xl font-black text-slate-800">
                      {selectedFeed.capacity}%
                    </span>
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      {t('live')}
                    </div>
                  </div>
                </div>
                <VideoAnalyzer
                  onAnalysis={(result) => handleAnalysis(selectedFeed.stationId, result)}
                  videoUrl={selectedFeed.videoUrl}
                  intervalMs={5000}
                  autoStart={true}
                />
              </div>
            )}

            {/* Other Feeds - Grid View */}
            {feeds.map((feed) => {
              if (selectedFeed && feed.stationId === selectedFeed.stationId) return null;

              return (
                <div
                  key={feed.stationId}
                  onClick={() => setSelectedFeed(feed)}
                  className="bg-white rounded-3xl shadow-2xl p-6 cursor-pointer hover:shadow-3xl transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`${feed.color} w-2 h-12 rounded-full`} />
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          {feed.stationNameJa}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {feed.lineNameJa} - {t('carriage')} {feed.carriageNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusConfig[feed.status].badge}`}>
                        {getStatusLabel(feed.status)}
                      </span>
                      <span className="text-2xl font-black text-slate-800">
                        {feed.capacity}%
                      </span>
                    </div>
                  </div>
                  <VideoAnalyzer
                    onAnalysis={(result) => handleAnalysis(feed.stationId, result)}
                    videoUrl={feed.videoUrl}
                    intervalMs={5000}
                    autoStart={true}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
