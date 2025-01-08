import { IoMdAdd, IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import Swal from "sweetalert2";
import useAuth from "../../Hooks/useAuth";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import useDatabaseUser from "../../Hooks/useDatabaseUser";
import { useLocation, useNavigate } from "react-router-dom";
import useCart from "../../Hooks/useCart";
import { useState } from "react";

export default function Cart({ id }) {
    const { user } = useAuth();
    const axiosPublic = useAxiosPublic();
    const [databaseUser] = useDatabaseUser();
    const [, refetch] = useCart();
    const navigate = useNavigate();
    const location = useLocation()?.pathname;

    // State for selected color and favorite status
    const [selectedColor, setSelectedColor] = useState("");
    const [isFavorite, setIsFavorite] = useState(false); // State for favorite button

    const handleCart = async () => {
        if (!user) {
            // Redirect the user to login using navigate
            navigate("/login", { state: { from: location } });
            return;
        }

        if (!selectedColor) {
            Swal.fire({
                icon: 'warning',
                title: 'Please select a color',
            });
            return;
        }

        const cart = {
            email: databaseUser?.email,
            productId: id,
            quantity: 1,
            code: "CODE1",
            color: selectedColor, // Add the selected color to the cart object
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

    // Toggle favorite status
    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
        Swal.fire({
            icon: isFavorite ? 'info' : 'success',
            title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
        });
    };

    return (
        <div className="flex flex-col items-center space-y-2">
            {/* Favorite and Add to Cart Buttons */}
            <div className="flex items-center space-x-4">
                {/* Favorite Button */}
                <div 
                    className="text-xl cursor-pointer"
                    onClick={handleFavorite}
                >
                    {isFavorite ? (
                        <IoIosHeart color="red" size={24} /> // Filled heart for favorite
                    ) : (
                        <IoIosHeartEmpty size={24} /> // Empty heart for not favorited
                    )}
                </div>

                {/* Add to Cart Button */}
                <div 
                    className="bg-[#1E93D1] text-white rounded-full p-2 text-xl md:text-2xl cursor-pointer"
                    onClick={handleCart}
                >
                    <IoMdAdd size={24} />
                </div>
            </div>

            {/* Color selection dropdown */}
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Choose Color:
                </label>
                <select
                    className="border border-gray-300 rounded-md p-2 w-full"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                >
                    <option value="" disabled>Select a color</option>
                    <option value="Red">Red</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                </select>
            </div>
        </div>
    );
}
