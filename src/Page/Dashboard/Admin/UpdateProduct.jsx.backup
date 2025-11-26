import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import JoditEditor from 'jodit-react';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import Swal from 'sweetalert2';
import useCategories from '../../../Hooks/useCategories';
import useMainCategories from '../../../Hooks/useMainCategories';
import useSubCategories from '../../../Hooks/useSubCategories';

export default function UpdateProduct() {
    const axiosPublic = useAxiosPublic();
    const [mainCategories] = useMainCategories();
    const [categories] = useCategories();
    const [subCategories] = useSubCategories();
    const { pname } = useParams(); // Assuming you use URL params to get the product ID
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [mainCategory, setMainCategory] = useState('');
    const [type, setType] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [description, setDescription] = useState('');
    const [details, setDetails] = useState(``);
    const [images, setImages] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [update, setUpdate] = useState(false);
    const [id, setId] = useState('');
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState([]);
    const [variantInputs, setVariantInputs] = useState([
        { name: '', image: null, quantity: 0 }, // Initial input
    ]);

    const handleVariantNameChange = (index, value) => {
        const updatedVariants = [...variantInputs];
        updatedVariants[index].name = value;
        setVariantInputs(updatedVariants);
    };

    const handleVariantQuantityChange = (index, value) => {
        const updatedVariants = [...variantInputs];
        updatedVariants[index].quantity = value;
        setVariantInputs(updatedVariants);
    };

    const handleVariantImageChange = (index, file) => {
        const updatedVariants = [...variantInputs];
        updatedVariants[index].image = file;
        setVariantInputs(updatedVariants);
    };

    const handleAddVariantInput = () => {
        setVariantInputs([...variantInputs, { name: '', image: null, quantity: 0 }]);
    };

    const handleRemoveVariantInput = (index) => {
        const updatedVariants = variantInputs.filter((_, i) => i !== index);
        setVariantInputs(updatedVariants);
    };

    useEffect(() => {
        setSelectedCategory(
            categories?.filter(item => item?.mainCategory === mainCategory)
        );
    }, [categories, mainCategory]);

    useEffect(() => {
        setSelectedSubCategory(
            subCategories?.filter(item => item?.category === type)
        );
    }, [subCategories, type]);

    useEffect(() => {
        // Fetch the existing product data when the component mounts
        const fetchProductData = async () => {
            try {
                const response = await axiosPublic.get(`/products/${pname}`);
                const product = response.data;

                setName(product?.name || "");
                setPrice(product?.price || 0);
                setQuantity(product?.quantity || 0);
                setMainCategory(product?.mainCategory || "");
                setType(product?.category || "");
                setSubCategory(product?.subCategory || "");
                setDescription(product?.description || "");
                setVariantInputs(product?.variants ? Object.entries(product.variants).map(([name, { image, quantity }]) => ({ name, image, quantity })) : []);
                setDetails(product?.details || "");
                setImages(product?.images.map(img => ({ name: img, url: img })) || []);
                setDiscount(product?.discount || 0);
                setId(product?._id);
            } catch (error) {
                setMessage('Failed to fetch product data');
            }
        };

        fetchProductData();
        setUpdate(false);
    }, [pname, axiosPublic, update]);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        setImages(prevImages => [...prevImages, ...files]);
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
            return `https://server.allaboutcraftbd.shop/uploads/${response.data.file.filename}`;
        } catch (error) {
            // Log detailed error information
            console.error('File upload failed:', error.response ? error.response.data : error.message);
            throw new Error('File upload failed');
        }
    };
    

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
    
        try {
            let uploadedImageURLs = [];
    
            // Upload images one by one
            for (const image of images) {
                if (image instanceof File) {
                    const imageURL = await uploadImage(image);
                    uploadedImageURLs.push(imageURL);
                } else {
                    // Keep existing image URLs
                    uploadedImageURLs.push(image.url);
                }
            }
    
            const uploadedVariantImages = await Promise.all(
                variantInputs.map(async (variant) => {
                    if (variant.image instanceof File) {
                        // Upload new file
                        return await uploadImage(variant.image);
                    } else if (typeof variant.image === 'string') {
                        // Keep existing URL
                        return variant.image;
                    }
                    return null;
                })
            );
    
            const variants = variantInputs.reduce((acc, variant, index) => {
                if (variant.name && uploadedVariantImages[index]) {
                    acc[variant.name] = {
                        image: uploadedVariantImages[index],
                        quantity: variant.quantity
                    };
                }
                return acc;
            }, {});
    
            // Create updated product with uploaded file URLs
            const updatedProduct = {
                name,
                price: parseInt(price),
                quantity: parseInt(quantity),
                mainCategory,
                category: type,
                subCategory,
                description,
                details,
                variants,
                images: uploadedImageURLs,
                discount: parseFloat(discount),
            };
    
            const response = await axiosPublic.patch(`/updateProduct/${id}`, updatedProduct);
    
            if (response?.data?.modifiedCount > 0) {
                setUpdate(true);
                navigate(`/products/${name}`);
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: `Product Updated Successfully!😊😊`,
                    showConfirmButton: false,
                    timer: 1000
                });
            } else {
                console.error('Response data did not contain expected fields:', response.data);
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: `Product Update Failed!😢😢`,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 2xx
                console.error('Server Error:', error.response.data);
                setMessage(`Server Error: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // No response was received
                console.error('Network Error:', error.message);
                setMessage('Network Error: Unable to connect to the server');
            } else {
                // Something else caused the error
                console.error('Error:', error.message);
                setMessage('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <div className="py-5 max-w-[95%] 2xl:max-w-7xl mx-auto">
            <Helmet>
                <title>All About Craft BD | Update Product</title>
            </Helmet>
            <h2 className="text-center text-4xl font-bold mb-5">Update Product</h2>

            <form className="space-y-4" onSubmit={handleFormSubmit}>
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/2 pr-2">
                        <label className="text-lg font-medium">Name:</label><br />
                        <input
                            className="p-2 rounded bg-gray-200 w-full"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder='Enter The Product Name'
                        />
                    </div>

                    <div className="lg:w-1/2 pl-2">
                        <label className="text-lg font-medium">Main Category:</label><br />
                        <select
                            className="p-2 rounded bg-gray-200 w-full"
                            name="mainCategory"
                            value={mainCategory}
                            onChange={(e) => setMainCategory(e.target.value)}
                            required
                            placeholder='Enter The Product Category'
                        >
                            <option value="">Select Main Category</option>
                            {
                                mainCategories?.map((category, idx) =>
                                    <option key={idx} value={category?.name}>{category?.name}</option>
                                )
                            }
                        </select>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/2 pr-2">
                        <label className="text-lg font-medium">Category:</label><br />
                        <select
                            className="p-2 rounded bg-gray-200 w-full"
                            name="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                            placeholder='Enter The Product Category'
                        >
                            <option value="">Select Category</option>
                            {
                                selectedCategory?.map((category, idx) =>
                                    <option key={idx} value={category?.name}>{category?.name}</option>
                                )
                            }
                        </select>
                    </div>
                    <div className="lg:w-1/2 pl-2">
                        <label className="text-lg font-medium">Sub Category:</label><br />
                        <select
                            className="p-2 rounded bg-gray-200 w-full"
                            name="subcategory"
                            value={subCategory}
                            onChange={(e) => setSubCategory(e.target.value)}
                            placeholder='Enter The Product Category'
                        >
                            <option value="">Select Sub Category</option>
                            {
                                selectedSubCategory?.map((category, idx) =>
                                    <option key={idx} value={category?.name}>{category?.name}</option>
                                )
                            }
                        </select>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/3 pr-2">
                        <label className="text-lg font-medium">Quantity:</label><br />
                        <input
                            className="p-2 rounded bg-gray-200 w-full"
                            name="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="lg:w-1/3 px-2">
                        <label className="text-lg font-medium">Price:</label><br />
                        <input
                            className="p-2 rounded bg-gray-200 w-full"
                            name="price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div className="lg:w-1/3 pl-2">
                        <label className="text-lg font-medium">Discount (%):</label><br />
                        <input
                            className="p-2 rounded bg-gray-200 w-full"
                            name="discount"
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="">
                    <label className="text-lg font-medium">Description:</label><br />
                    <textarea
                        className="p-2 rounded bg-gray-200 w-full"
                        name="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        placeholder='Enter The Product Description'
                    />
                </div>

                <div className="py-5">
                    {/* Add Variant Button */}
                    <button
                        type="button"
                        className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
                        onClick={handleAddVariantInput}
                    >
                        {variantInputs.length === 0 ? 'Add Product Variant' : 'Add Another Product Variant'}
                    </button>

                    {/* Render Variant Inputs Only If Present */}
                    {variantInputs.map((variant, index) => (
                        <div key={index} className="flex flex-col lg:flex-row items-center mb-4">
                            <div className="lg:w-1/3 pr-2">
                                <label className="text-lg font-medium">Variant Name:</label>
                                <input
                                    className="p-2 rounded bg-gray-200 w-full"
                                    type="text"
                                    value={variant.name}
                                    onChange={(e) => handleVariantNameChange(index, e.target.value)}
                                    placeholder="Enter Variant Name"
                                />
                            </div>
                            <div className="lg:w-1/3 px-2">
                                <label className="text-lg font-medium">Variant Quantity:</label>
                                <input
                                    className="p-2 rounded bg-gray-200 w-full"
                                    type="number"
                                    value={variant.quantity}
                                    onChange={(e) => handleVariantQuantityChange(index, e.target.value)}
                                    placeholder="Enter Variant Quantity"
                                />
                            </div>
                            <div className="lg:w-1/3 pl-2 flex items-center">
                                <div>
                                    <label className="text-lg font-medium">Variant Image:</label>
                                    <div className="flex flex-col lg:flex-row items-center">
                                        <input
                                            className="p-2 rounded bg-gray-200 w-full"
                                            type="file"
                                            onChange={(e) => handleVariantImageChange(index, e.target.files[0])}
                                        />
                                        <button
                                            type="button"
                                            className="ml-4 px-4 py-2 bg-red-500 text-white rounded"
                                            onClick={() => handleRemoveVariantInput(index)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <label className="text-lg font-medium">Product Images: ({images?.length})</label><br />
                    <input
                        className="p-2 rounded bg-gray-200 w-full"
                        name="images"
                        type="file"
                        multiple
                        onChange={handleImageChange}
                    />
                    <button
                        type="button"
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
                        onClick={() => setImages([])}
                    >
                        Clear Images
                    </button>
                    {images?.length > 0 && (
                        <div>
                            {images.map((file, index) => (
                                <div key={index}>File selected: {file.name}</div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <label className="text-lg font-medium">Details:</label><br />
                    <JoditEditor
                        value={details}
                        onBlur={newContent => setDetails(newContent)}
                        tabIndex={1}
                        onChange={newContent => { }}
                    />
                </div>
                <div className="flex justify-center">
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded flex items-center">
                        Update Product
                        {loading && (
                            <div className="w-10 h-10 flex gap-1 items-center justify-center ml-2">
                                <div className="w-2 h-2 animate-[bounce_.6s_linear_.2s_infinite] bg-sky-600 rounded-full"></div>
                                <div className="w-2 h-2 animate-[bounce_.6s_linear_.3s_infinite] bg-sky-600 rounded-full"></div>
                                <div className="w-2 h-2 animate-[bounce_.6s_linear_.4s_infinite] bg-sky-600 rounded-full"></div>
                            </div>
                        )}
                    </button>
                </div>
                {message && <p className="text-center mt-2 text-red-600">{message}</p>}
            </form>
        </div>
    );
}
