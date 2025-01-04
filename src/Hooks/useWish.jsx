import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import useAuth from "./useAuth";
import { useEffect } from "react";

const useWish = () => {
    const axiosPublic = useAxiosPublic();
    const {user} = useAuth();
    const {refetch ,data: wish = []} = useQuery({
        queryKey: ["wish"],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/wishlist?email=${user?.email}`)
            return res.data;
        }
    })
    useEffect(()=>{ 
        refetch();
    },[user, refetch])
    return [wish, refetch];
};

export default useWish;