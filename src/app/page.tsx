// src/app/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const socketRef = useRef<Socket | null>(null)

  const PASSWORD_ENCRYPTION = process.env.NEXT_PUBLIC_PASSWORD_ENCRYPTION === 'true';

  useEffect(() => {
    socketRef.current = io('https://alien888.duckdns.org', {
      path: '/socket.io',
      withCredentials: true,
    })

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server')
    })

    socketRef.current.on('connect_error', (err) => {
      console.error('Connection error:', err.message)
      setError('Failed to connect to messaging server')
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  const sha256 = async (text: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const handleLogin = async () => {
    try {
      // Conditionally hash password
      const passwordToSend = PASSWORD_ENCRYPTION ? await sha256(password) : password;
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: passwordToSend }),
      })

      const data = await res.json()
      if (res.ok) {
        router.push(`/dashboard?username=${username}`)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to connect to server: ' + err.message)
    }
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input
        className="border p-2 w-full mb-2"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 mb-2" onClick={handleLogin}>
        Login
      </button>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button className="text-blue-700 underline" onClick={() => router.push('/register')}>
        Don't have an account? Register
      </button>
    </main>
  )
}