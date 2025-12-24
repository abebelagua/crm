'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'

export default function SubscriptionCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Subscription Cancelled</CardTitle>
            <CardDescription>Your subscription was not completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No charges were made. You can try again anytime.
              </p>
              <Button
                className="w-full"
                onClick={() => router.push('/subscription')}
              >
                Back to Subscription
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

