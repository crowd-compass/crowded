'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type CongestionStatus = 'empty' | 'few people' | 'moderate' | 'full';

interface Station {
  id: string;
  name: string;
  nameJa: string;
  congestion: CongestionStatus;
}

interface MetroLine {
  id: string;
  name: string;
  nameJa: string;
  color: string;
  bgColor: string;
  stations: Station[];
}

// Mock congestion data - randomly assign status for demo
const getRandomCongestion = (): CongestionStatus => {
  const statuses: CongestionStatus[] = ['empty', 'few people', 'moderate', 'full'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const metroLines: MetroLine[] = [
  {
    id: 'ginza',
    name: 'Ginza Line',
    nameJa: '銀座線',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    stations: [
      { id: 'shibuya', name: 'Shibuya', nameJa: '渋谷', congestion: 'full' },
      { id: 'omotesando', name: 'Omotesando', nameJa: '表参道', congestion: 'moderate' },
      { id: 'aoyama-itchome', name: 'Aoyama-itchome', nameJa: '青山一丁目', congestion: 'few people' },
      { id: 'akasaka-mitsuke', name: 'Akasaka-mitsuke', nameJa: '赤坂見附', congestion: 'moderate' },
      { id: 'tameike-sanno', name: 'Tameike-sanno', nameJa: '溜池山王', congestion: 'few people' },
      { id: 'toranomon', name: 'Toranomon', nameJa: '虎ノ門', congestion: 'empty' },
      { id: 'shimbashi', name: 'Shimbashi', nameJa: '新橋', congestion: 'full' },
      { id: 'ginza', name: 'Ginza', nameJa: '銀座', congestion: 'full' },
      { id: 'kyobashi', name: 'Kyobashi', nameJa: '京橋', congestion: 'moderate' },
      { id: 'nihombashi', name: 'Nihombashi', nameJa: '日本橋', congestion: 'moderate' },
      { id: 'mitsukoshimae', name: 'Mitsukoshimae', nameJa: '三越前', congestion: 'few people' },
      { id: 'kanda', name: 'Kanda', nameJa: '神田', congestion: 'moderate' },
      { id: 'suehirocho', name: 'Suehirocho', nameJa: '末広町', congestion: 'few people' },
      { id: 'ueno-hirokoji', name: 'Ueno-hirokoji', nameJa: '上野広小路', congestion: 'moderate' },
      { id: 'ueno', name: 'Ueno', nameJa: '上野', congestion: 'full' },
      { id: 'inaricho', name: 'Inaricho', nameJa: '稲荷町', congestion: 'few people' },
      { id: 'tawaramachi', name: 'Tawaramachi', nameJa: '田原町', congestion: 'empty' },
      { id: 'asakusa', name: 'Asakusa', nameJa: '浅草', congestion: 'full' },
    ],
  },
  {
    id: 'marunouchi',
    name: 'Marunouchi Line',
    nameJa: '丸ノ内線',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    stations: [
      { id: 'ogikubo', name: 'Ogikubo', nameJa: '荻窪', congestion: 'moderate' },
      { id: 'minamiasagaya', name: 'Minamiasagaya', nameJa: '南阿佐ヶ谷', congestion: 'few people' },
      { id: 'shin-koenji', name: 'Shin-koenji', nameJa: '新高円寺', congestion: 'few people' },
      { id: 'higashi-koenji', name: 'Higashi-koenji', nameJa: '東高円寺', congestion: 'empty' },
      { id: 'shin-nakano', name: 'Shin-nakano', nameJa: '新中野', congestion: 'few people' },
      { id: 'nakano-sakaue', name: 'Nakano-sakaue', nameJa: '中野坂上', congestion: 'moderate' },
      { id: 'nishi-shinjuku', name: 'Nishi-shinjuku', nameJa: '西新宿', congestion: 'full' },
      { id: 'shinjuku', name: 'Shinjuku', nameJa: '新宿', congestion: 'full' },
      { id: 'shinjuku-sanchome', name: 'Shinjuku-sanchome', nameJa: '新宿三丁目', congestion: 'full' },
      { id: 'shinjuku-gyoenmae', name: 'Shinjuku-gyoenmae', nameJa: '新宿御苑前', congestion: 'moderate' },
      { id: 'yotsuya-sanchome', name: 'Yotsuya-sanchome', nameJa: '四谷三丁目', congestion: 'few people' },
      { id: 'yotsuya', name: 'Yotsuya', nameJa: '四ツ谷', congestion: 'moderate' },
      { id: 'akasaka-mitsuke', name: 'Akasaka-mitsuke', nameJa: '赤坂見附', congestion: 'full' },
      { id: 'kokkai-gijidomae', name: 'Kokkai-gijidomae', nameJa: '国会議事堂前', congestion: 'moderate' },
      { id: 'kasumigaseki', name: 'Kasumigaseki', nameJa: '霞ヶ関', congestion: 'full' },
      { id: 'ginza', name: 'Ginza', nameJa: '銀座', congestion: 'full' },
      { id: 'tokyo', name: 'Tokyo', nameJa: '東京', congestion: 'full' },
      { id: 'otemachi', name: 'Otemachi', nameJa: '大手町', congestion: 'full' },
      { id: 'awajicho', name: 'Awajicho', nameJa: '淡路町', congestion: 'moderate' },
      { id: 'ochanomizu', name: 'Ochanomizu', nameJa: '御茶ノ水', congestion: 'moderate' },
      { id: 'hongosanchome', name: 'Hongo-sanchome', nameJa: '本郷三丁目', congestion: 'few people' },
      { id: 'korakuen', name: 'Korakuen', nameJa: '後楽園', congestion: 'moderate' },
      { id: 'myogadani', name: 'Myogadani', nameJa: '茗荷谷', congestion: 'few people' },
      { id: 'shin-otsuka', name: 'Shin-otsuka', nameJa: '新大塚', congestion: 'few people' },
      { id: 'ikebukuro', name: 'Ikebukuro', nameJa: '池袋', congestion: 'full' },
    ],
  },
  {
    id: 'hibiya',
    name: 'Hibiya Line',
    nameJa: '日比谷線',
    color: 'text-gray-600',
    bgColor: 'bg-gray-500',
    stations: [
      { id: 'naka-meguro', name: 'Naka-meguro', nameJa: '中目黒', congestion: 'moderate' },
      { id: 'ebisu', name: 'Ebisu', nameJa: '恵比寿', congestion: 'full' },
      { id: 'hiroo', name: 'Hiroo', nameJa: '広尾', congestion: 'few people' },
      { id: 'roppongi', name: 'Roppongi', nameJa: '六本木', congestion: 'full' },
      { id: 'kamiyacho', name: 'Kamiyacho', nameJa: '神谷町', congestion: 'moderate' },
      { id: 'kasumigaseki', name: 'Kasumigaseki', nameJa: '霞ヶ関', congestion: 'full' },
      { id: 'hibiya', name: 'Hibiya', nameJa: '日比谷', congestion: 'full' },
      { id: 'ginza', name: 'Ginza', nameJa: '銀座', congestion: 'full' },
      { id: 'higashi-ginza', name: 'Higashi-ginza', nameJa: '東銀座', congestion: 'moderate' },
      { id: 'tsukiji', name: 'Tsukiji', nameJa: '築地', congestion: 'few people' },
      { id: 'hatchobori', name: 'Hatchobori', nameJa: '八丁堀', congestion: 'moderate' },
      { id: 'kayabacho', name: 'Kayabacho', nameJa: '茅場町', congestion: 'moderate' },
      { id: 'ningyocho', name: 'Ningyocho', nameJa: '人形町', congestion: 'few people' },
      { id: 'kodenmacho', name: 'Kodenmacho', nameJa: '小伝馬町', congestion: 'few people' },
      { id: 'akihabara', name: 'Akihabara', nameJa: '秋葉原', congestion: 'full' },
      { id: 'iriya', name: 'Iriya', nameJa: '入谷', congestion: 'few people' },
      { id: 'ueno', name: 'Ueno', nameJa: '上野', congestion: 'full' },
      { id: 'naka-okachimachi', name: 'Naka-okachimachi', nameJa: '仲御徒町', congestion: 'moderate' },
      { id: 'kita-senju', name: 'Kita-senju', nameJa: '北千住', congestion: 'full' },
    ],
  },
];

const congestionColors = {
  empty: 'bg-green-500',
  'few people': 'bg-blue-500',
  moderate: 'bg-yellow-500',
  full: 'bg-red-500',
};

// Light indicator colors for flicking effect
const lightColors = {
  empty: {
    bg: 'bg-green-400',
    glow: 'shadow-green-400',
  },
  'few people': {
    bg: 'bg-blue-400',
    glow: 'shadow-blue-400',
  },
  moderate: {
    bg: 'bg-yellow-400',
    glow: 'shadow-yellow-400',
  },
  full: {
    bg: 'bg-red-400',
    glow: 'shadow-red-400',
  },
};

export default function MetroLinesPage() {
  const t = useTranslations('lines');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <LanguageSwitcher />
      <main className="w-full max-w-[1920px] mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-slate-800">
              {t('title')}
            </h1>
            <p className="text-lg text-slate-600">
              {t('subtitle')}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 py-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm text-slate-700">{t('empty')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span className="text-sm text-slate-700">{t('fewPeople')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span className="text-sm text-slate-700">{t('moderate')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-sm text-slate-700">{t('full')}</span>
            </div>
          </div>

          {/* Metro Lines List */}
          <div className="space-y-6">
            {metroLines.map((line) => (
              <div
                key={line.id}
                className="border-2 border-slate-200 rounded-2xl p-6 bg-slate-50 hover:shadow-lg transition-shadow"
              >
                {/* Line Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${line.bgColor} w-3 h-12 rounded-full`} />
                  <div>
                    <h2 className={`text-2xl font-bold ${line.color}`}>
                      {line.nameJa}
                    </h2>
                    <p className="text-sm text-slate-600">{line.name}</p>
                  </div>
                </div>

                {/* Stations Row */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {line.stations.map((station) => (
                    <Link
                      key={station.id}
                      href={`/status?station=${encodeURIComponent(station.nameJa)}&stationEn=${encodeURIComponent(station.name)}`}
                      className="flex-shrink-0 group"
                    >
                      <div className="w-24 text-center">
                        {/* Congestion Status Indicator */}
                        <div
                          className={`
                            ${congestionColors[station.congestion]}
                            h-3 rounded-t-lg
                            group-hover:opacity-80 transition-opacity
                          `}
                        />
                        {/* Station Box */}
                        <div
                          className="
                            bg-white border-2 border-slate-300
                            group-hover:border-slate-400
                            rounded-b-lg p-2
                            transition-all duration-200
                            group-hover:shadow-md
                            group-hover:scale-105
                            relative
                          "
                        >
                          {/* Flicking Light Indicator */}
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <div
                              className={`
                                ${lightColors[station.congestion].bg}
                                w-2 h-2 rounded-full
                                animate-pulse
                                shadow-lg
                              `}
                              style={{
                                boxShadow: `0 0 8px ${
                                  station.congestion === 'empty' ? '#4ade80' :
                                  station.congestion === 'few people' ? '#60a5fa' :
                                  station.congestion === 'moderate' ? '#fbbf24' :
                                  '#f87171'
                                }`
                              }}
                            />
                          </div>
                          <div className="text-xs font-bold text-slate-800 truncate pr-3">
                            {station.nameJa}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {station.name}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
