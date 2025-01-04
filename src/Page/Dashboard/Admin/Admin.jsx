import { FaList, FaUsers } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import usePurchased from "../../../Hooks/usePurchased";
import { MdLocalOffer } from "react-icons/md";
import useSold from "../../../Hooks/useSold";
// import useOrderedProduct from "../../../Hooks/useOrderedProduct";
// import useSoldProducts from "../../../Hooks/useSoldProducts";

const Admin = ({ setMenu }) => {
    const [purchased] = usePurchased();
    const [sold] = useSold();
    const location = useLocation().pathname
    return (
        <ul> 
            <li onClick={() => setMenu(false)}>
                <NavLink to={"/dashboard/Admin/orders"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard/Admin/orders" && "bg-slate-200"}`}><FaList className="mr-1"></FaList>Ordered Product({purchased?.length})</NavLink>
            </li>
            <li onClick={() => setMenu(false)}>
                <NavLink to={"/dashboard/admin/sold"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard/admin/sold" && "bg-slate-200"}`}><FaList className="mr-1"></FaList>Sold Product({sold?.length})</NavLink>
            </li>
            <li onClick={() => setMenu(false)}>
                <NavLink to={"/dashboard/admin/allusers"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard/admin/allusers" && "bg-slate-200"}`}><FaUsers className="mr-1"></FaUsers>All Users</NavLink>
            </li>
            <li>
                <NavLink to={"/dashboard/Admin/allmaincategories"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard/Admin/allmaincategories" && "bg-slate-200"}`}><FaList className="mr-1"></FaList>All Main Categories</NavLink>
            </li>
            <li>
                <NavLink to={"/dashboard/admin/allcategories"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard/admin/allcategories" && "bg-slate-200"}`}><FaList className="mr-1"></FaList>All Categories</NavLink>
            </li>
            <li>
                <NavLink to={"/dashboard/Admin/allsubcategories"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard/Admin/allsubcategories" && "bg-slate-200"}`}><FaList className="mr-1"></FaList>All Sub Categories</NavLink>
            </li>
            <li onClick={() => setMenu(false)}>
                <NavLink to={"/dashboard/admin/allproducts"} className={`flex items-center p-1 hover:bg-slate-200 ${location == "/dashboard/admin/allproducts" && "bg-slate-200"}`}><FaList className="mr-1"></FaList>All Products</NavLink>
            </li>
            <li onClick={() => setMenu(false)}>
                <NavLink to={"/dashboard/Admin/allTopSells"} className={`flex items-center p-1 hover:bg-slate-200 ${location == "/dashboard/Admin/allTopSells" && "bg-slate-200"}`}><FaList className="mr-1"></FaList>All Featured</NavLink>
            </li>
            <li>
                <NavLink to={"/dashboard/Admin/allBanners"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard/Admin/allBanners" && "bg-slate-200"}`}><MdLocalOffer className="mr-1"></MdLocalOffer>Banners</NavLink>
            </li>
        </ul>
    );
};

export default Admin;