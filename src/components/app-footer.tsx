import { cn } from "@/lib/utils";

export function AppFooter() {
  return (
    <footer className={cn("py-6 md:px-8 md:py-0 border-t", "hide-on-dashboard hide-on-auth")}>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by Dipanjan S. PRANGON. The source code is available on GitHub.
        </p>
      </div>
    </footer>
  );
}
