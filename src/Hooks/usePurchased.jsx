import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosPublic from "./useAxiosPublic";

const usePurchased = () => { 
    const axiosPublic = useAxiosPublic()
    const {user} = useAuth()
    const {refetch ,data: purchased = []} = useQuery({
        queryKey: ["purchased", user?.email],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/orders/${user?.email}`)
            return res.data;
        }
    })
    let reload = refetch ;
    return [purchased, refetch, reload];
};

export default usePurchased;