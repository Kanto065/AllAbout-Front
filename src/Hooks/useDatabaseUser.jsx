import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";
import useAuth from "./useAuth";

const useDatabaseUser = () => {
    const {user} = useAuth()
    const axiosPublic = useAxiosPublic()
    const {refetch ,data: databaseUser = {}} = useQuery({ 
        queryKey: ["databaseUser", user?.email], 
        queryFn: async () =>{
            const res = await axiosPublic.get(`/Users/${user?.email}`)
            return res.data;
        }
    })
    return [databaseUser, refetch];
};
export default useDatabaseUser;