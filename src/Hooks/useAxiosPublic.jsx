import axios from "axios";

const axiosPublic = axios.create({
    baseURL:'https://all-about-back.vercel.app'
})
const useAxiosPublic = () => {
    return axiosPublic;
}; 

export default useAxiosPublic;