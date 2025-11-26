import { useEffect, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import useMainCategories from '../../Hooks/useMainCategories';
import useCategories from '../../Hooks/useCategories';
import useSubCategories from '../../Hooks/useSubCategories';

export default function ProductGroupStep1({ sharedInfo, setSharedInfo, onNext, onCancel }) {
    const [mainCategories] = useMainCategories();
    const [categories] = useCategories();
    const [subCategories] = useSubCategories();

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

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div>
                <h3 className="text-2xl font-bold mb-4">Product Group Information</h3>
                <p className="text-gray-600 mb-6">
                    This information will be shared across all variants in this product group.
                </p>
            </div>

            {/* Categories Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                            handleChange('category', ''); // Reset category when main category changes
                            handleChange('subCategory', ''); // Reset subcategory
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
                            handleChange('subCategory', ''); // Reset subcategory when category changes
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
            <div>
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

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
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
                    Next: Add Variants →
                </button>
            </div>
        </form>
    );
}
