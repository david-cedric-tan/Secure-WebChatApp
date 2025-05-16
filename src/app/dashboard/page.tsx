// src/app/dashboard/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { encryptMessage, decryptMessage } from '@/lib/encryption'; // Import encryption functions

type Friend = {
  id: number
  username: string
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const username = searchParams.get('username') || 'User'
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [inputUsername, setInputUsername] = useState('')
  const [feedback, setFeedback] = useState('')
  const [requests, setRequests] = useState<string[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'settings'>('friends')
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<{ id: number; senderUsername: string; content: string; timestamp: string }[]>([])
  const [newMessage, setNewMessage] = useState('')
  const socketRef = useRef<Socket | null>(null)

  const MESSAGE_ENCRYPTION = process.env.NEXT_PUBLIC_MESSAGE_ENCRYPTION === 'true';

  useEffect(() => {
  //======= UNCOMMENT THIS PART TO TEST LOCALLY ==================    
    // socketRef.current = io('http://localhost:3001')
  //======= COMMENT THIS PART TO TEST LOCALLY ==================
    socketRef.current = io('https://alien888.duckdns.org', {
      path: '/socket.io',
      withCredentials: true,
    })

    socketRef.current.on('connect', () => {
      console.log('Connected to socket:', socketRef.current?.id)
    })

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err)
      setError('Failed to connect to messaging server')
    })

    // ======= do the DECRYPTION on client side =============
    socketRef.current.on('message', (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          content: MESSAGE_ENCRYPTION ? decryptMessage(msg.content) : msg.content, // Decrypt only if enabled
        },
      ]);
    });

    /*socketRef.current.on('message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })*/
    //=======================================================

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!username) return

    const fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        const [friendsRes, requestsRes] = await Promise.all([
          fetch(`/api/friends?username=${username}`),
          fetch(`/api/friends/requests?username=${username}`),
        ])

        if (!friendsRes.ok) {
          const errorData = await friendsRes.json()
          throw new Error(errorData.error || `Failed to load friends (Status: ${friendsRes.status})`)
        }
        const friendsData = await friendsRes.json()
        setFriends(friendsData.friends || [])

        if (!requestsRes.ok) {
          const errorData = await requestsRes.json()
          throw new Error(errorData.error || `Failed to load requests (Status: ${requestsRes.status})`)
        }
        const requestData = await requestsRes.json()
        setRequests(requestData.requests || [])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedFriend) return
      try {
        const res = await fetch(`/api/messages/get?user1=${username}&user2=${selectedFriend.username}`)
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || `Failed to load messages (Status: ${res.status})`)
        }
        const data = await res.json();

        //================= Decrypt messages ========================
        let decryptedMessages = data.messages;
          if (MESSAGE_ENCRYPTION) {
            decryptedMessages = data.messages.map((msg: any) => ({
              ...msg,
              content: decryptMessage(msg.content),
            }));
          }        
        setMessages(decryptedMessages || []);
        //setMessages(data.messages || []);

        //==========================================================


      } catch (err) {
        setError((err as Error).message)
      }
    }
    fetchMessages()
  }, [selectedFriend, username])

  const handleRespond = async (fromUser: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUsername: fromUser, toUsername: username, action }),
      })
      const result = await res.json()
      if (res.ok) {
        setRequests((prev) => prev.filter((user) => user !== fromUser))
        if (action === 'accept' && result.friend) {
          setFriends((prev) => {
            const exists = prev.some((f) => f.id === result.friend.id)
            return exists ? prev : [...prev, result.friend]
          })
        }
      } else {
        setError(result.error || 'Failed to respond to request')
      }
    } catch (err) {
      setError('Error responding to request')
    }
  }

  
  const handleSend = () => {
    if (!newMessage.trim() || !selectedFriend || !socketRef.current) return

    //================== ENCRYPT MESSAGE AT CLIENT ===========================
    let messageContent = newMessage;
    if (MESSAGE_ENCRYPTION) {
      messageContent = encryptMessage(newMessage); // Encrypt only if enabled
    }

    //const encryptedContent = encryptMessage(newMessage); // Encrypt client-side
    //const decryptedContent = decryptMessage(encryptedContent); // Encrypt client-side
    const msg = {
      senderUsername: username,
      receiverUsername: selectedFriend.username,
      content: messageContent, // Send encrypted content
    };
    //console.log("MSG", newMessage);
    //console.log("ENCRYPTED", encryptedContent);
    //console.log("DECRYPTED", decryptedContent);

    /*const msg = {
      senderUsername: username,
      receiverUsername: selectedFriend.username,
      content: newMessage,
    }*/
    //========================================================================

    socketRef.current.emit('message', msg)
    setNewMessage('')
  }


  return (
    <div className="flex h-screen">
      <div className="w-16 bg-gray-100 border-r flex flex-col items-center py-4 space-y-6">
        <button onClick={() => setActiveTab('friends')} className="text-gray-700 hover:text-black">
          👤
        </button>
        <button onClick={() => setActiveTab('groups')} className="text-gray-700 hover:text-black">
          👥
        </button>
        <button onClick={() => setActiveTab('settings')} className="text-gray-700 hover:text-black">
          ⚙️
        </button>
      </div>

      {activeTab === 'friends' && (
        <div className="w-64 bg-gray-50 border-r p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-4">Messages</h2>
            {loading && <p className="text-sm text-gray-400">Loading...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <ul className="space-y-2">
              {friends.map((friend) => (
                <li
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend)}
                  className="cursor-pointer p-2 bg-white hover:bg-gray-100 rounded shadow"
                >
                  {friend.username}
                </li>
              ))}
            </ul>

            {requests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold">Friend Requests</h3>
                <ul className="mt-2 space-y-2">
                  {requests.map((from) => (
                    <li
                      key={from}
                      className="bg-white p-2 rounded shadow text-sm flex justify-between items-center"
                    >
                      <span>{from}</span>
                      <div className="space-x-1">
                        <button
                          className="text-green-600"
                          onClick={() => handleRespond(from, 'accept')}
                        >
                          Accept
                        </button>
                        <button
                          className="text-red-600"
                          onClick={() => handleRespond(from, 'decline')}
                        >
                          Decline
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {showAddFriend && (
            <div className="mt-4 space-y-2">
              <input
                className="w-full border p-1 rounded"
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="Enter username"
              />
              <button
                onClick={async () => {
                  if (!inputUsername) {
                    setFeedback('Please enter username')
                    return
                  }
                  try {
                    const res = await fetch('/api/friends/request', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ fromUsername: username, toUsername: inputUsername }),
                    })
                    const data = await res.json()
                    if (res.ok) {
                      setFeedback(data.message || 'Friend request sent')
                    } else {
                      setFeedback(data.error || 'Request failed')
                    }
                  } catch (err) {
                    setFeedback('Error sending request')
                  }
                }}
                className="w-full bg-blue-600 text-white p-1 rounded"
              >
                Send Request
              </button>
              {feedback && <p className="text-sm text-gray-700 mt-1">{feedback}</p>}
            </div>
          )}
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setShowAddFriend(!showAddFriend)}
          >
            + Add Friend
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center text-gray-500">
        {selectedFriend ? (
          <div className="flex flex-col w-full h-full">
            <div className="p-4 border-b font-semibold text-lg">
              Chatting with {selectedFriend.username}
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-xs px-3 py-2 rounded shadow ${
                    msg.senderUsername === username
                      ? 'bg-blue-500 text-white self-end'
                      : 'bg-gray-200 self-start'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex space-x-2">
              <input
                type="text"
                className="flex-1 border p-2 rounded"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded">
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="text-lg">Select a friend to start messaging</div>
        )}
      </div>
    </div>
  )
}