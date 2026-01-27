
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Ghost } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 dark:bg-zinc-950 text-center px-4">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
        <Ghost className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-indigo-950 dark:text-indigo-50 sm:text-6xl">
        404
      </h1>
      <p className="mb-8 text-lg text-indigo-900/60 dark:text-indigo-200/60">
        Whoops! This page has vanished into the void.
      </p>
      <Link href="/">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-full px-8">
          Return Home
        </Button>
      </Link>
    </div>
  )
}
