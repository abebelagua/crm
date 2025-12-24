'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'

interface Subscription {
  id: string
  plan: 'FREE' | 'PRO'
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
  currentPeriodEnd: string
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscription')
      setSubscription(response.data)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setProcessing(true)
    setError('')

    try {
      const response = await api.post('/subscription/checkout', { plan: 'PRO' })
      
      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create checkout session')
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Subscription</h1>
            <p className="text-muted-foreground">Manage your subscription plan</p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Free Plan */}
            <Card className={subscription?.plan === 'FREE' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">$0</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Up to 50 clients
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Basic dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Email support
                    </li>
                  </ul>
                  {subscription?.plan === 'FREE' && (
                    <div className="pt-4">
                      <div className="p-3 bg-primary/10 text-primary rounded-md text-sm font-medium text-center">
                        Current Plan
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className={subscription?.plan === 'PRO' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>Pro Plan</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">$29</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Unlimited clients
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      API access
                    </li>
                  </ul>
                  {subscription?.plan === 'PRO' ? (
                    <div className="pt-4 space-y-2">
                      <div className="p-3 bg-primary/10 text-primary rounded-md text-sm font-medium text-center">
                        Current Plan
                      </div>
                      {subscription.status === 'ACTIVE' && (
                        <p className="text-xs text-muted-foreground text-center">
                          Renews on {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="pt-4">
                      <Button
                        className="w-full"
                        onClick={handleUpgrade}
                        disabled={processing}
                      >
                        {processing ? 'Processing...' : 'Upgrade to Pro'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Details */}
          {subscription && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium">{subscription.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          subscription.status === 'ACTIVE'
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                            : subscription.status === 'PAST_DUE'
                            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            : 'bg-red-500/20 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {subscription.status}
                      </span>
                    </p>
                  </div>
                  {subscription.status === 'ACTIVE' && (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Period Ends</p>
                      <p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

