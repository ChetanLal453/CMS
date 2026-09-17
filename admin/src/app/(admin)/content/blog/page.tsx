'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import RichTextEditor from '@/components/PageEditor/RichTextEditor'

type BlogPost = {
  id?: number
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string
  author: string
  category: string
  tags: string[]
  status: 'draft' | 'published'
  meta_title: string
  meta_description: string
  published_at: string | null
}

const emptyPost = (): BlogPost => ({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featured_image: '',
  author: '',
  category: '',
  tags: [],
  status: 'draft',
  meta_title: '',
  meta_description: '',
  published_at: null,
})

const uploadAsset = async (file: File) => {
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

  return data.uploaded[0].url as string
}

const toDateTimeLocal = (value: string | null) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

const fromDateTimeLocal = (value: string) => {
  if (!value) {
    return null
  }

  return new Date(value).toISOString()
}

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draft, setDraft] = useState<BlogPost>(emptyPost())
  const [tagsInput, setTagsInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/blog')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load blog posts')
      }

      const nextPosts = (data.posts || []).map((post: BlogPost) => ({
        ...emptyPost(),
        ...post,
        tags: Array.isArray(post.tags) ? post.tags : [],
      }))
      setPosts(nextPosts)
      setSelectedId((current) => {
        if (current && nextPosts.some((post: BlogPost) => post.id === current)) {
          return current
        }
        return nextPosts[0]?.id ?? null
      })
      if (!nextPosts.length) {
        setDraft(emptyPost())
        setTagsInput('')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    const selected = posts.find((post) => post.id === selectedId)
    if (selected) {
      setDraft(selected)
      setTagsInput((selected.tags || []).join(', '))
    }
  }, [posts, selectedId])

  const filteredPosts = useMemo(() => {
    if (!query.trim()) {
      return posts
    }

    const lowered = query.toLowerCase()
    return posts.filter((post) =>
      [post.title, post.slug, post.category, post.author].some((value) =>
        String(value || '').toLowerCase().includes(lowered),
      ),
    )
  }, [posts, query])

  const updateDraft = <K extends keyof BlogPost>(field: K, value: BlogPost[K]) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const handleNew = () => {
    setSelectedId(null)
    setDraft(emptyPost())
    setTagsInput('')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...draft,
        tags: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      const response = await fetch(draft.id ? `/api/blog/${draft.id}` : '/api/blog', {
        method: draft.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save blog post')
      }

      toast.success('Blog post saved')
      await fetchPosts()
      const saved = data.post || data.item
      setSelectedId(saved?.id ?? null)
      if (saved) {
        setDraft({ ...emptyPost(), ...saved, tags: Array.isArray(saved.tags) ? saved.tags : [] })
        setTagsInput((saved.tags || []).join(', '))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save blog post')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!draft.id) {
      handleNew()
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/blog/${draft.id}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete blog post')
      }

      toast.success('Blog post deleted')
      handleNew()
      await fetchPosts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete blog post')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadAsset(file)
      updateDraft('featured_image', url)
      toast.success('Featured image uploaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="info-wrap">
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

      <div className="pg-hd">
        <div>
          <h2>Blog</h2>
          <p>Manage draft and published posts with the existing Tiptap editor.</p>
        </div>
        <div className="pg-actions">
          <button className="gbtn" type="button" onClick={handleNew}>
            + New Post
          </button>
          <button className="gbtn pu" type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      <div className="cm-manager-grid">
        <div className="ic">
          <div className="ic-h">Posts</div>
          <div className="tbl-toolbar">
            <input
              className="srch"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts..."
            />
          </div>
          <div className="cm-manager-list">
            {filteredPosts.map((post) => (
              <button
                key={post.id}
                type="button"
                className={`cm-manager-item ${post.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(post.id ?? null)}>
                <div className="cm-manager-item-top">
                  <strong>{post.title || 'Untitled Post'}</strong>
                  <span className={`badge ${post.status === 'published' ? 'bu' : 'ba'}`}>
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <span className="cm-manager-subtle">{post.slug || 'No slug yet'}</span>
              </button>
            ))}
            {!filteredPosts.length && !loading ? <div className="cm-manager-empty">No posts found.</div> : null}
          </div>
        </div>

        <div className="ic">
          <div className="ic-h">Editor</div>
          <div className="ic-b">
            <div className="ig">
              <label>Title</label>
              <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} />
            </div>
            <div className="ig">
              <label>Slug</label>
              <input value={draft.slug} onChange={(event) => updateDraft('slug', event.target.value)} />
            </div>
            <div className="ig">
              <label>Author</label>
              <input value={draft.author} onChange={(event) => updateDraft('author', event.target.value)} />
            </div>
            <div className="ig">
              <label>Category</label>
              <input value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} />
            </div>
            <div className="ig">
              <label>Status</label>
              <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value as BlogPost['status'])}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="ig">
              <label>Publish Date</label>
              <input
                type="datetime-local"
                value={toDateTimeLocal(draft.published_at)}
                onChange={(event) => updateDraft('published_at', fromDateTimeLocal(event.target.value))}
              />
            </div>
            <div className="ig full">
              <label>Excerpt</label>
              <textarea value={draft.excerpt} onChange={(event) => updateDraft('excerpt', event.target.value)} />
            </div>
            <div className="ig full">
              <label>Featured Image</label>
              <input value={draft.featured_image} onChange={(event) => updateDraft('featured_image', event.target.value)} />
              <input
                type="file"
                className="form-control mt-2"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    void handleUpload(file)
                  }
                }}
              />
              <small className="text-muted">{uploading ? 'Uploading...' : 'Upload featured image'}</small>
              {draft.featured_image ? (
                <div className="cm-settings-asset-preview">
                  <img src={draft.featured_image} alt="Featured" />
                </div>
              ) : null}
            </div>
            <div className="ig full">
              <label>Content</label>
              <div className="cm-blog-editor">
                <RichTextEditor content={draft.content} onChange={(content) => updateDraft('content', content)} />
              </div>
            </div>
            <div className="ig">
              <label>Tags</label>
              <input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="seo, cms, analytics" />
            </div>
            <div className="ig">
              <label>Meta Title</label>
              <input value={draft.meta_title} onChange={(event) => updateDraft('meta_title', event.target.value)} />
            </div>
            <div className="ig full">
              <label>Meta Description</label>
              <textarea value={draft.meta_description} onChange={(event) => updateDraft('meta_description', event.target.value)} />
            </div>
          </div>

          <div className="cm-manager-footer">
            <button className="gbtn" type="button" onClick={handleNew}>
              Reset
            </button>
            <button className="gbtn danger" type="button" onClick={handleDelete} disabled={!draft.id || saving}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPage
