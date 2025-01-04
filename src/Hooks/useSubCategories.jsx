import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useSubCategories = () => {
    const axiosPublic = useAxiosPublic()
    const {refetch ,data: subCategories = []} = useQuery({
        queryKey: ["subCategories"],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/subCategories`)
            return res.data;
        }
    })
    return [subCategories, refetch];
};

export default useSubCategories;