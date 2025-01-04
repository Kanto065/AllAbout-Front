import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout"
import Home from "../Page/Home/Home";
import Products from "../Page/Products/Products";
import ProductDetails from "../Page/ProductDetails/ProductDetails";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "../Layouts/Dashboard";
import Profile from "../Page/Dashboard/Profile";
import EditProfile from "../Page/Dashboard/EditProfile";
import Cart from "../Page/Dashboard/User/Cart";
import Purchase from "../Page/Dashboard/User/Purchase";
import OrderedProduct from "../Page/Dashboard/Admin/OrderedProduct";
import AllProduct from "../Page/Dashboard/Admin/AllProduct";
import UpdateProduct from "../Page/Dashboard/Admin/UpdateProduct";
import Categories from "../Page/Dashboard/Admin/Categories";
import AllUsers from "../Page/Dashboard/Admin/AllUsers";
import Login from "../Page/Login/Login";
import CreateUser from "../Page/Login/CreateUser";
import ForgotPass from "../Page/Login/ForgotPass";
import Wish from "../Page/Dashboard/User/Wish";
import MainCategories from "../Page/Dashboard/Admin/MainCategories";
import SubCategories from "../Page/Dashboard/Admin/SubCategories";
import AllTopSells from "../Page/Dashboard/Admin/AllTopSells";
import Banners from "../Page/Dashboard/Admin/Banners";
import Sold from "../Page/Dashboard/Admin/Sold";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/products',
        element: <Products />
      },
      {
        path: '/products/:name',
        element: <ProductDetails />
      },
      {
        path: '/dashboard',
        element: <PrivateRoute><Dashboard /></PrivateRoute> ,
        children: [
          {
            path:"/dashboard",
            element: <Profile />
          },
          {
            path:"/dashboard/editprofile",
            element: <EditProfile />
          },
          {
            path:"/dashboard/cart",
            element: <Cart />
          },
          {
            path:"/dashboard/purchase",
            element: <Purchase />
          },
          {
            path:"/dashboard/wishlist",
            element: <Wish />
          },
          {
            path: '/dashboard/Admin',
            children: [
              {
                path: '/dashboard/Admin/orders',
                element: <OrderedProduct />
              },
              {
                path: '/dashboard/Admin/sold',
                element: <Sold />
              },
              {
                path: '/dashboard/Admin/allProducts',
                element: <AllProduct />
              },
              {
                path: '/dashboard/Admin/allProducts/:pname',
                element: <UpdateProduct />
              },
              {
                path: '/dashboard/Admin/allTopSells',
                element: <AllTopSells />
              },
              {
                path: '/dashboard/Admin/allBanners',
                element: <Banners />
              },
              {
                path: '/dashboard/Admin/allcategories',
                element: <Categories />
              },
              {
                path: '/dashboard/Admin/allmaincategories',
                element: <MainCategories />
              },
              {
                path: '/dashboard/Admin/allsubcategories',
                element: <SubCategories />
              },
              {
                path: '/dashboard/Admin/allusers',
                element: <AllUsers />
              }
            ]
          }
        ]
      },

      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/signup',
        element: <CreateUser />
      },
      {
        path: '/forget',
        element: <ForgotPass />
      },
    ]

  }
]);
export default router;