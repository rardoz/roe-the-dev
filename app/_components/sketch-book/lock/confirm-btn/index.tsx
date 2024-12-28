'use client'
import React from 'react'
import { Button } from 'flowbite-react'
import { useRouter } from 'next/navigation'

const ConfirmBtn: React.FC<{ page: number }> = ({ page }) => {
  const router = useRouter()
  const redirectToLockPage = () => {
    fetch('/api/page-lock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_number: page,
      }),
    })
      .then((response) => {
        return response.json()
      })
      .then((data: any) => {
        if (data.lock_id && data.code) {
          router.push(`../playground/${data.lock_id}/${data.code}`)
        } else {
          throw Error('No lock or code available.')
        }
      })
      .catch((e) => {
        alert(e.message)
      })
  }

  return (
    <div className="flex justify-center mt-10">
      <Button pill color="purple" onClick={redirectToLockPage}>
        <>
          <input type="checkbox" readOnly checked className="mr-2" />I promise
          that I wont be an a-hole.
        </>
      </Button>
    </div>
  )
}

export default ConfirmBtn
