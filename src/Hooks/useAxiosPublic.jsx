import axios from "axios";

const axiosPublic = axios.create({
    //baseURL:'https://all-about-back-v2.vercel.app/'
    baseURL:'http://localhost:5000/'
})
const useAxiosPublic = () => {
    return axiosPublic;
}; 

export default useAxiosPublic;