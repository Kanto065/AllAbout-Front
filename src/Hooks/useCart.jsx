import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import useAuth from "./useAuth";

const useCart = () => {
    const axiosPublic = useAxiosPublic();
    const {user} = useAuth();
    const {refetch ,data: cart = []} = useQuery({
        queryKey: ["cart"],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/cart?email=${user?.email}`)
            return res.data;
        }
    })
    return [cart, refetch];
};

export default useCart;