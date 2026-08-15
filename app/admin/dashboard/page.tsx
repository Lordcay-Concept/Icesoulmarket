// app/admin/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  ShoppingBag, 
  Users, 
  CreditCard,
  Clock,
  TrendingUp,
  Euro
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // All queries now run with the real admin session attached, so RLS
  // policies requiring is_admin() actually pass instead of silently
  // returning empty results.
  const [
    { count: productCount },
    { data: orders },
    { data: users },
    { data: payments },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*'),
    supabase.from('payments').select('*, orders(*)'),
  ])

  const totalOrders = orders?.length || 0
  const totalUsers = users?.length || 0
  const totalProducts = productCount || 0

  const pendingPayments = payments?.filter((p: any) => 
    p.status === 'pending_verification' || p.status === 'pending'
  ).length || 0

  const totalRevenue = orders
    ?.filter((o: any) => o.status === 'completed' || o.status === 'payment_approved')
    .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  
  const monthlyRevenue = orders
    ?.filter((o: any) => {
      const orderDate = new Date(o.created_at)
      return (o.status === 'completed' || o.status === 'payment_approved') &&
             orderDate.getMonth() === thisMonth &&
             orderDate.getFullYear() === thisYear
    })
    .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-theme',
      bg: 'bg-theme/10',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      title: 'Pending Payments',
      value: pendingPayments,
      icon: CreditCard,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
  ]

  const revenueStats = [
    {
      title: 'Total Revenue',
      value: `€${totalRevenue.toFixed(2)}`,
      icon: Euro,
      color: 'text-theme',
      bg: 'bg-theme/10',
    },
    {
      title: 'This Month',
      value: `€${monthlyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
  ]

  const recentOrders = orders?.slice(0, 5) || []

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
      case 'payment_approved':
        return 'bg-theme/20 text-theme'
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
          <span className="text-theme neon-glow">Dashboard</span>
        </h1>
        <p className="text-gray-400 mt-1">Welcome back, Admin!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass border-theme/10 rounded-2xl">
            <CardContent className="p-5">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {revenueStats.map((stat) => (
          <Card key={stat.title} className="glass border-theme/10 rounded-2xl">
            <CardContent className="p-5">
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

      <Card className="glass border-theme/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-theme" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No orders yet</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-theme/5 border border-theme/10 hover:bg-theme/10 transition-colors">
                  <div>
                    <p className="text-white font-medium">#{order.order_number}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.order_items?.length || 0} items
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-theme font-bold">
                      €{order.total_amount?.toFixed(2) || '0.00'}
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