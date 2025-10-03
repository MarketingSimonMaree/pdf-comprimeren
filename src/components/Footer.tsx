import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-8 px-4 mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center border-t-2 border-blue-200 dark:border-blue-600 pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-gray-600 dark:text-gray-300">
              Powered by{' '}
              <a
                href="https://github.com/Stirling-Tools/Stirling-PDF"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                Stirling-PDF
              </a>{' '}
              - Open Source
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
            <span>Gemaakt met</span>
            <Heart className="w-4 h-4 text-green-500 fill-green-500" />
            <span>voor gratis PDF compressie</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            © 2025 PDF Comprimeren - Gratis PDF verkleinen in je browser
          </p>
        </div>
      </div>
    </footer>
  );
}
