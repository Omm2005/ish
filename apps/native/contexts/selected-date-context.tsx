import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type SelectedDateContextType = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

const SelectedDateContext = createContext<SelectedDateContextType | undefined>(undefined);

export function SelectedDateProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDateState] = useState(() => new Date());

  const setSelectedDate = useCallback((date: Date) => {
    setSelectedDateState(date);
  }, []);

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate,
    }),
    [selectedDate, setSelectedDate],
  );

  return <SelectedDateContext.Provider value={value}>{children}</SelectedDateContext.Provider>;
}

export function useSelectedDate() {
  const context = useContext(SelectedDateContext);
  if (!context) {
    throw new Error("useSelectedDate must be used within SelectedDateProvider");
  }
  return context;
}
