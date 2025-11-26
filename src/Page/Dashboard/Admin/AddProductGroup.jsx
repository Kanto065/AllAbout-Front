import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ProductGroupStep1 from '../../../Components/Admin/ProductGroupStep1';
import ProductGroupStep2 from '../../../Components/Admin/ProductGroupStep2';
import ProductGroupStep3 from '../../../Components/Admin/ProductGroupStep3';

export default function AddProductGroup({ setAdd, setReload }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Shared information (applies to all variants)
    const [sharedInfo, setSharedInfo] = useState({
        mainCategory: '',
        category: '',
        subCategory: '',
        description: '',
        details: ''
    });

    // Variants (individual products)
    const [variants, setVariants] = useState([
        {
            name: '',
            price: 0,
            cost: 0,
            quantity: 0,
            discount: 0,
            images: [],
            variantAttributes: {}
        }
    ]);

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            setAdd(false);
        }
    };

    return (
        <div className="py-5">
            <Helmet>
                <title>All About Craft BD | Add Product Group</title>
            </Helmet>

            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-3">Create Product Group</h2>
                <p className="text-gray-600">Add products with multiple variants</p>
            </div>

            {/* Progress Indicator */}
            <div className="max-w-3xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center flex-1">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                                }`}
                        >
                            1
                        </div>
                        <span className="text-xs mt-2 text-center">Product Info</span>
                    </div>

                    {/* Line */}
                    <div
                        className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                    ></div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center flex-1">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                                }`}
                        >
                            2
                        </div>
                        <span className="text-xs mt-2 text-center">Add Variants</span>
                    </div>

                    {/* Line */}
                    <div
                        className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                    ></div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center flex-1">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 3
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                                }`}
                        >
                            3
                        </div>
                        <span className="text-xs mt-2 text-center">Review & Publish</span>
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="max-w-5xl mx-auto">
                {currentStep === 1 && (
                    <ProductGroupStep1
                        sharedInfo={sharedInfo}
                        setSharedInfo={setSharedInfo}
                        onNext={handleNext}
                        onCancel={handleCancel}
                    />
                )}

                {currentStep === 2 && (
                    <ProductGroupStep2
                        variants={variants}
                        setVariants={setVariants}
                        sharedInfo={sharedInfo}
                        onNext={handleNext}
                        onBack={handleBack}
                        onCancel={handleCancel}
                    />
                )}

                {currentStep === 3 && (
                    <ProductGroupStep3
                        sharedInfo={sharedInfo}
                        variants={variants}
                        onBack={handleBack}
                        onCancel={handleCancel}
                        setAdd={setAdd}
                        setReload={setReload}
                        loading={loading}
                        setLoading={setLoading}
                        message={message}
                        setMessage={setMessage}
                    />
                )}
            </div>
        </div>
    );
}
