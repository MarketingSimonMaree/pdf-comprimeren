import { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileDown, Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';

type CompressionLevel = 'basic' | 'strong';

interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  fileName: string;
}

export default function PDFCompressor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('basic');
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCompressing && loaderRef.current) {
      gsap.fromTo(
        loaderRef.current,
        { rotation: 0 },
        { rotation: 360, duration: 1, repeat: -1, ease: 'linear' }
      );
    }
  }, [isCompressing]);

  useEffect(() => {
    if (result && successRef.current) {
      gsap.from(successRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
      });
    }
  }, [result]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    if (file.type !== 'application/pdf') {
      setError('Selecteer een geldig PDF-bestand');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Bestand is te groot (max 5MB)');
      return;
    }

    setSelectedFile(file);

    if (uploadAreaRef.current) {
      gsap.from(uploadAreaRef.current, {
        scale: 0.95,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });
    }
  };

  const compressPDF = async () => {
    if (!selectedFile) return;

    setIsCompressing(true);
    setError(null);
    setResult(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = localStorage.getItem('pdf-compressor-usage');

      let dailyUsage = 0;
      if (stored) {
        const usageData = JSON.parse(stored);
        dailyUsage = usageData.date === today ? usageData.count : 0;
      }

      if (dailyUsage >= 5) {
        setError('Je hebt je dagelijkse limiet van 5 gratis compressies bereikt. Om de dienst gratis te houden, kun je maximaal 5 PDF\'s per dag comprimeren. Kom morgen terug voor 5 nieuwe gratis compressies!');
        return;
      }

      const newCount = dailyUsage + 1;
      localStorage.setItem('pdf-compressor-usage', JSON.stringify({
        count: newCount,
        date: today
      }));

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('compressionLevel', compressionLevel === 'strong' ? '0' : '2');

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compress-pdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const blob = await response.blob();

      if (blob.size >= selectedFile.size) {
        setError('Deze PDF kan niet verder worden gecomprimeerd. Het bestand is al optimaal verkleind.');
        return;
      }

      setResult({
        blob,
        originalSize: selectedFile.size,
        compressedSize: blob.size,
        fileName: selectedFile.name.replace('.pdf', '_gecomprimeerd.pdf'),
      });
    } catch (err) {
      setError('Er is een fout opgetreden bij het comprimeren van de PDF. Controleer je internetverbinding.');
      console.error(err);
    } finally {
      setIsCompressing(false);
      window.dispatchEvent(new Event('compressionComplete'));
    }
  };

  const downloadCompressedPDF = () => {
    if (!result) return;

    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetCompressor = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const compressAgain = () => {
    setResult(null);
    setError(null);
  };

  const compressionPercentage = result
    ? Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100)
    : 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!result ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-4 border-blue-400 dark:border-blue-600">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
              <FileDown className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Upload je PDF</h2>
            <p className="text-gray-600 dark:text-gray-300">Kies een compressie niveau en comprimeer je PDF!</p>
          </div>

          <div
            ref={uploadAreaRef}
            className="border-4 border-dashed border-blue-300 dark:border-blue-600 rounded-xl p-12 text-center mb-6 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-600 hover:border-green-400 dark:hover:border-green-600 transition-colors duration-300"
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500 dark:text-blue-400" />
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Klik om een PDF te selecteren
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">of sleep het bestand hierheen</p>
            </label>

            {selectedFile && (
              <div className="mt-6 p-4 bg-white dark:bg-gray-700 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                <p className="font-semibold text-gray-800 dark:text-white">{selectedFile.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{formatFileSize(selectedFile.size)}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
              Compressie niveau:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCompressionLevel('basic')}
                className={`p-4 rounded-xl border-3 font-semibold transition-all duration-200 ${
                  compressionLevel === 'basic'
                    ? 'bg-blue-500 text-white border-blue-700 shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-blue-300'
                }`}
              >
                <span className="block text-lg">Basic</span>
                <span className="block text-xs mt-1 opacity-90">Hoge kwaliteit</span>
              </button>
              <button
                onClick={() => setCompressionLevel('strong')}
                className={`p-4 rounded-xl border-3 font-semibold transition-all duration-200 ${
                  compressionLevel === 'strong'
                    ? 'bg-green-500 text-white border-green-700 shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-green-300'
                }`}
              >
                <span className="block text-lg">Strong</span>
                <span className="block text-xs mt-1 opacity-90">Maximale compressie</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
            </div>
          )}

          <button
            onClick={compressPDF}
            disabled={!selectedFile || isCompressing}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {isCompressing ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 ref={loaderRef} className="w-6 h-6" />
                Comprimeren...
              </span>
            ) : (
              'PDF Comprimeren'
            )}
          </button>
        </div>
      ) : (
        <div
          ref={successRef}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-4 border-green-400 dark:border-green-600"
        >
          <div className="text-center mb-6">
            <CheckCircle2 className="w-20 h-20 mx-auto text-green-500 dark:text-green-400 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Succesvol gecomprimeerd!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">Je PDF is gecomprimeerd en klaar om te downloaden</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-6 border-2 border-green-300 dark:border-green-600">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Originele grootte</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatFileSize(result.originalSize)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Nieuwe grootte</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatFileSize(result.compressedSize)}
                </p>
              </div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-green-300 dark:border-green-600">
              <p className="text-sm text-gray-600 dark:text-gray-300">Besparing</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{compressionPercentage}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={downloadCompressedPDF}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Download className="w-6 h-6" />
              Download PDF
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={compressAgain}
                className="py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Opnieuw
              </button>
              <button
                onClick={resetCompressor}
                className="py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
              >
                Andere PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
