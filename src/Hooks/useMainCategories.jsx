import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useMainCategories = () => {
    const axiosPublic = useAxiosPublic()
    const {refetch ,data: mainCategories = []} = useQuery({
        queryKey: ["mainCategories"],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/mainCategories`)
            return res.data;
        }
    })
    return [mainCategories, refetch];
};

export default useMainCategories;