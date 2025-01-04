import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useCategories = () => {
    const axiosPublic = useAxiosPublic()
    const {refetch ,data: categories = []} = useQuery({
        queryKey: ["categories"],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/categories`)
            return res.data;
        }
    })
    return [categories, refetch];
};

export default useCategories;