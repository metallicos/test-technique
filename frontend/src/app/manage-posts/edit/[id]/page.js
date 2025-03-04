"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/auth'

export default function EditArticlePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  // If no user is authenticated, redirect to login
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Fetch the article data if id and token are available
  useEffect(() => {
    if (id && token) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/articles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        setArticle(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load article:', err)
        toast.error('Failed to load article')
        setLoading(false)
      })
    }
  }, [id, token])

  const handleSave = async () => {
    try {
        const { author, ...payload } = article;
    
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${id}`, payload, {
            headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/merge-patch+json'

        }
      })
      toast.success('Article updated successfully')
      router.push('/manage-posts')
    } catch (error) {
      console.error('Failed to update article:', error)
      toast.error('Failed to update article')
    }
  }

  if (loading) return <p>Loading...</p>
  if (!article) return <p>Article not found</p>

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Article</h1>
      <div className="mb-4">
        <label htmlFor="title" className="block mb-2 font-medium">Title</label>
        <input
          id="title"
          type="text"
          value={article.title}
          onChange={(e) => setArticle({ ...article, title: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block mb-2 font-medium">Content</label>
        <textarea
          id="content"
          value={article.content}
          onChange={(e) => setArticle({ ...article, content: e.target.value })}
          rows={10}
          className="w-full p-2 border rounded"
        ></textarea>
      </div>
      <button
        onClick={handleSave}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Save Changes
      </button>
    </div>
  )
}
