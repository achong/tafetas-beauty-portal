import { Calendar, Sparkles, Scissors, Droplets, Sparkle } from 'lucide-react';

interface ServiceItem {
  name: string;
  price: number;
}

interface ServicesCatalogProps {
  categories: Record<string, ServiceItem[]>;
  onBookNow?: () => void; // ✅ ADD THIS LINE
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Nail Services': <Scissors className="w-6 h-6" />,
  'Waxing': <Sparkles className="w-6 h-6" />,
  'Facials': <Droplets className="w-6 h-6" />,
};

export function ServicesCatalog({ categories }: ServicesCatalogProps) {
  return (
    <div className="fade-in">
      {/* Hero Section - Fixed: Removed border that was causing the grey ring */}
      <div className="bg-card rounded-2xl p-8 md:p-12 mb-10">
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
                <div className="p-2 bg-white/20 rounded-lg">
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


{/* TasTAFE Study Calendar (Auto-updates year) */}
<div className="mt-12 mb-8 bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8">
  {(() => {
    const currentYear = new Date().getFullYear();
    const is2027 = currentYear >= 2027;
    const year = is2027 ? 2027 : 2026;

    const intake1 = is2027 
      ? { start: "Monday, 1 February 2027", finish: "Friday, 2 July 2027" }
      : { start: "Monday, 2 February 2026", finish: "Friday, 3 July 2026" };
      
    const intake2 = is2027
      ? { start: "Monday, 19 July 2027", finish: "Friday, 10 December 2027" }
      : { start: "Monday, 20 July 2026", finish: "Friday, 11 December 2026" };

    return (
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-xl shrink-0">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-4">
            TasTAFE {year} Study Calendar
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our student clinic operates during TasTAFE semester periods. 
            Clinic availability may vary during breaks and public holidays.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Intake 1 */}
            <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-semibold text-foreground">Intake 1</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Starts:</span> {intake1.start}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Finishes:</span> {intake1.finish}
              </p>
            </div>

            {/* Intake 2 */}
            <div className="bg-background border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-semibold text-foreground">Intake 2</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Starts:</span> {intake2.start}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Finishes:</span> {intake2.finish}
              </p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4 italic">
            * For more information, visit the{' '}
            <a 
              href="https://www.tastafe.tas.edu.au/students/learning/study-calendar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              official TasTAFE Study Calendar
            </a>.
          </p>
        </div>
      </div>
    );
  })()}
</div>


      {/* CTA Section */}
      <div className="mt-12 bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Ready to Book Your Appointment?
        </h3>
           export function ServicesCatalog({ categories, onBookNow }: ServicesCatalogProps) {
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Take the first step towards looking and feeling your best. Our talented students are ready to provide you with exceptional service.
        </p>
           <Button
     onClick={onBookNow}
     className="mx-auto my-6 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
   >
     Book Now
   </Button>
        <p className="text-[#F26522] font-semibold">
          Professional Training • Affordable Prices • Quality Results
        </p>
      </div>
    </div>
  );
}
