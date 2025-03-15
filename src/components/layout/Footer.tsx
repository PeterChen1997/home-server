import Link from "next/link";
import { GithubIcon, ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/50 py-6">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © {currentYear} 我的导航. 保留所有权利.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>

            <Link
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">站点链接</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
