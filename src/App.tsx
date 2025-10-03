import Header from './components/Header';
import PDFCompressor from './components/PDFCompressor';
import UsageTracker from './components/UsageTracker';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import DarkModeToggle from './components/DarkModeToggle';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <DarkModeToggle />
      <Header />

      <main className="py-8 px-4">
        <UsageTracker />
        <PDFCompressor />

        <Features />

        <FAQ />
      </main>

      <Footer />
    </div>
  );
}

export default App;
