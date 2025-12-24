'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navbar'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  status: string
  createdAt: string
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchClients()
  }, [search])

  const fetchClients = async () => {
    try {
      const params = search ? { search } : {}
      const response = await api.get('/clients', { params })
      setClients(response.data)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      await api.delete(`/clients/${id}`)
      fetchClients()
    } catch (error) {
      console.error('Failed to delete client:', error)
    }
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Manage your clients</p>
          </div>
          <Button onClick={() => router.push('/clients/new')}>Add Client</Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{client.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                  {client.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    client.status === 'ACTIVE' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                    client.status === 'LEAD' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {client.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(client.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            </Card>
          ))}

          {clients.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No clients found. Add your first client to get started.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

