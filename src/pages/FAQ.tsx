import { AppLayout } from "@/components/AppLayout";
import { faqItems } from "@/data/sampleData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, HelpCircle, Car, Monitor, IndianRupee, TicketPlus, Info } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  Lease: <IndianRupee className="h-4 w-4 text-primary" />,
  Service: <TicketPlus className="h-4 w-4 text-warning" />,
  Finance: <IndianRupee className="h-4 w-4 text-success" />,
  Asset: <Monitor className="h-4 w-4 text-accent" />,
  Vehicle: <Car className="h-4 w-4 text-primary" />,
  General: <Info className="h-4 w-4 text-muted-foreground" />,
};

const FAQ = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = Array.from(new Set(faqItems.map(f => f.category)));

  const filtered = faqItems.filter((faq) => {
    if (categoryFilter !== "all" && faq.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="page-header">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h1 className="page-title">Frequently Asked Questions</h1>
        </div>
        <p className="page-description">Find answers to common questions about leases, assets, invoices, and portal features</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 w-[280px]"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full">
        {filtered.length > 0 ? (
          <Accordion type="multiple" className="space-y-2">
            {filtered.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-card rounded-lg border px-5 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-sm font-medium text-left py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {categoryIcons[faq.category] || <HelpCircle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <p>{faq.question}</p>
                      <span className="text-[10px] text-muted-foreground font-normal">{faq.category}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 pl-11 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No FAQs found matching your search.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FAQ;
