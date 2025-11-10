import React, { createContext, useState, useContext } from 'react';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPhrases, setLoadingPhrases] = useState([]);

    const showLoading = (phrases = []) => {
        setLoadingPhrases(phrases);
        setIsLoading(true);
    };

    const hideLoading = () => {
        setIsLoading(false);
        setLoadingPhrases([]);
    };

    return (
        <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, loadingPhrases }}>
            {children}
        </LoadingContext.Provider>
    );
};
