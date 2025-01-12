import { MdFavoriteBorder, MdOutlineFavorite } from "react-icons/md";
import useWish from "../../Hooks/useWish"
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import useDatabaseUser from "../../Hooks/useDatabaseUser";
import useAuth from "../../Hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Wish({ id }) {
    const axiosPublic = useAxiosPublic();
    const [databaseUser] = useDatabaseUser();
    const [wish, refetch] = useWish(); 
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation()?.pathname;

    const handleDeleteWish = async () => {
        if (!user) {
            // Redirect the user to login using navigate
            navigate("/login", { state: { from: location } });
            return;
        }
        axiosPublic.delete(`/wishlist?email=${databaseUser?.email}&productId=${id}`)
            .then(res => {
                if (res.data.deletedCount > 0) {
                    Swal.fire({
                        title: "Deleted!",
                        text: `this product has been deleted from your Wishlist.`,
                        icon: "success"
                    });
                    refetch();
                }
            })
    }

    const handleWish = async () => {
        if (!user) {
            // Redirect the user to login using navigate
            navigate("/login", { state: { from: location } });
            return;
        }

        if (wish?.find(item => item?._id === id)) {
            return handleDeleteWish();
        } else {
            const wish = {
                email: databaseUser?.email,
                productId: id
            };

            const response = await axiosPublic.post(`/wishlist`, wish);
            if (response?.data?.insertedId) {
                Swal.fire({
                    icon: 'success',
                    title: 'Wishlist Update  successfully',
                });
                refetch();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Update',
                });
            }
        }
    }

    return (
        <div
        onClick={handleWish}
        className="text-red-600 shadow-[#8d8d8d] shadow p-2 rounded-full text-lg md:text-xl flex items-center justify-center"
    >
        {wish?.find(item => item?._id === id) ? (
            <MdOutlineFavorite size={24} />
        ) : (
            <MdFavoriteBorder size={24} />
        )}
    </div>
    )
}
