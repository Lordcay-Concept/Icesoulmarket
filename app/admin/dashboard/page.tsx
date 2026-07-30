// app/admin/dashboard/page.tsx
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  ShoppingBag, 
  Users, 
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default async function AdminDashboard() {
  // Fetch real data
  const [products, orders, users, payments] = await Promise.all([
    DatabaseService.getProducts(),
    DatabaseService.getOrders('all'),
    DatabaseService.getUsers(),
    DatabaseService.getPayments(),
  ])

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      title: 'Pending Payments',
      value: payments.filter(p => p.status === 'pending_verification').length,
      icon: CreditCard,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
  ]

  // Recent orders
 const recentOrders = orders.slice(0, 5)

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
      case 'payment_approved':
        return 'bg-emerald-400/20 text-emerald-400'
      case 'pending_verification':
        return 'bg-yellow-400/20 text-yellow-400'
      case 'payment_rejected':
      case 'cancelled':
        return 'bg-red-400/20 text-red-400'
      default:
        return 'bg-blue-400/20 text-blue-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'payment_pending': return 'Awaiting Payment'
      case 'pending_verification': return 'Awaiting Approval'
      case 'payment_approved': return 'Order Confirmed'
      case 'payment_rejected': return 'Payment Issue'
      default: return status
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-emerald-400 neon-glow">Dashboard</span>
        </h1>
        <p className="text-gray-400 mt-1">Welcome back, Admin!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass border-emerald-400/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass border-emerald-400/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No orders yet</div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-emerald-400/5 border border-emerald-400/10">
                  <div>
                    <p className="text-white font-medium">#{order.order_number}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 font-bold">
                      €{order.total_amount.toFixed(2)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}