// src/components/CostEstimatorForm/CostEstimatorForm.tsx
import React, { useState, useEffect } from "react";
import { useLayerContext } from "../../../../context/LayerContext";
import { HttpReq } from "../../../../services/apiService";
import { CostEstimate } from "../../../../types/allTypesAndInterfaces";
import { formatSubcategoryName } from "../../../../utils/helperFunctions";
import styles from "./InternalCostEstimator.module.css";
import urls from "../../../../urls.json"
import { FaCaretDown, FaCaretRight } from "react-icons/fa";


function InternalCostEstimator() {
    const {
        countries,
        cities,
        categories,
        reqFetchDataset,
        isError,
        setIsError,
        handleCountryCitySelection,
        handleTypeToggle,
        validateFetchDatasetForm,
        resetFetchDatasetForm
    } = useLayerContext();

    // COLBASE CATEGORY
    const [openedCategories, setOpenedCategories] = useState<string[]>([])

    // when form first loads, reset previous form data setReqFetchDataset()to its initial state
    // The empty dependency array [] at the end of the useEffect hook means this effect will 
    // only run once, after the initial render, and when the component unmounts.
    useEffect(() => {
        return resetFetchDatasetForm
    }, []);

    const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    function handleCostEstimate(event: React.FormEvent<HTMLButtonElement>) {
        event.preventDefault();

        if (validateFetchDatasetForm()) {
            setIsLoading(true);
            const requestBody = {
                included_categories: reqFetchDataset.includedTypes,
                excluded_categories: reqFetchDataset.excludedTypes,
                city_name: reqFetchDataset.selectedCity,
                country: reqFetchDataset.selectedCountry,
            };

            HttpReq<CostEstimate>(
                urls.cost_calculator,
                (data) => {
                    if (data && typeof data.cost === 'number' && typeof data.api_calls === 'number') {
                        setCostEstimate(data);
                    } else {
                        setIsError(new Error('Invalid response from server'));
                    }
                },
                () => { },
                () => { },
                () => setIsLoading(false),
                setIsError,
                "post",
                requestBody
            );
        }
    }

    return (
        <div className="h-full w-full flex flex-col justify-between items-center">

            <div className="h-[90%] w-full pl-4 pr-2 overflow-y-auto px-24 ">

                {isError && <div className="mt-6 text-red-500 font-semibold">{isError.message}</div>}

                <div className='pt-4'>
                    <label className='block mb-2 text-md font-medium text-black' htmlFor="country">
                        Country:
                    </label>
                    <select
                        id="country"
                        name="selectedCountry"
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        value={reqFetchDataset.selectedCountry}
                        onChange={handleCountryCitySelection}
                    >
                        <option value="" disabled>
                            Select a country
                        </option>
                        {countries.map((country) => (
                            <option key={country} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className='block mb-2 text-md font-medium text-black' htmlFor="city">
                        City:
                    </label>
                    <select
                        id="city"
                        name="selectedCity"
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        value={reqFetchDataset.selectedCity}
                        onChange={handleCountryCitySelection}
                        disabled={!reqFetchDataset.selectedCountry}
                    >
                        <option value="" disabled>
                            Select a city
                        </option>
                        {cities.map((city) => (
                            <option key={city.name} value={city.name}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='flex flex-col my-5 w-96'>

                    <label className='mb-4 font-bold'>What are you looking for?</label>

                    <div className={styles.categoryContainer}>
                        {Object.entries(categories).map(([category, types]) => (
                            <div key={category} className={styles.categoryGroup}>

                                <button
                                    className="font-semibold cursor-pointer flex justify-start items-center w-full hover:bg-gray-200 transition-all rounded"
                                    onClick={() => {
                                        if (openedCategories.includes(category)) {
                                            setOpenedCategories([...openedCategories.filter(x => x !== category)])
                                            return
                                        }
                                        setOpenedCategories([...openedCategories.concat(category)])
                                    }}
                                > <span>{openedCategories.includes(category) ? <FaCaretDown /> : <FaCaretRight />}</span> {category}
                                </button>

                                <div className={' w-full basis-full overflow-hidden transition-all' + (!openedCategories.includes(category) && ' h-0')}>
                                    <div className='flex flex-wrap gap-3 mt-3'>
                                        {(types as string[]).map((type: string) => {
                                            const included = reqFetchDataset.includedTypes.includes(type);
                                            const excluded = reqFetchDataset.excludedTypes.includes(type);
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={`${styles.typeButton} ${included
                                                        ? styles.included
                                                        : excluded
                                                            ? styles.excluded
                                                            : ""
                                                        }`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleTypeToggle(type);
                                                    }}
                                                >
                                                    {formatSubcategoryName(type)}
                                                    <span className={styles.toggleIcon}>
                                                        {included ? "✓" : excluded ? "−" : "+"}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="flex justify-center items-center space-x-10 border-t w-full h-[10%]">

                <button type="submit" className="w-36 h-16 bg-slate-100 border-2 border-[#115740] text-[#115740] flex justify-center items-center font-semibold rounded-lg
                 hover:bg-white transition-all cursor-pointer" disabled={isLoading} onClick={handleCostEstimate}>
                    {isLoading ? "Estimating..." : "Estimate Cost"}
                </button>


                {costEstimate && (
                    <div className='h-16 '>
                        <h3 className="font-bold">Cost Estimate</h3>
                        <p>Estimated Cost: ${costEstimate.cost?.toFixed(2) ?? 'N/A'}</p>
                        <p>API Calls: {costEstimate.api_calls ?? 'N/A'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InternalCostEstimator;