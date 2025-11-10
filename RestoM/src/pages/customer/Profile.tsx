import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaUser, FaShoppingBag, FaHistory, FaEdit, FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

interface Order {
  id: string
  date: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  orderType: 'Dine-In' | 'Takeaway'
}

interface User {
  name: string
  email: string
  phone: string
  address?: string
  joinDate: string
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'details'>('current')
  const [currentOrders, setCurrentOrders] = useState<Order[]>([])
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockUser: User = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 9876543210',
      address: '123 Main Street, Pune, Maharashtra',
      joinDate: '2025-01-15'
    }

    // Mock current orders (active orders)
    const mockCurrentOrders: Order[] = [
      {
        id: 'ORD004',
        date: '2025-11-08T12:30:00Z',
        status: 'preparing',
        items: [
          { name: 'Paneer Butter Masala', quantity: 1, price: 220 },
          { name: 'Jeera Rice', quantity: 1, price: 120 }
        ],
        total: 340,
        orderType: 'Dine-In'
      }
    ]

    // Mock order history
    const mockOrderHistory: Order[] = [
      {
        id: 'ORD001',
        date: '2025-11-08T10:30:00Z',
        status: 'delivered',
        items: [
          { name: 'Chicken Biryani', quantity: 2, price: 250 },
          { name: 'Butter Chicken', quantity: 1, price: 320 }
        ],
        total: 820,
        orderType: 'Dine-In'
      },
      {
        id: 'ORD002',
        date: '2025-11-07T14:15:00Z',
        status: 'cancelled',
        items: [
          { name: 'Paneer Tikka', quantity: 1, price: 180 },
          { name: 'Naan', quantity: 2, price: 40 }
        ],
        total: 260,
        orderType: 'Takeaway'
      },
      {
        id: 'ORD003',
        date: '2025-11-06T19:45:00Z',
        status: 'delivered',
        items: [
          { name: 'Veg Thali', quantity: 1, price: 150 }
        ],
        total: 150,
        orderType: 'Dine-In'
      }
    ]

    setTimeout(() => {
      setUser(mockUser)
      setCurrentOrders(mockCurrentOrders)
      setOrderHistory(mockOrderHistory)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-warning" />
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return <FaSpinner className="text-info" />
      case 'delivered':
        return <FaCheckCircle className="text-success" />
      case 'cancelled':
        return <FaTimesCircle className="text-danger" />
      default:
        return <FaClock className="text-secondary" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-warning'
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return 'text-info'
      case 'delivered':
        return 'text-success'
      case 'cancelled':
        return 'text-danger'
      default:
        return 'text-secondary'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderOrderCard = (order: Order) => (
    <div key={order.id} className="card border-0 shadow-sm mb-3">
      <div className="card-body p-4">
        {/* Order Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="card-title mb-1 fw-bold">Order #{order.id}</h6>
            <small className="text-muted">{formatDate(order.date)}</small>
          </div>
          <div className="text-end">
            <div className={`badge ${getStatusColor(order.status)} mb-1`}>
              {getStatusIcon(order.status)}
              <span className="ms-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
            <div className="small text-muted">{order.orderType}</div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-3">
          {order.items.map((item, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center py-1">
              <span className="small">
                {item.quantity}x {item.name}
              </span>
              <span className="small fw-semibold">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Order Total */}
        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
          <span className="fw-bold">Total</span>
          <span className="fw-bold text-primary">₹{order.total}</span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="container py-5" style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <Link to="/menu" className="btn btn-outline-secondary me-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
          <FaArrowLeft />
        </Link>
        <h1 className="h3 mb-0 fw-bold">My Profile</h1>
      </div>

      {/* Profile Tabs */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0">
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveTab('current')}
              >
                <FaShoppingBag className="me-2" />
                Current Orders
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <FaHistory className="me-2" />
                Order History
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                <FaUser className="me-2" />
                Profile Details
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4">
          {/* Current Orders Tab */}
          {activeTab === 'current' && (
            <div>
              <h5 className="mb-4">Current Orders</h5>
              {currentOrders.length === 0 ? (
                <div className="text-center py-5">
                  <FaShoppingBag size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No active orders</h6>
                  <p className="text-muted">Your current orders will appear here.</p>
                  <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
                </div>
              ) : (
                currentOrders.map(order => renderOrderCard(order))
              )}
            </div>
          )}

          {/* Order History Tab */}
          {activeTab === 'history' && (
            <div>
              <h5 className="mb-4">Order History</h5>
              {orderHistory.length === 0 ? (
                <div className="text-center py-5">
                  <FaHistory size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No order history</h6>
                  <p className="text-muted">Your past orders will appear here.</p>
                </div>
              ) : (
                orderHistory.map(order => renderOrderCard(order))
              )}
            </div>
          )}

          {/* Profile Details Tab */}
          {activeTab === 'details' && user && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Profile Information</h5>
                <button className="btn btn-outline-primary btn-sm">
                  <FaEdit className="me-2" />
                  Edit Profile
                </button>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <h6 className="card-title mb-3">
                        <FaUser className="me-2 text-primary" />
                        Personal Information
                      </h6>
                      <div className="mb-2">
                        <strong>Name:</strong> {user.name}
                      </div>
                      <div className="mb-2">
                        <strong>Email:</strong> {user.email}
                      </div>
                      <div className="mb-2">
                        <strong>Phone:</strong> {user.phone}
                      </div>
                      <div className="mb-0">
                        <strong>Member since:</strong> {new Date(user.joinDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <h6 className="card-title mb-3">
                        <FaMapMarkerAlt className="me-2 text-primary" />
                        Address Information
                      </h6>
                      {user.address ? (
                        <div className="mb-0">
                          <strong>Address:</strong><br />
                          {user.address}
                        </div>
                      ) : (
                        <div className="text-muted">
                          <em>No address saved</em>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="row g-3 mt-4">
                <div className="col-6 col-md-3">
                  <div className="card border-0 bg-primary text-white text-center">
                    <div className="card-body py-3">
                      <div className="h4 mb-0">{currentOrders.length}</div>
                      <small>Active Orders</small>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 bg-success text-white text-center">
                    <div className="card-body py-3">
                      <div className="h4 mb-0">{orderHistory.filter(o => o.status === 'delivered').length}</div>
                      <small>Orders Delivered</small>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 bg-warning text-white text-center">
                    <div className="card-body py-3">
                      <div className="h4 mb-0">₹{orderHistory.reduce((sum, order) => sum + order.total, 0)}</div>
                      <small>Total Spent</small>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 bg-info text-white text-center">
                    <div className="card-body py-3">
                      <div className="h4 mb-0">{orderHistory.length}</div>
                      <small>Total Orders</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile