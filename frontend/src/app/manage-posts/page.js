"use client"
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/context/auth'
import { Pagination } from '@/components/Pagination'
import Link from 'next/link'
import { toast } from 'react-toastify'
import styles from '@/styles/ManagePosts.module.css'

export default function ManagePosts() {
  const { user, token } = useAuth()
  const [articles, setArticles] = useState([])
  const [selectedIds, setSelectedIds] = useState([]) // Track selected articles
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch paginated articles for the current user
  const fetchArticles = async (page = 1) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiUrl = baseUrl.replace(/\/api$/, '');

      const res = await axios.get(`${apiUrl}/articles/me?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      setArticles(res.data.data)
      setCurrentPage(res.data.pagination.current_page)
      setTotalPages(res.data.pagination.total_pages)
      // Clear selections whenever new data is loaded
      setSelectedIds([])
    } catch (error) {
      console.error('Failed to load articles:', error)
      setArticles([])
      setCurrentPage(1)
      setTotalPages(1)
    }
  }

  // Initial load + re-fetch when currentPage changes
  useEffect(() => {
    if (user) {
      fetchArticles(currentPage)
    }
  }, [user, currentPage])

  // Toggle selection for a single article
  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  // Select or unselect all
  const toggleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(articles.map((article) => article.id))
    }
  }

  // Delete a single article
  const deleteArticle = async (id) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/articles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        fetchArticles(currentPage)
        toast.success('Article deleted successfully')
      } catch (error) {
        console.error('Failed to delete article:', error)
      }
    }
  }

  // Delete all selected articles
  const deleteSelectedArticles = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} selected article(s)?`)) return

    for (const id of selectedIds) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/articles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        toast.success('Article deleted successfully')
      } catch (error) {
        console.error(`Failed to delete article with id ${id}:`, error)
      }
    }
    // Refresh articles and clear selection
    fetchArticles(currentPage)
    setSelectedIds([])
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Your Posts</h1>
        <Link
          href="/manage-posts/new"
          className={styles.createButton}
        >
          Create New Post
        </Link>
      </div>

      {/* Select All + Delete Selected Controls */}
      <div className={styles.controls}>
        <label className={styles.selectAllLabel}>
          <input
            type="checkbox"
            checked={selectedIds.length === articles.length && articles.length > 0}
            onChange={toggleSelectAll}
          />
          <span>Select All</span>
        </label>
        {selectedIds.length > 0 && (
          <button
            onClick={deleteSelectedArticles}
            className={styles.deleteSelected}
          >
            Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {articles.map((article) => (
          <div key={article.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <input
                type="checkbox"
                checked={selectedIds.includes(article.id)}
                onChange={() => toggleSelectOne(article.id)}
              />
              <h3 className={styles.cardTitle}>{article.title}</h3>
            </div>
            <div className={styles.cardActions}>
              <Link
                href={`/manage-posts/edit/${article.id}`}
                className={styles.editLink}
              >
                Edit
              </Link>
              <button
                onClick={() => deleteArticle(article.id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
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
    </div>
  )
}
