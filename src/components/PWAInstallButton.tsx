import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function PWAInstallButton({ className }: { className?: string }) {
  const { t } = useLang();

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator &&
          Boolean(
            (window.navigator as Navigator & {
              standalone?: boolean;
            }).standalone
          ));

      setInstalled(standalone);
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  // Don't show the button when already installed
  if (installed) return null;

  const install = async () => {
    // Chrome/Android install prompt available
    if (installPrompt) {
      await installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    // Fallback when browser doesn't provide automatic install prompt
    alert(
      t(
        "To install this app, open your browser menu and choose 'Install app' or 'Add to Home screen'.",
        "অ্যাপটি ইনস্টল করতে ব্রাউজারের মেনু খুলে 'Install app' অথবা 'Add to Home screen' নির্বাচন করুন।"
      )
    );
  };

  return (
<button
  type="button"
  onClick={install}
  className={cn(
    "inline-flex items-center gap-2",
    "text-sm font-medium text-gold",
    "transition-colors hover:text-white",
    className,
  )}
>
  <Download className="size-4" aria-hidden />
  {t("Install App", "অ্যাপ ইনস্টল")}
</button>
  );
}