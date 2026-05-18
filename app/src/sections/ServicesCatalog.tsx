import { Sparkles } from 'lucide-react';

interface ServiceItem {
  name: string;
  price: number;
}

interface ServicesCatalogProps {
  categories: Record<string, ServiceItem[]>;
}

export function ServicesCatalog({ categories }: ServicesCatalogProps) {
  return (
    <div className="fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Our Services & Pricing
        </h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Professional treatments by certified students at affordable prices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(categories).map(([category, items]) => (
          <div
            key={category}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                {category}
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((service, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm py-3 px-6 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{service.name}</span>
                  <span className="font-bold text-purple-600 tabular-nums">
                    ${service.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
