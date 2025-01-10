import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import JoditEditor from 'jodit-react';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useCategories from '../../../Hooks/useCategories';
import useMainCategories from '../../../Hooks/useMainCategories';
import useSubCategories from '../../../Hooks/useSubCategories';

export default function AddProduct({ setAdd, setReload, presentProduct }) {
    const axiosPublic = useAxiosPublic();
    const [mainCategories] = useMainCategories();
    const [categories] = useCategories();
    const [subCategories] = useSubCategories();
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [cost, setCost] = useState(0);
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
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState([]);

    useEffect(()=>{
        setSelectedCategory(
            categories?.filter(item => item?.mainCategory === mainCategory)
        )
    },[categories, mainCategory])

    useEffect(()=>{
        setSelectedSubCategory(
            subCategories?.filter(item => item?.category === type)
        )
    },[subCategories, type])

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        setImages(prevImages => [...prevImages, ...files]);
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
        setLoading(true);

        try {
            let uploadedImageURLs = [];

            // Upload images one by one
            for (const image of images) {
                const imageURL = await uploadImage(image);
                uploadedImageURLs.push(imageURL);
            }

            // Create new product with uploaded file URLs
            const newProduct = {
                name,
                price:parseInt(price),
                quantity:parseInt(quantity),
                mainCategory,
                category: type,
                subCategory,
                description,
                details,
                cost:parseInt(cost),
                images: uploadedImageURLs,
                discount: parseFloat(discount),
                number: parseInt(presentProduct) + 1,
            };
            const response = await axiosPublic.post('/products', newProduct);

            if (response?.data?.insertedId) {
                setMessage('Product added successfully');
                setName('');
                setPrice(0);
                setQuantity(0);
                setCost(0);
                setMainCategory('');
                setType('');
                setSubCategory("");
                setDescription('');
                setDetails('');
                setImages([]);
                setDiscount(0);
                setAdd(false);
                setReload(true);
            } else {
                console.error('Response data did not contain expected fields:', response.data);
                setMessage('Failed to add product');
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="py-5">
            <Helmet>
                <title>All About Craft BD | Add Product</title>
            </Helmet>
            <h2 className="text-center text-4xl font-bold mb-5">Create a Product</h2>

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
                            <option value="">Select Main Category</option>{" "}
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
                            <option value="">Select Category</option>{" "}
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
                            <option value="">Select Sub Category</option>{" "}
                            {
                                selectedSubCategory?.map((category, idx) =>
                                    <option key={idx} value={category?.name}>{category?.name}</option>
                                )
                            }
                        </select>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/2 pr-2">
                        <label className="text-lg font-medium">Quantity:</label><br />
                        <input
                            className="p-2 rounded bg-gray-200 w-full"
                            name="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            placeholder='Enter The Product Quantity'
                        />
                    </div>
                    <div className="lg:w-1/2 pl-2">
                        <label className="text-lg font-medium">Total Cost:</label><br />
                        <input
                            className="p-2 rounded bg-gray-200 w-full"
                            name="cost"
                            type="number"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            required
                            placeholder='Enter The Product Cost'
                        />
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/2 pr-2">
                        <label className="text-lg font-medium">Price:</label><br />
                        <input
                            className="p-2 rounded bg-gray-200 w-full"
                            name="price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            placeholder='Enter The Product Price'
                        />
                    </div>
                    <div className="lg:w-1/2 pl-2">
                        <label className="text-lg font-medium">Discount (%):</label><br />
                        <input
                            className="p-2 rounded bg-gray-200 w-full"
                            name="discount"
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            required
                            placeholder='Enter The Product Discount'
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

                <div>
                    <label className="text-lg font-medium">Product Images: ({images.length})</label><br />
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
                    {images.length > 0 && (
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
                        Add Product
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
