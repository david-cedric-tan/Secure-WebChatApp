// src/app/register/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const socketRef = useRef<Socket | null>(null)

  const PASSWORD_ENCRYPTION = process.env.NEXT_PUBLIC_PASSWORD_ENCRYPTION === 'true';
  const USE_CADDY = process.env.NEXT_PUBLIC_CADDY === 'true';

  //======= COMMENT THIS PART TO TEST LOCALLY ==================
  useEffect(() => {
    // Connect to the appropriate Socket.IO server based on NEXT_PUBLIC_CADDY
    socketRef.current = io(
      USE_CADDY ? 'https://alien888.duckdns.org' : 'https://localhost:3001',
      {
        path: USE_CADDY ? '/socket.io' : undefined,
        withCredentials: USE_CADDY,
        secure: true, 
      }
    );

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

  const handleRegister = async () => {
    try {
      // Conditionally hash password
      const passwordToSend = PASSWORD_ENCRYPTION ? await sha256(password) : password;
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: passwordToSend }),
      })

      const data = await res.json()
      if (res.ok) {
        router.push(`/dashboard?username=${username}`)
      } else {
        setError(data.error || `Registration failed (Status: ${res.status})`)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to connect to server: ' + err.message)
    }
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
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
      <button className="bg-green-500 text-white px-4 py-2 mb-2" onClick={handleRegister}>
        Register
      </button>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button className="text-blue-700 underline" onClick={() => router.push('/')}>
        Already have an account? Login
      </button>
    </main>
  )
}