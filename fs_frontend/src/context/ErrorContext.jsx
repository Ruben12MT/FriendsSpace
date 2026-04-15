import React, { createContext, useContext, useState, useCallback } from "react";

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);

  const showError = useCallback((message, advice = "Inténtalo de nuevo más tarde.") => {
    setError({ message, advice });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useError debe usarse dentro de ErrorProvider");
  return ctx;
}
