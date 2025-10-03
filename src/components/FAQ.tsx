import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Hoe werkt PDF comprimeren?',
    answer: 'Je uploadt een PDF, kiest een compressie niveau (Basic of Strong), en onze tool comprimeert de PDF via een veilige Vercel proxy die gebruik maakt van Stirling-PDF, een gratis open-source tool. Let op: deze tool werkt best bij PDFs met veel afbeeldingen of overtollige data. Sommige PDFs zijn al optimaal gecomprimeerd en kunnen niet verder verkleind worden.',
  },
  {
    question: 'Is PDF comprimeren gratis?',
    answer: 'Ja, PDF comprimeren is 100% gratis! Om de dienst gratis te houden, kun je maximaal 5 PDF-bestanden per dag comprimeren. Deze limiet wordt elke dag om middernacht automatisch gereset. Er zijn geen kosten, abonnementen of verborgen prijzen.',
  },
  {
    question: 'Is mijn PDF veilig bij het comprimeren?',
    answer: 'Ja! We gebruiken een veilige Vercel proxy die je PDF naar Stirling-PDF stuurt voor compressie. Stirling-PDF is een vertrouwde open-source tool. Je bestanden worden alleen tijdelijk verwerkt en direct na compressie verwijderd.',
  },
  {
    question: 'Wat is het verschil tussen Basic en Strong compressie?',
    answer: 'Basic compressie (hoge kwaliteit) gebruikt standaard PDF-structuur optimalisaties en behoudt maximale kwaliteit. Strong compressie (maximale compressie) gebruikt geavanceerde technieken om de bestandsgrootte verder te verkleinen met minimaal kwaliteitsverlies. Beide behouden de volledige inhoud van je PDF.',
  },
  {
    question: 'Wat is de maximale bestandsgrootte?',
    answer: 'Je kunt PDF-bestanden tot 50MB uploaden. Voor de meeste documenten is dit meer dan voldoende. Grotere bestanden kunnen je browser vertragen.',
  },
  {
    question: 'Hoeveel kleiner wordt mijn PDF?',
    answer: 'Dit hangt af van je originele PDF en het gekozen compressieniveau. Gemiddeld kun je 30-60% besparing verwachten. Bestanden met veel afbeeldingen worden vaak meer verkleind dan tekstdocumenten.',
  },
  {
    question: 'Werkt PDF comprimeren op mobiele apparaten?',
    answer: 'Ja! PDF comprimeren werkt op alle moderne browsers, inclusief mobiele apparaten zoals smartphones en tablets. De interface is volledig responsief.',
  },
  {
    question: 'Verlies ik kwaliteit bij het comprimeren?',
    answer: 'Bij Basic compressie (hoge kwaliteit) is het kwaliteitsverlies minimaal en vaak niet merkbaar. Bij Strong compressie (maximale compressie) kan er een lichte kwaliteitsvermindering zijn, vooral bij afbeeldingen, maar tekst blijft altijd goed leesbaar. Voor de meeste documenten is dit verschil verwaarloosbaar.',
  },
  {
    question: 'Hoeveel PDFs kan ik per dag comprimeren?',
    answer: 'Om de dienst 100% gratis te houden, kun je maximaal 5 PDF-bestanden per dag comprimeren. Deze limiet wordt elke dag om middernacht (00:00 uur) automatisch gereset, zodat je weer 5 nieuwe gratis compressies krijgt.',
  },
  {
    question: 'Kan ik meerdere PDFs tegelijk comprimeren?',
    answer: 'Momenteel kun je één PDF per keer comprimeren. Na het downloaden kun je direct een nieuwe PDF uploaden en comprimeren.',
  },
  {
    question: 'Welke browsers worden ondersteund?',
    answer: 'PDF comprimeren werkt op alle moderne browsers zoals Chrome, Firefox, Safari, Edge en Opera. Zorg dat je browser up-to-date is voor de beste ervaring.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Veelgestelde vragen over PDF comprimeren
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Alles wat je moet weten over het comprimeren van PDF-bestanden
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-blue-200 dark:border-blue-600 overflow-hidden transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500"
          >
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-white pr-4">{item.question}</h3>
              {openIndex === index ? (
                <ChevronUp className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              )}
            </button>

            {openIndex === index && (
              <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-600 border-t-2 border-blue-200 dark:border-blue-600">
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-6 bg-gradient-to-r from-blue-100 to-green-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border-2 border-blue-300 dark:border-blue-600">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Meer vragen?</h3>
        <p className="text-gray-700 dark:text-gray-200">
          PDF comprimeren is een gratis, veilige en snelle manier om je PDF-bestanden te verkleinen
          zonder kwaliteitsverlies. Begin nu met het comprimeren van je PDF!
        </p>
      </div>
    </section>
  );
}
