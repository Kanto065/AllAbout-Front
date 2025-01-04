import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosPublic from "./useAxiosPublic";

const useSold = () => { 
    const axiosPublic = useAxiosPublic()
    const {user} = useAuth();
    const {refetch ,data: sold = []} = useQuery({
        queryKey: ["sold", user?.email],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/soldItems/${user?.email}`)
            return res.data;
        }
    })
    let reload = refetch ;
    return [sold, refetch, reload];
};

export default useSold;