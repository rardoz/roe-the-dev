'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
interface CodeFormProps {
  lock_id: string
}

const CodeForm: React.FC<CodeFormProps> = ({ lock_id }) => {
  const [code, setCode] = useState('')
  const router = useRouter()
  const [codeCheck, setCodeCheck] = useState({
    success: undefined,
    message: undefined,
  } as { success?: boolean; message?: string })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
  }

  useEffect(() => {
    if (code.length === 4) {
      setCodeCheck({})
      fetch(`/api/page-lock/${lock_id}/${code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && (data.success || data.message)) setCodeCheck(data)
          else throw new Error('Invalid response')
        })
        .catch((e) => {
          console.error(e)
          setCodeCheck({ success: false, message: e.message })
        })
    }
  }, [code, lock_id])

  useEffect(() => {
    if (codeCheck.success) {
      const currentPath = window.location.pathname
      const newPath = `${currentPath}/${code}`
      router.push(newPath)
    }
  }, [codeCheck, code, router])

  let statusColor = codeCheck.success === false ? 'red' : 'gray'
  statusColor = codeCheck.success === true ? 'green' : statusColor
  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center">
      <label
        htmlFor="sketch-page-code--input"
        className="block mb-2 text-lg font-medium text-gray-900 dark:text-white"
      >
        Enter 4 digit page code
      </label>
      <input
        name="page_code"
        type="text"
        placeholder="__  __  __  __"
        required
        maxLength={4}
        id="sketch-page-code--input"
        onChange={(e) => {
          if (e.target.value && e.target.value.length === 4) {
            setCode(e.target.value)
          }
        }}
        className={`block w-full max-w-48 p-4 text-gray-900 border border-${statusColor}-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-${statusColor}-500 dark:bg-gray-700 dark:border-${statusColor}-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
      />
      {codeCheck.message && (
        <strong className={`mt-5 text-${statusColor}-600`}>
          Error: {codeCheck.message}
        </strong>
      )}
    </form>
  )
}

export default CodeForm
