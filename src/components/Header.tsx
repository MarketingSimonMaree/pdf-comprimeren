import { FileDown } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full py-6 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg transform rotate-6">
            <FileDown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 leading-tight">
            PDF Comprimeren
          </h1>
        </div>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-200 font-semibold mb-2 px-2">
          Comprimeer je PDF gratis en veilig in je browser
        </p>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
          Comprimeer PDF-bestanden en verklein de bestandsgrootte. Geen uploads naar servers, volledig privé en 100% gratis.
        </p>
      </div>
    </header>
  );
}
