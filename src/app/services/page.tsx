import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { services } from '@/lib/placeholder-data';
import { CheckCircle } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          My Services
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Let's build something amazing together.
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {services.map((service) => (
          <AccordionItem key={service.title} value={service.title}>
            <AccordionTrigger className="text-xl font-headline hover:no-underline">
              {service.title}
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-muted-foreground">{service.description}</p>
              <ul className="space-y-2">
                {service.details.map((detail) => (
                  <li key={detail} className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-primary flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
