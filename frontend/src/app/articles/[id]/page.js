"use client"
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Spinner } from '@/components/Spinner'
import { useParams } from 'next/navigation'

export default function ArticleDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/articles/${id}`)
        setArticle(res.data)
        setError(null)
      } catch (err) {
        setError('Article not found')
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-12 w-12 text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <article className="prose lg:prose-xl">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <span className="mr-4">
            By {article.author.name || 'Anonymous'}
          </span>
          <span>
            {article.publicationDate
                ? new Date(article.publicationDate).toLocaleDateString()
                : 'Unknown'}
            </span>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">
          {article.content}
        </p>
      </article>
    </div>
  )
}