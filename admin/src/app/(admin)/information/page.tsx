'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import ModuleShell from '@/components/admin/ModuleShell'

type SettingsForm = {
  site_name: string
  site_url: string
  contact_email: string
  contact_phone: string
  address: string
  meta_description: string
  logo: string
  logo_dark: string
  favicon: string
  primary_color: string
  secondary_color: string
  heading_font: string
  body_font: string
  google_analytics_id: string
  facebook_pixel_id: string
  whatsapp_number: string
  instagram_url: string
  linkedin_url: string
  twitter_url: string
  facebook_url: string
  youtube_url: string
  custom_css: string
  custom_js: string
  robots_txt: string
}

const FONT_OPTIONS = ['Inter', 'Poppins', 'Manrope', 'DM Sans', 'Space Grotesk', 'Montserrat', 'Lora']

const emptySettings = (): SettingsForm => ({
  site_name: '',
  site_url: '',
  contact_email: '',
  contact_phone: '',
  address: '',
  meta_description: '',
  logo: '',
  logo_dark: '',
  favicon: '',
  primary_color: '#7c5cfc',
  secondary_color: '#10d982',
  heading_font: 'Inter',
  body_font: 'Inter',
  google_analytics_id: '',
  facebook_pixel_id: '',
  whatsapp_number: '',
  instagram_url: '',
  linkedin_url: '',
  twitter_url: '',
  facebook_url: '',
  youtube_url: '',
  custom_css: '',
  custom_js: '',
  robots_txt: '',
})

const normalizeSettings = (settings: Partial<SettingsForm> | null | undefined): SettingsForm => ({
  ...emptySettings(),
  ...settings,
})

const assetFields = [
  { key: 'logo', label: 'Logo' },
  { key: 'logo_dark', label: 'Logo Dark' },
  { key: 'favicon', label: 'Favicon' },
] as const

const InformationPage = () => {
  const [form, setForm] = useState<SettingsForm>(emptySettings())
  const [initialForm, setInitialForm] = useState<SettingsForm>(emptySettings())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<'logo' | 'logo_dark' | 'favicon' | null>(null)

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm])

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load settings')
      }

      const next = normalizeSettings(data.settings)
      setForm(next)
      setInitialForm(next)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const updateField = <K extends keyof SettingsForm>(field: K, value: SettingsForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const uploadMedia = useCallback(async (file: File, field: 'logo' | 'logo_dark' | 'favicon') => {
    setUploadingField(field)
    try {
      const formData = new FormData()
      formData.append('files', file)
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (!response.ok || !data.success || !data.uploaded?.[0]?.url) {
        throw new Error(data.error || 'Upload failed')
      }

      updateField(field, data.uploaded[0].url)
      toast.success(`${assetFields.find((asset) => asset.key === field)?.label || 'Asset'} uploaded`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setUploadingField(null)
    }
  }, [])

  const handleDiscard = () => {
    setForm(initialForm)
    toast.success('Changes discarded')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings')
      }

      const next = normalizeSettings(data.settings)
      setForm(next)
      setInitialForm(next)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModuleShell
      className="info-wrap"
      title="Settings"
      description="Global configuration for SEO, branding, analytics, and integrations."
      actions={(
        <>
          <button className="gbtn" type="button" onClick={handleDiscard} disabled={!dirty || saving}>
            Discard
          </button>
          <button className="gbtn pu" type="button" onClick={handleSave} disabled={loading || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      )}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181f',
            color: '#eeeeff',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      />

      <div className="cm-info-grid">
        <div>
          <div className="ic mb-3">
            <div className="ic-h">General <span>Site identity</span></div>
            <div className="ic-b">
              <div className="ig">
                <label>Site Name</label>
                <input value={form.site_name} onChange={(event) => updateField('site_name', event.target.value)} disabled={loading} />
              </div>
              <div className="ig">
                <label>Site URL</label>
                <input value={form.site_url} onChange={(event) => updateField('site_url', event.target.value)} disabled={loading} />
              </div>
              <div className="ig">
                <label>Contact Email</label>
                <input value={form.contact_email} onChange={(event) => updateField('contact_email', event.target.value)} disabled={loading} />
              </div>
              <div className="ig">
                <label>Contact Phone</label>
                <input value={form.contact_phone} onChange={(event) => updateField('contact_phone', event.target.value)} disabled={loading} />
              </div>
              <div className="ig full">
                <label>Default Meta Description</label>
                <textarea value={form.meta_description} onChange={(event) => updateField('meta_description', event.target.value)} disabled={loading} />
              </div>
            </div>
          </div>

          <div className="ic">
            <div className="ic-h">Branding <span>Colors &amp; fonts</span></div>
            <div className="ic-b">
              {assetFields.map((asset) => (
                <div className="ig" key={asset.key}>
                  <label>{asset.label}</label>
                  <div className="cm-upload-row">
                    <div className="cm-upload-trigger">🖼</div>
                    <input value={form[asset.key]} onChange={(event) => updateField(asset.key, event.target.value)} disabled={loading} placeholder={`Upload ${asset.label.toLowerCase()}`} />
                  </div>
                  <input
                    type="file"
                    className="form-control mt-2"
                    accept="image/*"
                    disabled={loading || saving}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void uploadMedia(file, asset.key)
                      }
                    }}
                  />
                  <small className="text-muted">
                    {uploadingField === asset.key ? 'Uploading...' : `Upload ${asset.label.toLowerCase()} image`}
                  </small>
                  {form[asset.key] ? (
                    <div className="cm-settings-asset-preview">
                      <img src={form[asset.key]} alt={asset.label} />
                    </div>
                  ) : null}
                </div>
              ))}
              <div className="ig">
                <label>Primary Color</label>
                <div className="cm-settings-color">
                  <input type="color" value={form.primary_color || '#7c5cfc'} onChange={(event) => updateField('primary_color', event.target.value)} disabled={loading} />
                  <input value={form.primary_color} onChange={(event) => updateField('primary_color', event.target.value)} disabled={loading} />
                </div>
              </div>
              <div className="ig">
                <label>Secondary Color</label>
                <div className="cm-settings-color">
                  <input type="color" value={form.secondary_color || '#10d982'} onChange={(event) => updateField('secondary_color', event.target.value)} disabled={loading} />
                  <input value={form.secondary_color} onChange={(event) => updateField('secondary_color', event.target.value)} disabled={loading} />
                </div>
              </div>
              <div className="ig">
                <label>Heading Font</label>
                <select value={form.heading_font} onChange={(event) => updateField('heading_font', event.target.value)} disabled={loading}>
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ig">
                <label>Body Font</label>
                <select value={form.body_font} onChange={(event) => updateField('body_font', event.target.value)} disabled={loading}>
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="ic mb-3">
            <div className="ic-h">Integrations <span>Tracking &amp; tools</span></div>
            <div className="ic-b">
              <div className="ig">
                <label>Google Analytics 4</label>
                <input value={form.google_analytics_id} onChange={(event) => updateField('google_analytics_id', event.target.value)} disabled={loading} />
              </div>
              <div className="ig">
                <label>Facebook Pixel</label>
                <input value={form.facebook_pixel_id} onChange={(event) => updateField('facebook_pixel_id', event.target.value)} disabled={loading} />
              </div>
              <div className="ig">
                <label>WhatsApp Number</label>
                <input value={form.whatsapp_number} onChange={(event) => updateField('whatsapp_number', event.target.value)} disabled={loading} />
              </div>
              <div className="ig">
                <label>Address</label>
                <input value={form.address} onChange={(event) => updateField('address', event.target.value)} disabled={loading} />
              </div>
            </div>
          </div>

          <div className="ic mb-3">
            <div className="ic-h">SEO <span>Indexing &amp; meta</span></div>
            <div className="ic-b">
              <div className="ig full">
                <label>Robots.txt</label>
                <textarea className="cm-settings-code cm-settings-code-short" value={form.robots_txt} onChange={(event) => updateField('robots_txt', event.target.value)} disabled={loading} />
              </div>
            </div>
          </div>

          <div className="ic mb-3">
            <div className="ic-h">Social Links <span>Brand channels</span></div>
            <div className="ic-b">
              <div className="ig">
                <label>Instagram</label>
                <input value={form.instagram_url} onChange={(event) => updateField('instagram_url', event.target.value)} disabled={loading} />
              </div>
              <div className="ig">
                <label>LinkedIn</label>
                <input value={form.linkedin_url} onChange={(event) => updateField('linkedin_url', event.target.value)} disabled={loading} />
              </div>
              <div className="ig">
                <label>Twitter</label>
                <input value={form.twitter_url} onChange={(event) => updateField('twitter_url', event.target.value)} disabled={loading} />
              </div>
              <div className="ig">
                <label>Facebook</label>
                <input value={form.facebook_url} onChange={(event) => updateField('facebook_url', event.target.value)} disabled={loading} />
              </div>
              <div className="ig full">
                <label>YouTube</label>
                <input value={form.youtube_url} onChange={(event) => updateField('youtube_url', event.target.value)} disabled={loading} />
              </div>
            </div>
          </div>

          <div className="ic">
            <div className="ic-h">Advanced <span>Custom code</span></div>
            <div className="ic-b">
              <div className="ig full">
                <label>Custom CSS (injected site-wide)</label>
                <textarea className="cm-settings-code cm-settings-code-short" value={form.custom_css} onChange={(event) => updateField('custom_css', event.target.value)} disabled={loading} />
              </div>
              <div className="ig full">
                <label>Custom JS (injected in &lt;head&gt;)</label>
                <textarea className="cm-settings-code cm-settings-code-short" value={form.custom_js} onChange={(event) => updateField('custom_js', event.target.value)} disabled={loading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  )
}

export default InformationPage
