import { Shield, Zap, Globe, Heart } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: '100% Veilig & Privé',
    description: 'Je PDF wordt veilig verwerkt via een open-source tool. Bestanden worden direct na compressie verwijderd.',
  },
  {
    icon: Zap,
    title: 'Razendsnel',
    description: 'Comprimeer je PDF in enkele seconden zonder wachttijd.',
  },
  {
    icon: Globe,
    title: 'Altijd Gratis',
    description: 'Geen kosten, geen abonnementen. 5 gratis compressies per dag.',
  },
  {
    icon: Heart,
    title: 'Gemakkelijk',
    description: 'Upload, kies je niveau, en download. Zo simpel is het.',
  },
];

export default function Features() {
  return (
    <section className="w-full max-w-6xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-blue-200 dark:border-blue-600 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105"
            >
              <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl mb-4">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
