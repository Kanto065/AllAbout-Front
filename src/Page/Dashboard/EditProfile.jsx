import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDatabaseUser from "../../Hooks/useDatabaseUser";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import axios from "axios";

const EditProfile = () => { 
    const [databaseUser, refetch] = useDatabaseUser();
    const [name, setName] = useState(databaseUser?.name || '');
    const [phone, setPhone] = useState(databaseUser?.phone || '');
    const [location, setLocation] = useState(databaseUser?.location || '');
    const [image, setImage] = useState(null);
    const [loader, setLoader] = useState(false);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    useEffect(() => {
        setName(databaseUser?.name || '');
        setPhone(databaseUser?.phone || '');
        setLocation(databaseUser?.location || '');
    }, [databaseUser]);

    const handleImageChange = (event) => {
        setImage(event.target.files[0]);
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('https://server.allaboutcraftbd.shop/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.url;
        } catch (error) {
            throw new Error('File upload failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);

        try {
            let imageUrl = databaseUser?.image;

            // Upload new image if selected
            if (image) {
                imageUrl = await uploadImage(image);
            }

            // Prepare updated user data
            const updatedUser = {
                name,
                phone,
                location,
                image: imageUrl,
            };

            // Update the user profile
            const response = await axiosPublic.patch(`/users/${databaseUser?._id}`, updatedUser);

            if (response?.data?.modifiedCount > 0) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated Successfully',
                });
                refetch();
                navigate('/dashboard');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to update profile',
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to update profile',
            });
        } finally {
            setLoader(false);
        }
    };

    return (
        <div className="max-w-[90%] 2xl:max-w-7xl mx-auto">
            <h3 className="text-3xl font-medium mb-8">Edit Profile</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="">
                    <label className="text-lg font-bold">Name:</label><br />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border mt-1 p-2 rounded-lg w-full"
                        required
                    />
                </div>
                <div className="">
                    <label className="text-lg font-bold">Phone:</label><br />
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border mt-1 p-2 rounded-lg w-full"
                        required
                    />
                </div>
                <div className="">
                    <label className="text-lg font-bold">Location:</label><br />
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border mt-1 p-2 rounded-lg w-full"
                        required
                    />
                </div>
                <div className="">
                    <label className="text-lg font-bold">Profile Image:</label><br />
                    <input
                        type="file"
                        onChange={handleImageChange}
                        className="border mt-1 p-2 rounded-lg w-full"
                    />
                </div>
                <button type="submit" className={`flex items-center bg-[#C480CF] text-white py-2 px-4 rounded-md`}>
                    <span>{loader ? 'Updating...' : 'Update Profile'}</span>
                    {loader && <p className="border-t rounded-xl border-black border-solid w-4 h-4 animate-spin ml-2"></p>}
                </button>
            </form>
        </div>
    );
};

export default EditProfile;
