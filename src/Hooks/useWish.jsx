import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import useAuth from "./useAuth";

const useWish = () => {
    const axiosPublic = useAxiosPublic();
    const { user } = useAuth();

    const { refetch, data: wish = [] } = useQuery({
        queryKey: ["wish", user?.email],  // Ensure the query re-runs only when the user email changes
        queryFn: async () => {
            if (!user?.email) return []; // Prevent unnecessary API calls
            const res = await axiosPublic.get(`/wishlist?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email, // Only run query if user email exists
    });

    return [wish, refetch];
};

export default useWish;