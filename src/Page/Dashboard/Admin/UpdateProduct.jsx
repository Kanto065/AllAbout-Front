import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import JoditEditor from 'jodit-react';
import { FaImage } from 'react-icons/fa';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import Swal from 'sweetalert2';
import useCategories from '../../../Hooks/useCategories';
import useMainCategories from '../../../Hooks/useMainCategories';
import useSubCategories from '../../../Hooks/useSubCategories';
import ProductGroupStep1Combined from '../../../Components/Admin/ProductGroupStep1Combined';

// Component for editing product groups
function ProductGroupEditForm({ groupData, navigate, axiosPublic }) {
    const [sharedInfo, setSharedInfo] = useState({
        productGroupName: groupData.mainProduct.productGroupName || '',
        mainCategory: groupData.mainProduct.mainCategory,
        category: groupData.mainProduct.category,
        subCategory: groupData.mainProduct.subCategory || '',
        description: groupData.mainProduct.description || '',
        details: groupData.mainProduct.details || ''
    });

    const [variants, setVariants] = useState(
        groupData.variants.map(v => ({
            name: v.name,
            price: v.price,
            cost: v.cost,
            quantity: v.quantity,
            discount: v.discount || 0,
            imageFiles: [],
            existingImages: v.images || [],
            variantAttributes: v.variantAttributes || {},
            _id: v._id,
            isExisting: false
        }))
    );

    const [groupImageFiles, setGroupImageFiles] = useState([]);
    const [existingGroupImages, setExistingGroupImages] = useState(groupData.mainProduct.groupImages || []);

    const [loading, setLoading] = useState(false);

    // Upload single image to server
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

    const handleSave = async () => {
        try {
            setLoading(true);

            // Upload new group images
            let uploadedGroupImageUrls = [];
            if (groupImageFiles.length > 0) {
                for (const file of groupImageFiles) {
                    const url = await uploadImage(file);
                    uploadedGroupImageUrls.push(url);
                }
            }
            const finalGroupImages = [...existingGroupImages, ...uploadedGroupImageUrls];

            // Update shared info for all products in group
            await axiosPublic.put(`/products/group/${groupData.productGroupId}`, {
                sharedInfo: { ...sharedInfo, groupImages: finalGroupImages }
            });

            // Update each variant
            for (const variant of variants) {
                // Upload new images first if any
                let uploadedImageUrls = [];
                if (variant.imageFiles && variant.imageFiles.length > 0) {
                    for (const imageFile of variant.imageFiles) {
                        const imageUrl = await uploadImage(imageFile);
                        uploadedImageUrls.push(imageUrl);
                    }
                }

                // Combine existing images with newly uploaded ones
                const allImages = [...(variant.existingImages || []), ...uploadedImageUrls];

                if (variant._id) {
                    // Update existing variant in group
                    await axiosPublic.patch(`/products/variant/${variant._id}`, {
                        name: variant.name,
                        price: variant.price,
                        cost: variant.cost,
                        quantity: variant.quantity,
                        discount: variant.discount,
                        variantAttributes: variant.variantAttributes,
                        images: allImages // Send combined image URLs
                    });
                } else if (variant.isExisting && variant.existingProductId) {
                    // Case 1: Selected existing product -> Move to this group
                    await axiosPublic.patch(`/products/variant/${variant.existingProductId}`, {
                        productGroupId: groupData.productGroupId,
                        isMainProduct: false,
                        name: variant.name,
                        price: variant.price,
                        cost: variant.cost,
                        quantity: variant.quantity,
                        discount: variant.discount,
                        variantAttributes: variant.variantAttributes,
                        images: allImages
                    });
                } else {
                    // Case 2: Brand new variant -> Create it
                    const newVariantData = {
                        name: variant.name,
                        price: variant.price,
                        cost: variant.cost,
                        quantity: variant.quantity,
                        discount: variant.discount,
                        variantAttributes: variant.variantAttributes,
                        productGroupId: groupData.productGroupId,
                        mainCategory: sharedInfo.mainCategory,
                        category: sharedInfo.category,
                        subCategory: sharedInfo.subCategory,
                        images: allImages // Include images for new variant
                    };

                    await axiosPublic.post('/products/variant', newVariantData);
                }
            }

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Product group updated successfully',
                timer: 1500,
                showConfirmButton: false
            });

            setTimeout(() => {
                navigate('/dashboard/admin/allproducts');
            }, 1500);
        } catch (error) {
            console.error('Error updating product group:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update product group'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-2">Edit Product Group</h2>
                <p className="text-gray-600">Update product group information and manage variants</p>
            </div>

            <ProductGroupStep1Combined
                sharedInfo={sharedInfo}
                setSharedInfo={setSharedInfo}
                variants={variants}
                setVariants={setVariants}
                groupImageFiles={groupImageFiles}
                setGroupImageFiles={setGroupImageFiles}
                existingGroupImages={existingGroupImages}
                onRemoveExistingGroupImage={(idx) => setExistingGroupImages(prev => prev.filter((_, i) => i !== idx))}
                onNext={handleSave}
                onCancel={() => navigate('/dashboard/admin/allproducts')}
                isEditMode={true}
                loading={loading}
            />
        </div>
    );
}

export default function UpdateProduct() {
    const axiosPublic = useAxiosPublic();
    const [mainCategories] = useMainCategories();
    const [categories] = useCategories();
    const [subCategories] = useSubCategories();
    const { pname } = useParams();
    const navigate = useNavigate();

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

    const [productId, setProductId] = useState('');
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    // Product group detection
    const [isProductGroup, setIsProductGroup] = useState(false);
    const [groupData, setGroupData] = useState(null);

    // Filter categories based on selected main category
    const filteredCategories = useMemo(() => {
        return categories?.filter(cat => cat?.mainCategory === formData.mainCategory) || [];
    }, [categories, formData.mainCategory]);

    // Filter subcategories based on selected category
    const filteredSubCategories = useMemo(() => {
        return subCategories?.filter(sub => sub?.category === formData.category) || [];
    }, [subCategories, formData.category]);

    // Fetch product data
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setFetchLoading(true);
                const response = await axiosPublic.get(`/products/${pname}`);
                const product = response.data;

                // Check if product is part of a group
                if (product.productGroupId) {
                    // Fetch full group data - no need to redirect, just load the group editor
                    const groupResponse = await axiosPublic.get(`/products/group/${product.productGroupId}`);
                    setIsProductGroup(true);
                    setGroupData(groupResponse.data);
                    setProductId(product._id);
                } else {
                    // Standalone product - use existing form
                    setIsProductGroup(false);
                    setFormData({
                        name: product?.name || '',
                        mainCategory: product?.mainCategory || '',
                        category: product?.category || '',
                        subCategory: product?.subCategory || '',
                        price: product?.price || 0,
                        cost: product?.cost || 0,
                        quantity: product?.quantity || 0,
                        discount: product?.discount || 0,
                        description: product?.description || '',
                        details: product?.details || ''
                    });

                    setProductId(product?._id);
                    setExistingImages(product?.images || []);
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load product data'
                });
            } finally {
                setFetchLoading(false);
            }
        };

        fetchProductData();
    }, [pname, axiosPublic, navigate]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);

        // Create previews
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
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

        try {
            // Upload new images
            const uploadedNewImages = [];
            for (const image of newImages) {
                const imageURL = await uploadImage(image);
                uploadedNewImages.push(imageURL);
            }

            // Combine existing and new images
            const allImages = [...existingImages, ...uploadedNewImages];

            if (allImages.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Images',
                    text: 'Please add at least one image'
                });
                setLoading(false);
                return;
            }

            // Create updated product
            const updatedProduct = {
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
                images: allImages
            };

            const response = await axiosPublic.patch(`/updateProduct/${productId}`, updatedProduct);

            if (response?.data?.modifiedCount > 0) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Product Updated Successfully! 😊',
                    showConfirmButton: false,
                    timer: 1500
                });
                setTimeout(() => {
                    navigate('/dashboard/admin/allproducts');
                }, 1500);
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'No Changes',
                    text: 'No changes were made to the product'
                });
            }
        } catch (error) {
            console.error('Error updating product:', error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'An error occurred while updating the product'
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="py-5 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-5">
            <Helmet>
                <title>All About Craft BD | Update Product</title>
            </Helmet>

            {isProductGroup ? (
                /* Product Group Edit Form */
                <ProductGroupEditForm
                    groupData={groupData}
                    navigate={navigate}
                    axiosPublic={axiosPublic}
                />
            ) : (
                /* Standalone Product Edit Form */
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Update Product</h3>
                        <p className="text-gray-600 mb-6">
                            Update product information. For products with variants, edit them individually.
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

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div>
                            <label className="text-lg font-medium block mb-2">
                                Current Images ({existingImages.length})
                            </label>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                {existingImages.map((image, idx) => (
                                    <div key={idx} className="relative group">
                                        <img
                                            src={image}
                                            alt={`Existing ${idx + 1}`}
                                            className="w-full h-20 object-cover rounded border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Images */}
                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Add New Images
                        </label>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`New ${idx + 1}`}
                                            className="w-full h-20 object-cover rounded border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(idx)}
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
                                onChange={handleNewImageChange}
                            />
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload additional images or replace existing ones.
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
                            onClick={() => navigate('/dashboard/admin/allproducts')}
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
                                    Updating...
                                </>
                            ) : (
                                'Update Product'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
