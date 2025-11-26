import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useAllProducts = (mainOnly = true) => {
    const axiosPublic = useAxiosPublic();
    const { refetch, data: allProducts = [] } = useQuery({
        queryKey: ["allProducts", mainOnly],
        queryFn: async () => {
            const res = await axiosPublic.get(`/products?mainOnly=${mainOnly}`)
            return res.data;
        }
    })
    return [allProducts, refetch];
};

export default useAllProducts;