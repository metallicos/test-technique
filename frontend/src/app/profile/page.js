"use client"
import { useAuth } from '@/context/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    confirmPassword: z.string().optional()
  })
  .refine((data) => {
    if (data.password || data.confirmPassword) {
      return data.password === data.confirmPassword
    }
    return true
  }, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function Profile() {
  const { user, token, logout } = useAuth()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email
      })
    }
  }, [user, reset])

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        email: data.email
      }
      if (data.password) {
        payload.password = data.password
      }

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/update`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Profile updated successfully')

      if (data.email !== user.email) {
        toast.info('Your email has changed. You will be logged out.')
        logout()
        router.push('/login')
      }
    } catch (error) {
      toast.error('Update failed')
    }
  }

  if (!user) return <div className="text-center text-gray-600">Loading...</div>

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-900 mb-6">Profile Settings</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password (optional)</label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  )
}
