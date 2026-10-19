import Link from "next/link";
import { BrandLogo } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <Link href="/" className="flex justify-center py-2" aria-label="ManosCerca">
        <BrandLogo variant="horizontal" color="color" className="h-10 w-auto" priority />
      </Link>
      {children}
    </main>
  );
}
