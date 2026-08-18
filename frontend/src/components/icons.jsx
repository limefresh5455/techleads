import {
  BarChart3,
  Cloud,
  Code2,
  CreditCard,
  Folder,
  Globe,
  Layout,
  List,
  Mail,
  Megaphone,
  MessageCircle,
  Search,
  Server,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
} from 'lucide-react'

const ICONS = {
  'message-circle': MessageCircle,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  layout: Layout,
  store: Store,
  'bar-chart-3': BarChart3,
  users: Users,
  'credit-card': CreditCard,
  mail: Mail,
  cloud: Cloud,
  megaphone: Megaphone,
  server: Server,
  shield: Shield,
  search: Search,
  list: List,
  folder: Folder,
  globe: Globe,
  code: Code2,
  sparkles: Sparkles,
  '//': Search,
}

export function Icon({ name, className = 'w-5 h-5', style }) {
  const Cmp = ICONS[name] || Globe
  return <Cmp className={className} style={style} />
}

export function formatCount(n) {
  return new Intl.NumberFormat('en-US').format(n || 0)
}
