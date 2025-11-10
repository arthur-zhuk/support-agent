import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Key, Palette, Globe } from 'lucide-react'
import { getTenantId } from '@/lib/auth/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'
import { SettingsForm } from './settings-form'
import { CopyButton } from './copy-button'
import { ThemeToggle } from './theme-toggle'

async function getTenantSettings(tenantId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { users: true },
    })
    return tenant
  } catch (error) {
    console.error('Failed to fetch tenant settings:', error)
    return null
  }
}

export default async function SettingsPage() {
  const tenantId = await getTenantId()
  if (!tenantId) {
    redirect('/login?callbackUrl=/dashboard/settings')
  }

  const tenant = await getTenantSettings(tenantId)

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tenant settings and configuration
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Tenant Information</CardTitle>
            </div>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm tenantId={tenantId} initialData={tenant} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Team Members</CardTitle>
            </div>
            <CardDescription>
              Manage users in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tenant?.users && tenant.users.length > 0 ? (
              <div className="space-y-2">
                {tenant.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{user.name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline">
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No team members found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>API Access</CardTitle>
            </div>
            <CardDescription>
              Your tenant ID and API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant ID</Label>
              <div className="flex gap-2">
                <Input value={tenantId} readOnly className="font-mono" />
                <CopyButton text={tenantId} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>API Base URL</Label>
              <div className="flex gap-2">
                <Input
                  value={`${env.baseUrl}/api`}
                  readOnly
                  className="font-mono"
                />
                <CopyButton text={`${env.baseUrl}/api`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Widget Customization</CardTitle>
            </div>
            <CardDescription>
              Customize the appearance of your support widget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Widget customization coming soon. You'll be able to customize colors, position, and branding.
            </p>
            <Button variant="outline" disabled>
              Customize Widget
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Embed Code</CardTitle>
            </div>
            <CardDescription>
              Copy this code to embed the support agent on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Embed Script</Label>
              <div className="flex gap-2">
                <Input
                  value={`<script src="${env.baseUrl}/api/embed?tenantId=${tenantId}"></script>`}
                  readOnly
                  className="font-mono text-sm"
                />
                <CopyButton text={`<script src="${env.baseUrl}/api/embed?tenantId=${tenantId}"></script>`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

