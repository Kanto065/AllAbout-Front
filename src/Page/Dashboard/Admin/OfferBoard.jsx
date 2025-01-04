import { Helmet } from "react-helmet-async";
import useOfferBoard from "../../../Hooks/useOfferBoard";
import { useRef, useState } from "react";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
const image_hosting_key = import.meta.env.VITE_Image_Hosting;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const OfferBoard = () => {
    const [offerBoard, refetch] = useOfferBoard()
    const [loader, setLoader] = useState(false)
    const axiosPublic = useAxiosPublic()
    const formRef = useRef(null);

    const handleOffer = async (e, offerId) => {
        setLoader(true)
        e.preventDefault();
        const hasImage = e.target.image.files.length > 0;
        if (hasImage) {
            const imageFile = { image: e.target.image.files[0] };
            const res = await axiosPublic.post(image_hosting_api, imageFile, {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            });
            if (res.data.success) {
                axiosPublic.patch(`/offerBoard/${offerId}`, { image: res.data.data.display_url })
                    .then(data => {
                        if (data.data.modifiedCount > 0) {
                            Swal.fire({
                                title: 'Success!',
                                text: 'Offer Update Successfully',
                                icon: 'success',
                                confirmButtonText: 'Yaaah'
                            })
                            refetch()
                            formRef.current.reset(); 
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            title: 'warning!',
                            text: `${error.message}`,
                            icon: 'warning',
                            confirmButtonText: 'Ok'
                        })
                    })
                setLoader(false)
            }
        }
    }

    return (
        <div className="lg:px-0">
            <Helmet>
                <title>Bornali | Offer Board</title>
            </Helmet>
            <h2 className="text-center text-3xl font-semibold my-4">Offer Board</h2>
            <div className="grid gap-5 my-10">
                {offerBoard?.map((item, idx) => (
                    <div key={idx} className="relative">
                        <form onSubmit={(e) => { handleOffer(e, item?._id) }} className="absolute right-0 top-0 flex items-center">
                            {/* File input for image selection */}
                            <input
                                type="file"
                                name="image"
                                className="border border-black p-1 rounded-b"
                            />
                            <button
                                type="submit"
                                className="flex items-center text-xl bg-slate-300 hover:font-bold py-2 px-4 rounded-bl-md  cursor-pointer"
                            >
                                <span>{loader || "Update"}</span>
                                {loader && (
                                    <p className="border-t rounded-xl border-black border-solid w-4 h-4 animate-spin"></p>
                                )}
                            </button>
                        </form>
                        {/* Display selected image */}
                        {item.image && <img className="rounded w-full" src={item.image} alt="" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OfferBoard;