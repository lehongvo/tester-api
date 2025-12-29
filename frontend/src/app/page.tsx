'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin + '/api' : 'http://localhost/api')

interface Student {
  id: number
  name: string
  email: string
  age?: number
  address?: string
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    address: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      fetchStudents()
    }
  }, [])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      })
      localStorage.setItem('token', response.data.access_token)
      setIsAuthenticated(true)
      fetchStudents()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setStudents([])
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setStudents(response.data)
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout()
      }
      setError('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student)
      setFormData({
        name: student.name,
        email: student.email,
        age: student.age?.toString() || '',
        address: student.address || '',
      })
    } else {
      setEditingStudent(null)
      setFormData({
        name: '',
        email: '',
        age: '',
        address: '',
      })
    }
    setShowModal(true)
    setError('')
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingStudent(null)
    setFormData({
      name: '',
      email: '',
      age: '',
      address: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const token = localStorage.getItem('token')
      const data = {
        name: formData.name,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : undefined,
        address: formData.address || undefined,
      }

      if (editingStudent) {
        await axios.patch(
          `${API_URL}/students/${editingStudent.id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      } else {
        await axios.post(`${API_URL}/students`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
      closeModal()
      fetchStudents()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return
    }
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/students/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      fetchStudents()
    } catch (err: any) {
      setError('Failed to delete student')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Student Dashboard</h1>
          <form onSubmit={login}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Login
            </button>
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
              Default: admin / admin123
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Student Management</h1>
          <div className="header-actions">
            <button onClick={() => openModal()} className="btn btn-success">
              Add Student
            </button>
            <button onClick={logout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {error && <div className="error">{error}</div>}
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    No students found. Click "Add Student" to create one.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.age || '-'}</td>
                    <td>{student.address || '-'}</td>
                    <td>
                      <button
                        onClick={() => openModal(student)}
                        className="btn btn-primary"
                        style={{ marginRight: '8px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {showModal && (
          <div className="modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
                <button className="close-btn" onClick={closeModal}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                {error && <div className="error">{error}</div>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary">
                    {editingStudent ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn"
                    style={{ background: '#f0f0f0' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

