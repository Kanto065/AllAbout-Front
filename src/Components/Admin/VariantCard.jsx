import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaImage, FaTrash } from 'react-icons/fa';
import ProductSearchDropdown from './ProductSearchDropdown';

export default function VariantCard({ variant, index, isMain, mainCategory, category, excludeProductIds = [], onChange, onRemove, canRemove }) {
    const [imagePreviewsLocal, setImagePreviewsLocal] = useState([]);

    const handleFieldChange = (field, value) => {
        onChange(index, { ...variant, [field]: value });
    };

    const handleImageChange = (e) => {
        console.log('Image change triggered, files:', e.target.files);
        const files = Array.from(e.target.files);

        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviewsLocal(prev => [...prev, ...previews]);

        // Add files to variant
        const currentImages = variant.imageFiles || [];
        const updatedFiles = [...currentImages, ...files];
        onChange(index, { ...variant, imageFiles: updatedFiles });
        console.log('Updated variant with new images, total files:', updatedFiles.length);
    };

    const handleRemoveNewImage = (imageIndex) => {
        console.log('Removing new image at index:', imageIndex);
        const currentFiles = variant.imageFiles || [];
        const newFiles = currentFiles.filter((_, i) => i !== imageIndex);

        const newPreviews = imagePreviewsLocal.filter((_, i) => i !== imageIndex);
        setImagePreviewsLocal(newPreviews);

        onChange(index, { ...variant, imageFiles: newFiles });
        console.log('Updated imageFiles:', newFiles);
    };

    const handleRemoveExistingImage = (imageIndex) => {
        console.log('Removing existing image at index:', imageIndex, 'Current images:', variant.existingImages);
        const currentImages = variant.existingImages || [];
        const newImages = currentImages.filter((_, i) => i !== imageIndex);
        onChange(index, { ...variant, existingImages: newImages });
        console.log('Updated existingImages:', newImages);
    };

    const handleAttributeChange = (key, value) => {
        const newAttributes = { ...variant.variantAttributes, [key]: value };
        onChange(index, { ...variant, variantAttributes: newAttributes });
    };

    const handleAddAttribute = () => {
        const key = prompt('Enter attribute name (e.g., "color", "size"):');
        if (key && key.trim()) {
            handleAttributeChange(key.trim(), '');
        }
    };

    const handleRemoveAttribute = (key) => {
        const newAttributes = { ...variant.variantAttributes };
        delete newAttributes[key];
        onChange(index, { ...variant, variantAttributes: newAttributes });
    };

    // Calculate profit margin
    const profitMargin = variant.price && variant.cost
        ? ((variant.price - variant.cost) / variant.price * 100).toFixed(1)
        : 0;



    return (
        <div className={`bg-white p-6 rounded-lg shadow-md border-2 ${isMain ? 'border-yellow-400' : 'border-gray-200'}`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold flex items-center gap-2">
                    Variant {index + 1}
                    {isMain && (
                        <span className="text-sm bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-normal">
                            ⭐ Main Product
                        </span>
                    )}
                </h4>
            </div>

            {/* Variant Source Toggle - Only show if categories are provided */}
            {mainCategory && category && (
                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <label className="text-sm font-medium block mb-2">Variant Source:</label>
                    <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name={`variant-source-${index}`}
                                value="new"
                                checked={!variant.isExisting}
                                onChange={() => {
                                    onChange(index, {
                                        name: '',
                                        price: 0,
                                        cost: 0,
                                        quantity: 0,
                                        discount: 0,
                                        imageFiles: [],
                                        variantAttributes: {},
                                        isExisting: false
                                    });
                                }}
                                className="mr-2"
                            />
                            <span className="text-sm">Create New Variant</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name={`variant-source-${index}`}
                                value="existing"
                                checked={variant.isExisting === true}
                                onChange={() => {
                                    onChange(index, { ...variant, isExisting: true });
                                }}
                                className="mr-2"
                            />
                            <span className="text-sm">Select Existing Product</span>
                        </label>
                    </div>

                    {variant.isExisting && (
                        <div className="mt-3">
                            <ProductSearchDropdown
                                mainCategory={mainCategory}
                                category={category}
                                onSelect={(product) => {
                                    onChange(index, {
                                        ...variant,
                                        name: product.name,
                                        price: product.price,
                                        cost: product.cost,
                                        quantity: product.quantity,
                                        discount: product.discount || 0,
                                        existingImages: product.images,
                                        isExisting: true,
                                        existingProductId: product._id
                                    });
                                }}
                                excludeIds={excludeProductIds}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Product Name */}
            <div className="mb-4">
                <label className="text-sm font-medium block mb-1">
                    Product Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    className="p-2 rounded bg-gray-100 w-full border border-gray-300 focus:border-blue-500 focus:outline-none"
                    value={variant.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    required
                    placeholder="e.g., Alcohol Ink - Blue"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the full product name including variant details</p>
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div>
                    <label className="text-sm font-medium block mb-1">
                        Price (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        className="p-2 rounded bg-gray-100 w-full border border-gray-300 focus:border-blue-500 focus:outline-none"
                        value={variant.price}
                        onChange={(e) => handleFieldChange('price', e.target.value)}
                        required
                        min="0"
                        placeholder="80"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-1">
                        Cost (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        className="p-2 rounded bg-gray-100 w-full border border-gray-300 focus:border-blue-500 focus:outline-none"
                        value={variant.cost}
                        onChange={(e) => handleFieldChange('cost', e.target.value)}
                        required
                        min="0"
                        placeholder="35"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-1">
                        Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        className="p-2 rounded bg-gray-100 w-full border border-gray-300 focus:border-blue-500 focus:outline-none"
                        value={variant.quantity}
                        onChange={(e) => handleFieldChange('quantity', e.target.value)}
                        required
                        min="0"
                        placeholder="10"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-1">
                        Discount (%)
                    </label>
                    <input
                        type="number"
                        className="p-2 rounded bg-gray-100 w-full border border-gray-300 focus:border-blue-500 focus:outline-none"
                        value={variant.discount}
                        onChange={(e) => handleFieldChange('discount', e.target.value)}
                        min="0"
                        max="100"
                        placeholder="0"
                    />
                </div>
            </div>

            {/* Profit Margin Display */}
            {variant.price > 0 && variant.cost > 0 && (
                <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700">
                        💰 Profit Margin: <strong>{profitMargin}%</strong> (৳{variant.price - variant.cost} per unit)
                    </p>
                </div>
            )}

            {/* Images Section */}
            <div className="mb-4">
                <label className="text-sm font-medium block mb-2">
                    Product Images <span className="text-red-500">*</span>
                </label>

                {/* Existing Images (for selected existing products) */}
                {variant.existingImages && variant.existingImages.length > 0 && (
                    <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2 bg-blue-50 p-2 rounded border border-blue-200">
                            📸 Existing Product Images
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {variant.existingImages.map((img, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={img}
                                        alt={`Existing ${idx + 1}`}
                                        className="w-full h-20 object-cover rounded border-2 border-blue-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                        title="Remove image"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Image Previews */}
                {imagePreviewsLocal.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                        {imagePreviewsLocal.map((preview, idx) => (
                            <div key={idx} className="relative group">
                                <img
                                    src={preview}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-20 object-cover rounded border border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveNewImage(idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <FaTrash className="text-xs" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                    <FaImage className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                        {imagePreviewsLocal.length > 0 ? 'Add More Images' : 'Upload Images'}
                    </span>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                    />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                    Upload multiple images for this variant. First image will be the main image.
                </p>
            </div>

            {/* Variant Attributes */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Variant Attributes</label>
                    <button
                        type="button"
                        onClick={handleAddAttribute}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                    >
                        + Add Attribute
                    </button>
                </div>

                {Object.keys(variant.variantAttributes || {}).length > 0 ? (
                    <div className="space-y-2">
                        {Object.entries(variant.variantAttributes || {}).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                                <input
                                    type="text"
                                    className="p-2 rounded bg-gray-100 w-1/3 border border-gray-300"
                                    value={key}
                                    disabled
                                    placeholder="Attribute name"
                                />
                                <input
                                    type="text"
                                    className="p-2 rounded bg-gray-100 flex-1 border border-gray-300 focus:border-blue-500 focus:outline-none"
                                    value={value}
                                    onChange={(e) => handleAttributeChange(key, e.target.value)}
                                    placeholder="Value"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAttribute(key)}
                                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">
                        No attributes added. Click "Add Attribute" to add variant-specific attributes like color, size, etc.
                    </p>
                )}
            </div>
        </div>
    );
}
