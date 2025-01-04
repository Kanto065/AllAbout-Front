import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useBanners = () => {
    const axiosPublic = useAxiosPublic();
    const {refetch ,data: banners = []} = useQuery({
        queryKey: ["banners"],
        queryFn: async () =>{
            const res = await axiosPublic.get(`/banners`) 
            return res.data;
        }
    })
    return [banners, refetch];
};

export default useBanners;