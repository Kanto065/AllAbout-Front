import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useTopSells = () => {
    const axiosPublic = useAxiosPublic();
    const {refetch ,data: topSells = []} = useQuery({
        queryKey: ["topSells"],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/topsells`) 
            return res.data;
        }
    })
    return [topSells, refetch];
};

export default useTopSells;