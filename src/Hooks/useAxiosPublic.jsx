import axios from "axios";

const axiosPublic = axios.create({
    baseURL:'https://all-about-back-v2.vercel.app/'
})
const useAxiosPublic = () => {
    return axiosPublic;
}; 

export default useAxiosPublic;