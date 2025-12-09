import { useState } from 'react';
import axios from 'axios';
import useAxiosPublic from '../../Hooks/useAxiosPublic';

export default function ProductGroupStep3({
    sharedInfo,
    groupImageFiles,
    variants,
    onBack,
    onCancel,
    setAdd,
    setReload,
    loading,
    setLoading,
    message,
    setMessage
}) {
    const axiosPublic = useAxiosPublic();
    const [saveAsDraft, setSaveAsDraft] = useState(false);

    // Upload a single image
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

    const handlePublish = async (isDraft = false) => {
        setLoading(true);
        setMessage('');
        setSaveAsDraft(isDraft);

        try {
            // Upload group images first
            let groupImageUrls = [];
            if (groupImageFiles && groupImageFiles.length > 0) {
                setMessage('Uploading group images...');
                for (const file of groupImageFiles) {
                    const imageURL = await uploadImage(file);
                    groupImageUrls.push(imageURL);
                }
            } else if (sharedInfo.groupImages && sharedInfo.groupImages.length > 0) {
                // Use existing group images (for edit mode)
                groupImageUrls = sharedInfo.groupImages;
            }

            // Upload all images for all variants
            setMessage('Uploading variant images...');
            const variantsWithUploadedImages = await Promise.all(
                variants.map(async (variant) => {
                    let finalImages = [];

                    // Handle existing product images
                    if (variant.isExisting && variant.existingImages) {
                        // Use existing product's images
                        finalImages = variant.existingImages;
                    } else if (variant.imageFiles && variant.imageFiles.length > 0) {
                        // Upload new images for new products
                        for (const file of variant.imageFiles) {
                            const imageURL = await uploadImage(file);
                            finalImages.push(imageURL);
                        }
                    }

                    return {
                        name: variant.name,
                        price: parseInt(variant.price),
                        cost: parseInt(variant.cost),
                        quantity: parseInt(variant.quantity),
                        discount: parseFloat(variant.discount || 0),
                        images: finalImages,
                        variantAttributes: variant.variantAttributes || {},
                        // CRITICAL: Pass existingProductId to backend
                        existingProductId: variant.existingProductId || null
                    };
                })
            );

            // Create product group
            setMessage('Creating product group...');
            const productGroupData = {
                sharedInfo: {
                    productGroupName: sharedInfo.productGroupName,
                    mainCategory: sharedInfo.mainCategory,
                    category: sharedInfo.category,
                    subCategory: sharedInfo.subCategory || '',
                    description: sharedInfo.description,
                    details: sharedInfo.details || '',
                    groupImages: groupImageUrls
                },
                variants: variantsWithUploadedImages,
                status: isDraft ? 'draft' : 'active'
            };

            // DEBUG: Log data being sent
            console.log('🔍 DEBUG: Sending product group data:', JSON.stringify(productGroupData, null, 2));
            console.log('🔍 DEBUG: Group images:', groupImageUrls);
            console.log('🔍 DEBUG: Variants count:', variantsWithUploadedImages.length);
            variantsWithUploadedImages.forEach((v, i) => {
                console.log(`🔍 DEBUG: Variant ${i}:`, {
                    name: v.name,
                    hasExistingId: !!v.existingProductId,
                    existingProductId: v.existingProductId,
                    hasImages: v.images?.length > 0,
                    imageCount: v.images?.length
                });
            });

            const response = await axiosPublic.post('/products/group', productGroupData);

            if (response.data.success) {
                setMessage(`Product group ${isDraft ? 'saved as draft' : 'published'} successfully!`);
                setTimeout(() => {
                    setAdd(false);
                    setReload(true);
                }, 2000);
            } else {
                setMessage('Failed to create product group. Please try again.');
            }
        } catch (error) {
            console.error('Error creating product group:', error);
            setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totalQuantity = variants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0);
    const prices = variants.map(v => parseFloat(v.price) || 0).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const totalCost = variants.reduce((sum, v) => sum + (parseInt(v.cost) || 0) * (parseInt(v.quantity) || 0), 0);
    const totalRevenue = variants.reduce((sum, v) => sum + (parseInt(v.price) || 0) * (parseInt(v.quantity) || 0), 0);
    const totalProfit = totalRevenue - totalCost;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-2">Review & Publish</h3>
                <p className="text-gray-600">
                    Review all information before publishing your product group.
                </p>
            </div>

            {/* Product Group Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-bold mb-4">Product Group Summary</h4>

                {/* Product Group Name */}
                <div className="mb-4 p-4 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600 mb-1">Product Group Name</p>
                    <p className="text-xl font-bold text-blue-700">{sharedInfo.productGroupName}</p>
                </div>

                {/* Group Images Preview */}
                {((groupImageFiles && groupImageFiles.length > 0) || (sharedInfo.groupImages && sharedInfo.groupImages.length > 0)) && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Product Group Images</p>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                            {/* Existing images */}
                            {sharedInfo.groupImages && sharedInfo.groupImages.map((url, index) => (
                                <img
                                    key={`existing-${index}`}
                                    src={url}
                                    alt={`Group image ${index + 1}`}
                                    className="w-full h-20 object-cover rounded border-2 border-gray-300"
                                />
                            ))}
                            {/* New images */}
                            {groupImageFiles && groupImageFiles.map((file, index) => (
                                <img
                                    key={`new-${index}`}
                                    src={URL.createObjectURL(file)}
                                    alt={`New group image ${index + 1}`}
                                    className="w-full h-20 object-cover rounded border-2 border-blue-500"
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">
                            {sharedInfo.mainCategory} → {sharedInfo.category}
                            {sharedInfo.subCategory && ` → ${sharedInfo.subCategory}`}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Variants</p>
                        <p className="font-medium">{variants.length} products</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Stock</p>
                        <p className="font-medium">{totalQuantity} units</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Price Range</p>
                        <p className="font-medium">
                            {minPrice === maxPrice ? `৳${minPrice}` : `৳${minPrice} - ৳${maxPrice}`}
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded mb-4">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-sm">{sharedInfo.description}</p>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded">
                    <div>
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="text-lg font-bold text-red-600">৳{totalCost}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Potential Revenue</p>
                        <p className="text-lg font-bold text-blue-600">৳{totalRevenue}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Potential Profit</p>
                        <p className="text-lg font-bold text-green-600">৳{totalProfit}</p>
                    </div>
                </div>
            </div>

            {/* Variants List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-bold mb-4">Variants ({variants.length})</h4>

                <div className="space-y-3">
                    {variants.map((variant, index) => (
                        <div
                            key={index}
                            className={`p-4 border rounded ${index === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Image Preview */}
                                {variant.imageFiles && variant.imageFiles.length > 0 && (
                                    <img
                                        src={URL.createObjectURL(variant.imageFiles[0])}
                                        alt={variant.name}
                                        className="w-20 h-20 object-cover rounded border border-gray-300"
                                    />
                                )}

                                {/* Variant Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-bold">{variant.name}</h5>
                                        {index === 0 && (
                                            <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded">
                                                ⭐ Main
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">Price:</span>
                                            <span className="font-medium ml-1">৳{variant.price}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Cost:</span>
                                            <span className="font-medium ml-1">৳{variant.cost}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Quantity:</span>
                                            <span className="font-medium ml-1">{variant.quantity}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Discount:</span>
                                            <span className="font-medium ml-1">{variant.discount}%</span>
                                        </div>
                                    </div>

                                    {/* Attributes */}
                                    {Object.keys(variant.variantAttributes || {}).length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {Object.entries(variant.variantAttributes).map(([key, value]) => (
                                                <span key={key} className="text-xs bg-gray-200 px-2 py-1 rounded">
                                                    {key}: {value}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Warnings */}
            {totalQuantity < 10 && (
                <div className="bg-yellow-50 border border-yellow-300 p-4 rounded">
                    <p className="text-yellow-800">
                        ⚠️ <strong>Low Stock Alert:</strong> Total quantity is less than 10 units. Consider adding more stock.
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between bg-white p-6 rounded-lg shadow-md">
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                        disabled={loading}
                    >
                        ← Back
                    </button>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => handlePublish(true)}
                        className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading && saveAsDraft ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            'Save as Draft'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePublish(false)}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading && !saveAsDraft ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Publishing...
                            </>
                        ) : (
                            '✓ Publish Product Group'
                        )}
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}
