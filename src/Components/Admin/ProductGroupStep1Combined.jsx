import { useState, useEffect, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import useMainCategories from '../../Hooks/useMainCategories';
import useCategories from '../../Hooks/useCategories';
import useSubCategories from '../../Hooks/useSubCategories';
import VariantCard from './VariantCard';

export default function ProductGroupStep1Combined({
    sharedInfo,
    setSharedInfo,
    variants,
    setVariants,
    onNext,
    onCancel,
    isEditMode = false
}) {
    const axiosPublic = useAxiosPublic();
    const [mainCategories] = useMainCategories();
    const [categories] = useCategories();
    const [subCategories] = useSubCategories();
    const [activeTab, setActiveTab] = useState(0);

    // Filter categories based on selected main category
    const filteredCategories = useMemo(() => {
        return categories?.filter(cat => cat?.mainCategory === sharedInfo.mainCategory) || [];
    }, [categories, sharedInfo.mainCategory]);

    // Filter subcategories based on selected category
    const filteredSubCategories = useMemo(() => {
        return subCategories?.filter(sub => sub?.category === sharedInfo.category) || [];
    }, [subCategories, sharedInfo.category]);

    const handleChange = (field, value) => {
        setSharedInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleVariantChange = (index, updatedVariant) => {
        const newVariants = [...variants];
        newVariants[index] = updatedVariant;
        setVariants(newVariants);
    };

    const handleAddVariant = () => {
        const newVariants = [
            ...variants,
            {
                name: '',
                price: 0,
                cost: 0,
                quantity: 0,
                discount: 0,
                imageFiles: [],
                variantAttributes: {}
            }
        ];
        setVariants(newVariants);
        setActiveTab(newVariants.length - 1); // Switch to new tab
    };


    const handleRemoveVariant = async (index) => {
        if (variants.length === 1) {
            Swal.fire({
                icon: 'warning',
                title: 'Cannot Remove',
                text: 'You must have at least one variant!',
            });
            return;
        }

        // Show modal with two options
        const result = await Swal.fire({
            title: 'What would you like to do?',
            text: `Choose an action for "${variants[index].name || `Variant ${index + 1}`}"`,
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'Delete Product',
            denyButtonText: 'Remove from Group',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc2626',
            denyButtonColor: '#16a34a',
            reverseButtons: true,
            html: `
                <p class="text-gray-600 mb-2">This action will:</p>
                <ul class="text-sm text-left mx-auto" style="max-width: 300px;">
                    <li class="mb-2">
                        <strong class="text-red-600">Delete Product:</strong> 
                        <span class="text-gray-600">Permanently remove the variant</span>
                    </li>
                    <li>
                        <strong class="text-green-600">Remove from Group:</strong> 
                        <span class="text-gray-600">Convert to standalone product</span>
                    </li>
                </ul>
            `
        });

        if (result.isConfirmed) {
            // Delete product completely
            const newVariants = variants.filter((_, i) => i !== index);
            setVariants(newVariants);
            if (activeTab >= newVariants.length) {
                setActiveTab(newVariants.length - 1);
            }
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Variant has been deleted.',
                timer: 1500,
                showConfirmButton: false
            });
        } else if (result.isDenied) {
            // Remove from group - create standalone product
            const variant = variants[index];

            // TODO: Call API to convert variant to standalone product
            // For now, just remove from UI
            const newVariants = variants.filter((_, i) => i !== index);
            setVariants(newVariants);
            if (activeTab >= newVariants.length) {
                setActiveTab(newVariants.length - 1);
            }

            Swal.fire({
                icon: 'success',
                title: 'Removed from Group!',
                text: 'Variant converted to standalone product.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    const handleMakeMain = async (index) => {
        const variant = variants[index];

        // If editing mode and variant has an ID, call API
        if (isEditMode && variant._id) {
            try {
                const result = await Swal.fire({
                    title: 'Make Main Product?',
                    text: `Set "${variant.name || `Variant ${index + 1}`}" as the main product?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Make Main',
                    confirmButtonColor: '#eab308',
                    cancelButtonText: 'Cancel'
                });

                if (result.isConfirmed) {
                    // Call API to change main product
                    const response = await axiosPublic.post(`/products/variant/${variant._id}/make-main`);

                    if (response.data.success) {
                        // Update local state
                        const newVariants = variants.map((v, i) => ({
                            ...v,
                            isMainProduct: i === index
                        }));
                        setVariants(newVariants);

                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Main product changed successfully.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    }
                }
            } catch (error) {
                console.error('Error changing main product:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to change main product. Please try again.'
                });
            }
        } else {
            // In create mode, just update local state
            const newVariants = variants.map((v, i) => ({
                ...v,
                isMainProduct: i === index
            }));
            setVariants(newVariants);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate shared info
        if (!sharedInfo.mainCategory || !sharedInfo.category || !sharedInfo.description) {
            alert('Please fill in all required fields in Product Group Information!');
            return;
        }

        // Validate variants
        const hasEmptyNames = variants.some(v => !v.name || v.name.trim() === '');
        if (hasEmptyNames) {
            alert('Please fill in all variant names!');
            return;
        }

        // Check images only for new variants (existing products already have images)
        const hasNoImages = variants.some(v => {
            // Skip check if variant has existing images
            if (v.existingImages && v.existingImages.length > 0) {
                return false;
            }
            // For new variants, check if they have uploaded images
            return !v.imageFiles || v.imageFiles.length === 0;
        });
        if (hasNoImages) {
            alert('Please upload at least one image for each variant!');
            return;
        }

        const hasInvalidPricing = variants.some(v => v.price <= 0 || v.cost < 0);
        if (hasInvalidPricing) {
            alert('Please enter valid prices and costs for all variants!');
            return;
        }

        const hasInvalidQuantity = variants.some(v => v.quantity < 0);
        if (hasInvalidQuantity) {
            alert('Please enter valid quantities for all variants!');
            return;
        }

        onNext();
    };

    // Calculate totals
    const totalQuantity = variants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0);
    const prices = variants.map(v => parseFloat(v.price) || 0).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Group Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-2">Product Group Information</h3>
                <p className="text-gray-600 mb-6">
                    This information will be shared across all variants in this product group.
                </p>

                {/* Categories Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Main Category */}
                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Main Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="p-2 rounded bg-gray-200 w-full"
                            value={sharedInfo.mainCategory}
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

                    {/* Category */}
                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="p-2 rounded bg-gray-200 w-full"
                            value={sharedInfo.category}
                            onChange={(e) => {
                                handleChange('category', e.target.value);
                                handleChange('subCategory', '');
                            }}
                            required
                            disabled={!sharedInfo.mainCategory}
                        >
                            <option value="">Select Category</option>
                            {filteredCategories?.map((category, idx) => (
                                <option key={idx} value={category?.name}>
                                    {category?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sub Category */}
                    <div>
                        <label className="text-lg font-medium block mb-2">
                            Sub Category <span className="text-gray-500">(Optional)</span>
                        </label>
                        <select
                            className="p-2 rounded bg-gray-200 w-full"
                            value={sharedInfo.subCategory}
                            onChange={(e) => handleChange('subCategory', e.target.value)}
                            disabled={!sharedInfo.category}
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

                {/* Description */}
                <div className="mb-6">
                    <label className="text-lg font-medium block mb-2">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="p-2 rounded bg-gray-200 w-full"
                        rows={4}
                        value={sharedInfo.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        required
                        placeholder="Enter a brief description of the product group"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        This description will be shown for all variants in this group.
                    </p>
                </div>

                {/* Details (Rich Text Editor) */}
                <div>
                    <label className="text-lg font-medium block mb-2">
                        Detailed Information <span className="text-gray-500">(Optional)</span>
                    </label>
                    <JoditEditor
                        value={sharedInfo.details}
                        onBlur={(newContent) => handleChange('details', newContent)}
                        tabIndex={1}
                        onChange={() => { }}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Add detailed product information, specifications, usage instructions, etc.
                    </p>
                </div>
            </div>

            {/* Product Variants Section with Tabs */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-4">Product Variants</h3>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded mb-6">
                    <div>
                        <p className="text-sm text-gray-600">Total Variants</p>
                        <p className="text-2xl font-bold text-blue-600">{variants.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Quantity</p>
                        <p className="text-2xl font-bold text-green-600">{totalQuantity}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Price Range</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {minPrice === maxPrice ? `৳${minPrice}` : `৳${minPrice} - ৳${maxPrice}`}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Low Stock Alert</p>
                        <p className={`text-2xl font-bold ${totalQuantity < 10 ? 'text-red-600' : 'text-gray-400'}`}>
                            {totalQuantity < 10 ? 'Yes ⚠️' : 'No ✓'}
                        </p>
                    </div>
                </div>

                {/* Tabs with Add Variant Button */}
                <div className="flex items-end gap-2 border-b-2 border-gray-300 mb-4">
                    <div className="flex flex-1 flex-wrap">
                        {variants.map((variant, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setActiveTab(index)}
                                className={`relative px-4 py-3 font-medium whitespace-nowrap transition rounded-t-lg border-t-2 border-x-2 ${activeTab === index
                                    ? 'bg-white text-blue-600 border-blue-500 border-b-white -mb-0.5 z-10'
                                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{variant.name || `Variant ${index + 1}`}</span>
                                    {index === 0 && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                            Main
                                        </span>
                                    )}
                                    {variants.length > 1 && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveVariant(index);
                                            }}
                                            className="text-red-500 hover:text-red-700 transition cursor-pointer"
                                            title="Remove variant"
                                        >
                                            <IoMdClose size={18} />
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Add Variant Button next to tabs */}
                    <button
                        type="button"
                        onClick={handleAddVariant}
                        className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-t-lg hover:bg-green-600 transition border-t-2 border-x-2 border-green-500"
                    >
                        <IoMdAdd className="text-xl" />
                        <span className="font-medium">Add Variant</span>
                    </button>
                </div>

                {/* Active Variant Card */}
                <div className="border-2 border-gray-300 border-t-0 rounded-b-lg p-4 bg-gray-50">
                    {variants.map((variant, index) => (
                        <div
                            key={index}
                            className={activeTab === index ? 'block' : 'hidden'}
                        >
                            <VariantCard
                                variant={variant}
                                index={index}
                                isMain={variant.isMainProduct || index === 0}
                                mainCategory={sharedInfo.mainCategory}
                                category={sharedInfo.category}
                                excludeProductIds={variants.filter(v => v.existingProductId).map(v => v.existingProductId)}
                                onChange={handleVariantChange}
                                onRemove={handleRemoveVariant}
                                canRemove={variants.length > 1}
                                onMakeMain={handleMakeMain}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between bg-white p-6 rounded-lg shadow-md">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    {isEditMode ? 'Save Changes' : 'Next: Review & Publish →'}
                </button>
            </div>
        </form>
    );
}
