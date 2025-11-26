import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import JoditEditor from 'jodit-react';
import { FaImage } from 'react-icons/fa';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useCategories from '../../../Hooks/useCategories';
import useMainCategories from '../../../Hooks/useMainCategories';
import useSubCategories from '../../../Hooks/useSubCategories';

export default function AddProduct({ setAdd, setReload }) {
    const axiosPublic = useAxiosPublic();
    const [mainCategories] = useMainCategories();
    const [categories] = useCategories();
    const [subCategories] = useSubCategories();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mainCategory: '',
        category: '',
        subCategory: '',
        price: 0,
        cost: 0,
        quantity: 0,
        discount: 0,
        description: '',
        details: ''
    });

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Filter categories based on selected main category
    const filteredCategories = useMemo(() => {
        return categories?.filter(cat => cat?.mainCategory === formData.mainCategory) || [];
    }, [categories, formData.mainCategory]);

    // Filter subcategories based on selected category
    const filteredSubCategories = useMemo(() => {
        return subCategories?.filter(sub => sub?.category === formData.category) || [];
    }, [subCategories, formData.category]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);

        // Create previews
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
            console.error('Image upload failed:', error);
            throw new Error('Image upload failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Upload all images
            const uploadedImages = [];
            for (const image of images) {
                const imageURL = await uploadImage(image);
                uploadedImages.push(imageURL);
            }

            // Create product
            const newProduct = {
                name: formData.name,
                mainCategory: formData.mainCategory,
                category: formData.category,
                subCategory: formData.subCategory || '',
                price: parseInt(formData.price),
                cost: parseInt(formData.cost),
                quantity: parseInt(formData.quantity),
                discount: parseFloat(formData.discount),
                description: formData.description,
                details: formData.details || '',
                images: uploadedImages
            };

            const response = await axiosPublic.post('/products', newProduct);

            if (response?.data?.insertedId) {
                setMessage('Product added successfully!');
                setTimeout(() => {
                    setAdd(false);
                    setReload(true);
                }, 1500);
            } else {
                setMessage('Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            setMessage('An error occurred while adding the product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-5">
            <Helmet>
                <title>All About Craft BD | Add Product</title>
            </Helmet>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto">
                <div>
                    <h3 className="text-2xl font-bold mb-4">Add Single Product</h3>
                    <p className="text-gray-600 mb-6">
                        Add a single product without variants. For products with variants, use "Add Product With Variants".
                    </p>
                </div>

                {/* Product Name */}
                <div>
                    <label className="text-lg font-medium block mb-2">
                        Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className="p-2 rounded bg-gray-200 w-full"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        placeholder="Enter product name"
                    />
                </div>

                {/* Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Main Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="p-2 rounded bg-gray-200 w-full"
                            value={formData.mainCategory}
                            onChange={(e) => {
                                handleChange('mainCategory', e.target.value);
                                handleChange('category', '');
                                handleChange('subCategory', '');
                            }}
                            required
                        >
                            <option value="">Select Main Category</option>
                            {mainCategories?.map((category, idx) => (
                                <option key={idx} value={category?.name}>
                                    {category?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="p-2 rounded bg-gray-200 w-full"
                            value={formData.category}
                            onChange={(e) => {
                                handleChange('category', e.target.value);
                                handleChange('subCategory', '');
                            }}
                            required
                            disabled={!formData.mainCategory}
                        >
                            <option value="">Select Category</option>
                            {filteredCategories?.map((category, idx) => (
                                <option key={idx} value={category?.name}>
                                    {category?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Sub Category <span className="text-gray-500">(Optional)</span>
                        </label>
                        <select
                            className="p-2 rounded bg-gray-200 w-full"
                            value={formData.subCategory}
                            onChange={(e) => handleChange('subCategory', e.target.value)}
                            disabled={!formData.category}
                        >
                            <option value="">Select Sub Category</option>
                            {filteredSubCategories?.map((category, idx) => (
                                <option key={idx} value={category?.name}>
                                    {category?.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Price (৳) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            className="p-2 rounded bg-gray-200 w-full"
                            value={formData.price}
                            onChange={(e) => handleChange('price', e.target.value)}
                            required
                            min="0"
                            placeholder="80"
                        />
                    </div>

                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Cost (৳) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            className="p-2 rounded bg-gray-200 w-full"
                            value={formData.cost}
                            onChange={(e) => handleChange('cost', e.target.value)}
                            required
                            min="0"
                            placeholder="35"
                        />
                    </div>

                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            className="p-2 rounded bg-gray-200 w-full"
                            value={formData.quantity}
                            onChange={(e) => handleChange('quantity', e.target.value)}
                            required
                            min="0"
                            placeholder="10"
                        />
                    </div>

                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Discount (%)
                        </label>
                        <input
                            type="number"
                            className="p-2 rounded bg-gray-200 w-full"
                            value={formData.discount}
                            onChange={(e) => handleChange('discount', e.target.value)}
                            min="0"
                            max="100"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Profit Margin Display */}
                {formData.price > 0 && formData.cost > 0 && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-700">
                            💰 Profit Margin: <strong>{((formData.price - formData.cost) / formData.price * 100).toFixed(1)}%</strong> (৳{formData.price - formData.cost} per unit)
                        </p>
                    </div>
                )}

                {/* Images */}
                <div>
                    <label className="text-lg font-medium block mb-2">
                        Product Images <span className="text-red-500">*</span>
                    </label>

                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                            {imagePreviews.map((preview, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={preview}
                                        alt={`Preview ${idx + 1}`}
                                        className="w-full h-20 object-cover rounded border border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload Button with Dashed Border */}
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                        <FaImage className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                            {imagePreviews.length > 0 ? 'Add More Images' : 'Upload Images'}
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            required={images.length === 0}
                        />
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                        Upload multiple images. First image will be the main image.
                    </p>
                </div>

                {/* Description */}
                <div>
                    <label className="text-lg font-medium block mb-2">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="p-2 rounded bg-gray-200 w-full"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        required
                        placeholder="Enter a brief description of the product"
                    />
                </div>

                {/* Details */}
                <div>
                    <label className="text-lg font-medium block mb-2">
                        Detailed Information <span className="text-gray-500">(Optional)</span>
                    </label>
                    <JoditEditor
                        value={formData.details}
                        onBlur={(newContent) => handleChange('details', newContent)}
                        tabIndex={1}
                        onChange={() => { }}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => setAdd(false)}
                        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Adding...
                            </>
                        ) : (
                            'Add Product'
                        )}
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}
