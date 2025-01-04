import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useAllProducts = () => {
    const axiosPublic = useAxiosPublic();
    const {refetch ,data: allProducts = []} = useQuery({
        queryKey: ["allProducts"],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/products`) 
            return res.data;
        }
    })
    return [allProducts, refetch];
};

export default useAllProducts;