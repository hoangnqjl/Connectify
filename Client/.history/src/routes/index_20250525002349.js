import LoginPage from "@/pages/Auth/Login"
import HomePage from "@/pages/HomePage"
import LaptopPage from "@/pages/LaptopPage"
import MobilePage from "@/pages/MobilePage"
import BuyPage from "@/pages/BuyPage"
import SignupPage from "@/pages/Auth/Signup"
import ProducDetail from "@/pages/ProductDetail"
import ProducDetailLayout from "@/layout/ProductDetailLayout"
import OnlyHeaderLayout from "@/layout/OnlyHeaderLayout"
import Profile from "@/pages/Profile"
import LabTopLayout from "@/layout/LaptopLayout"
import CartPage from "@/pages/Cart"
import OrderHistory from "@/pages/OrderHistory"

// Admin imports
import AdminLayout from "@/layout/AdminLayout"
import AdminDashboard from "@/pages/Admin/Dashboard"


const publicRoutes = [
        { path: '/login', component : LoginPage,  layout: null},
        { path: '/signup', component : SignupPage,  layout: null},
        { path: '/', component : HomePage},
        { path: '/laptop', component : LaptopPage,layout: LabTopLayout},
        { path: '/mobile', component : MobilePage},
        { path: '/product/:id', component : ProducDetail ,layout : ProducDetailLayout},
        { path: '/profile', component : Profile ,layout : OnlyHeaderLayout},
]

const privateRoutes = [
        { path: '/buy/:id', component : BuyPage,layout : OnlyHeaderLayout},
        { path: '/cart', component : CartPage,layout : OnlyHeaderLayout},
        { path: '/orders', component : OrderHistory,layout : OnlyHeaderLayout},
]

export { publicRoutes ,privateRoutes}