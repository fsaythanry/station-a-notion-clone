import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex h-screen min-h-screen flex-col items-center justify-center bg-zinc-50">
      <section className="mb-8 flex items-center justify-center">
        <h1 className="mr-5 border-r border-zinc-500 pr-5 text-5xl font-bold">404</h1>
        <p>Page not found!</p>
      </section>

      <Button asChild variant="default" size="lg" className="w-40">
        <Link href="/">Go Back</Link>
      </Button>
    </div>
  )
}