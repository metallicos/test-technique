"use client"
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Pagination } from '@/components/Pagination'
import Link from 'next/link'
import { Spinner } from '@/components/Spinner'
import styles from '@/styles/ArticlesListing.module.css' // <-- Import the CSS module

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const itemsPerPage = 9

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/articles?page=${currentPage}`
      )
      const data = res.data

      // Hydra or custom structure
      const articlesArray = data['hydra:member'] || data.member || []
      const view = data['hydra:view'] || data.view || {}
      setArticles(articlesArray)

      const totalItems = data['hydra:totalItems'] || data.totalItems || 0
      let computedTotalPages = Math.ceil(totalItems / itemsPerPage)
      if (computedTotalPages < 1) computedTotalPages = 1

      const lastPageUrl = view['hydra:last'] || ''
      if (lastPageUrl.includes('page=')) {
        const lastPage = parseInt(lastPageUrl.split('page=')[1], 10)
        computedTotalPages = Math.min(computedTotalPages, lastPage)
      }

      setTotalPages(computedTotalPages)
      setError(null)
    } catch (err) {
      console.error('Error fetching articles:', err)
      setError('Failed to load articles. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [currentPage])

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className={styles.articlesContainer}>
      <h1 className={`${styles.articlesTitle} text-center`}>
        All Articles
      </h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-12 w-12 text-indigo-600" />
        </div>
      ) : (
        <>
          <div className={`${styles.articlesGrid}`}>
            {articles?.length > 0 ? (
              articles.map((article) => {
                const articleId = article.id || article['@id']?.split('/').pop()
                return (
                  <article
                    key={articleId}
                    className={`${styles.articleCard} transition-shadow`}
                  >
                    <div className="flex flex-col h-full">
                      <h3 className={`${styles.articleTitle} mb-2`}>
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mb-4 flex-grow">
                        {article.content?.substring(0, 150)}...
                      </p>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            By {article.author?.name || 'Unknown Author'}
                          </span>
                          <span>
                            {article.createdAt || article.publicationDate
                              ? new Date(article.createdAt || article.publicationDate).toLocaleDateString()
                              : 'Unknown date'}
                          </span>
                        </div>
                        <Link
                          href={`/articles/${articleId}`}
                          className="mt-4 inline-block text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Read more →
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <p className="text-gray-500">No articles found.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  setCurrentPage(newPage)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
