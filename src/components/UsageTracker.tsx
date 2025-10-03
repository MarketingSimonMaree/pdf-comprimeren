import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface UsageData {
  dailyUsage: number;
}

interface StoredUsage {
  count: number;
  date: string;
}

export default function UsageTracker() {
  const [usage, setUsage] = useState<UsageData>({ dailyUsage: 0 });

  useEffect(() => {
    fetchUsage();

    const handleCompressionComplete = () => {
      fetchUsage();
    };

    window.addEventListener('compressionComplete', handleCompressionComplete);
    return () => window.removeEventListener('compressionComplete', handleCompressionComplete);
  }, []);

  const fetchUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('pdf-compressor-usage');

    if (stored) {
      const usageData: StoredUsage = JSON.parse(stored);
      const dailyUsage = usageData.date === today ? usageData.count : 0;
      setUsage({ dailyUsage });
    } else {
      setUsage({ dailyUsage: 0 });
    }
  };

  const remainingFree = Math.max(0, 5 - usage.dailyUsage);

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-cyan-200 dark:border-cyan-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-cyan-500" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Je gebruik vandaag</h3>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Gratis compressies vandaag:</span>
            <span className="font-bold text-gray-800 dark:text-white">
              {usage.dailyUsage} / 5
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-cyan-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(usage.dailyUsage / 5) * 100}%` }}
            />
          </div>

          {remainingFree === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-3">
                Je hebt je dagelijkse limiet bereikt!
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Om de dienst 100% gratis te houden, kun je maximaal 5 PDF's per dag comprimeren. Kom morgen om middernacht terug voor 5 nieuwe gratis compressies!
              </p>
            </div>
          )}

          {remainingFree > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Nog {remainingFree} gratis {remainingFree === 1 ? 'compressie' : 'compressies'} vandaag beschikbaar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
