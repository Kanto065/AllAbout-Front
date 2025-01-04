import { useEffect, useRef } from "react";
import { FaList } from "react-icons/fa";
import { Link } from "react-router-dom";
import useOrderedProduct from "../../../Hooks/useOrderedProduct";
import NotificationSound from "../../../assets/notification-sound.mp3";

const Alert = () => {
    const [orderedProduct] = useOrderedProduct();
    const audioRef = useRef(null);

    useEffect(() => {
        // Check if orderedProduct length changed
        const prevLength = localStorage.getItem("prevOrderedProductLength") || 0;

        if (orderedProduct.length !== prevLength) {
            // Play the audio
            audioRef.current.play();
        }

        // Update the stored length for the next comparison
        localStorage.setItem("prevOrderedProductLength", orderedProduct.length);
    }, [orderedProduct]);

    return (
        <div>
            <Link to={"/dashboard/orderedProduct"} className='relative'>
                <FaList className="md:text-3xl"></FaList>
                <p className='absolute -top-3 -right-2 px-1 text-xs text-black font-semibold bg-[#fecd28] rounded-full'>{orderedProduct?.length}</p>
                <audio ref={audioRef} src={NotificationSound} />
            </Link>
        </div>
    );
};

export default Alert;
