import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'

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

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockOrders: Order[] = [
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
        status: 'preparing',
        items: [
          { name: 'Veg Thali', quantity: 1, price: 150 }
        ],
        total: 150,
        orderType: 'Dine-In'
      }
    ]

    setTimeout(() => {
      setOrders(mockOrders)
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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

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

  if (loading) {
    return (
      <div className="container py-5" style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading order history...</p>
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
        <h1 className="h3 mb-0 fw-bold">Order History</h1>
      </div>

      {/* Filter Buttons */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-center p-4">
            <img src="/assets/images/no-dishes.png" alt="No orders" style={{ width: '200px', opacity: 0.5 }} />
          </div>
          <h5 className="text-muted">No orders found</h5>
          <p className="text-muted">Your order history will appear here once you place an order.</p>
          <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
        </div>
      ) : (
        <div className="row g-3">
          {filteredOrders.map(order => (
            <div key={order.id} className="col-12">
              <div className="card border-0 shadow-sm">
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderHistory