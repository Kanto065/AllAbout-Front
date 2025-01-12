import { Helmet } from "react-helmet-async";
import UpdateCategory from "./UpdateCategory";
import { useState } from "react";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import axios from "axios";
import useMainCategories from "../../../Hooks/useMainCategories";
import UpdateMainCategory from "./UpdateMainCategory";

const MainCategories = () => { 
    const [mainCategories, refetch] = useMainCategories();
    const [add, setAdd] = useState(false);
    const [loader, setLoader] = useState(false);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState(null);
    const axiosPublic = useAxiosPublic();

    const handleIconChange = (event) => {
        setIcon(event.target.files[0]);
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('https://server.allaboutcraftbd.com/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return `https://server.allaboutcraftbd.com/uploads/${response.data.file.filename}`; // Adjust according to your server response
        } catch (error) {
            throw new Error('File upload failed');
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setLoader(true);

        try {
            let iconURL = '';

            // Upload icon image
            if (icon) {
                iconURL = await uploadImage(icon);
            }

            // Create new category with uploaded icon URL
            const newCategory = {
                name,
                image: iconURL, // Assuming the icon image is used as the logo
            };

            const response = await axiosPublic.post('/maincategories', newCategory);

            if (response?.data?.insertedId) {
                Swal.fire({
                    icon: 'success',
                    title: 'Category added successfully',
                });
                setName('');
                setIcon(null);
                setAdd(false);
                refetch();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to add category',
                });
            }
        } catch (error) {
            console.error('Error adding category:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to add category',
            });
        } finally {
            setLoader(false);
        }
    };

    return (
        <div>
            <Helmet>
                <title>All About Craft BD | Main Categories</title>
            </Helmet>
            <div className="flex justify-between">
                <h3 className="text-3xl font-medium">All Main Categories</h3>
                <button
                    onClick={() => setAdd(true)}
                    className={`text-white text-lg bg-[#C480CF] hover:bg-[#cb63db] py-1 px-4 rounded-[30px] font-bold duration-500 raleway ${add && 'hidden'}`}
                >
                    Add One
                </button>
            </div>
            <div>
                <div className={`${add || 'hidden'}`}>
                    <form className="space-y-2 overflow-hidden py-4 relative" onSubmit={handleFormSubmit}>
                        <div className="">
                            <label className="text-lg font-bold">Name:</label><br />
                            <input
                                type="text"
                                placeholder="Enter Category Name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border mt-1 p-2 rounded-lg w-full"
                                required
                            />
                        </div>
                        <div className="pb-4">
                            <label className="text-lg font-bold">Image:</label><br />
                            <input
                                type="file"
                                placeholder="Category Image"
                                name="icon"
                                onChange={handleIconChange}
                                className="border mt-1 p-2 rounded-lg w-full"
                                required
                            />
                        </div>
                        <button type="submit" className={`text-white text-lg bg-[#C480CF] hover:bg-[#cb63db] py-1 px-4 rounded-[30px] font-bold duration-500 raleway`}>
                            <span>{loader ? 'Adding...' : 'Add'}</span>
                            {loader && <p className="border-t rounded-xl border-black border-solid w-4 h-4 animate-spin ml-2"></p>}
                        </button>
                        <p onClick={() => setAdd(false)} className="absolute top-0 right-0 h-8 w-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded-full">X</p>
                    </form>
                </div>
            </div>
            <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                {mainCategories?.map((category, idx) => (
                    <li key={idx} className="space-x-2 p-2 shadow-lg rounded">
                        <div className="flex flex-col items-center">
                            {/* Icon */}
                            <img className="h-20 w-20 mb-4 rounded-full" src={category?.image} alt={category?.name} />
                            {/* Name */}
                            <h3 className="text-xl font-semibold">{category?.name}</h3>
                            {/* Description */}
                            <p className="text-gray-600 text-sm mt-2">{category?.description}</p>
                        </div>
                        <UpdateMainCategory category={category} refetch={refetch} />
                    </li>
                ))}
            </ul>
            {mainCategories?.length === 0 && (
                <div className="flex items-center justify-center">
                    <img className="h-64 w-64 rounded-full" src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif" alt="" />
                </div>
            )}
        </div>
    );
};

export default MainCategories;
