import { IoMdAdd } from "react-icons/io";
import Swal from "sweetalert2";
import useAuth from "../../Hooks/useAuth";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import useDatabaseUser from "../../Hooks/useDatabaseUser";
import { useLocation, useNavigate } from "react-router-dom";
import useCart from "../../Hooks/useCart";

export default function Cart({id}) {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const [databaseUser, ] = useDatabaseUser();
    const [ ,refetch] = useCart();
    const navigate = useNavigate();
    const location = useLocation()?.pathname;
    
    const handleCart = async () => {
        if (!user) {
            // Redirect the user to login using navigate
            navigate("/login", { state: { from: location } });
            return;
        }

        const cart = {
            email: databaseUser?.email,
            productId: id,
            quantity: 1,
            code: "CODE1"
        };

        try {
            const response = await axiosPublic.post(`/cart`, cart);
            if (response?.data?.insertedId) {
                refetch();
                Swal.fire({
                    icon: 'success',
                    title: 'Product added to cart successfully',
                });
            } else if (response?.data?.status) {
                Swal.fire({
                    title: "You already added this on your cart successfully!",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Go Cart!"
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate(`/dashboard/cart`);
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to add product to cart',
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error adding product to cart',
            });
        }
    };
  return (
    <div className="bg-[#1E93D1] text-white rounded-full p-1 text-xl md:text-3xl">
      <IoMdAdd onClick={handleCart} />
    </div>
  )
}
