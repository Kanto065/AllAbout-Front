import { FaShoppingCart } from "react-icons/fa";
import { MdFavoriteBorder } from "react-icons/md";
import { NavLink, useLocation } from "react-router-dom";
import useCart from "../../../Hooks/useCart";
import useWish from "../../../Hooks/useWish";
import usePurchased from "../../../Hooks/usePurchased";

const User = ({setMenu}) => {
    const [cart] = useCart(); 
    const [wish] = useWish();
    const [purchased] = usePurchased();
    const location = useLocation().pathname
    return (
        <ul>
            <li onClick={() => setMenu(false)}>
                <NavLink to={"/dashboard/cart"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard/cart" && "bg-slate-200"}`}><FaShoppingCart className="mr-1"></FaShoppingCart>My Cart({cart?.length})</NavLink>
            </li>
            <li onClick={() => setMenu(false)}>
                <NavLink to={"/dashboard/purchase"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard/purchase" && "bg-slate-200"}`}><FaShoppingCart className="mr-1"></FaShoppingCart>Purchased({purchased?.length})</NavLink>
            </li>
            <li onClick={() => setMenu(false)}>
                <NavLink to={"/dashboard/wishlist"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard/favorite" && "bg-slate-200"}`}><MdFavoriteBorder className="mr-1"></MdFavoriteBorder>My Favorite({wish?.length})</NavLink>
            </li>
        </ul>
    );
};

export default User;