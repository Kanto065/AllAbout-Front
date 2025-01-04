import { FaFacebook } from "react-icons/fa";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Footer() {
    const handleSubscribe = (e) => {
        e.preventDefault();
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "You subscribed successfully 🙂🙂🙂",
            showConfirmButton: false,
            timer: 1500
        });
        const form = e.target;
        form.email.value = '';
    }

    return (
        <footer className="bg-gray-200 pb-16 lg:pb-0 py-5">
            <div className="max-w-[90%] 2xl:max-w-7xl mx-auto">
                <img className='max-h-40 lg:max-h-52 mx-auto' src="/images/logo&icons/tukitaki-logo-08.png" alt="" />
                <div className="flex md:justify-center md:text-center">
                    <div className="space-y-5">
                        <h2 className="text-2xl text-[#303049] font-semibold border-l-4 pl-1 lg:pl-0 md:border-none border-[#885283]">Contact Us</h2>
                        <div className="text-[#747474] space-y-2">
                            <p>Khilgaon, Dhaka, Banglasesh</p>
                            <p>Call Us: <span className="text-[#303049] font-bold">+8801332043604</span></p>
                            <p>allaboutcraftbd@gmail.com</p>
                        </div>
                    </div>
                </div>
                <div className="flex md:justify-center mt-3">
                    <Link to={"https://www.facebook.com/AllaboutcraftBD"} className="flex items-center font-bold"><FaFacebook className="text-2xl mr-1" />Facebook</Link>
                </div>
                <div>
                    <hr />
                    <p className="text-center text-lg py-5">All Copyright © 2024 <span className="text-[#885283]">All About Craft BD</span></p>
                </div>
            </div>
        </footer>
    )
}
