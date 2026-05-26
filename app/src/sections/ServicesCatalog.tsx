import { Sparkles, Scissors, Droplets, Sparkle } from 'lucide-react';

interface ServiceItem {
  name: string;
  price: number;
}

interface ServicesCatalogProps {
  categories: Record<string, ServiceItem[]>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Nail Services': <Scissors className="w-6 h-6" />,
  'Waxing': <Sparkles className="w-6 h-6" />,
  'Facials': <Droplets className="w-6 h-6" />,
};

export function ServicesCatalog({ categories }: ServicesCatalogProps) {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#FFF5F0]/10 to-[#FFE5D9]/10 rounded-2xl p-8 md:p-12 mb-10 border border-[#F26522]/20">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Professional <span className="text-[#F26522]">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Experience premium beauty and wellness treatments delivered by our skilled students 
            under expert supervision. Quality care at affordable prices.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(categories).map(([category, items]) => (
          <div
            key={category}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="bg-[#F26522] px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-card/20 rounded-lg">
                  {categoryIcons[category] || <Sparkle className="w-5 h-5" />}
                </div>
                <h3 className="font-bold text-lg">{category}</h3>
              </div>
            </div>
            <div className="divide-y divide-border">
              {items.map((service, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm py-4 px-6 hover:bg-accent/50 transition-colors group"
                >
                  <span className="text-muted-foreground font-medium group-hover:text-foreground">
                    {service.name}
                  </span>
                  <span className="font-bold text-[#F26522] text-lg tabular-nums">
                    ${service.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-12 bg-[#1A1A1A] rounded-2xl p-8 md:p-12 text-center border border-border">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Ready to Book Your Appointment?
        </h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Take the first step towards looking and feeling your best. Our talented students are ready to provide you with exceptional service.
        </p>
        <div className="h-1 w-24 mx-auto mb-6 bg-gradient-to-r from-[#F26522] to-[#E55A1A] rounded-full" />
        <p className="text-[#F26522] font-semibold">
          Professional Training • Affordable Prices • Quality Results
        </p>
      </div>
    </div>
  );
}
