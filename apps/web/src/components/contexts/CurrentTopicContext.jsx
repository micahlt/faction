import { createContext, useContext, useState } from "react";

const CurrentTopicContext = createContext(undefined);

export function CurrentTopicProvider({ children }) {
  const [currentTopic, setCurrentTopic] = useState({
    factionId: "",
    topicId: "",
  });

  return (
    <CurrentTopicContext.Provider value={{ currentTopic, setCurrentTopic }}>
      {children}
    </CurrentTopicContext.Provider>
  );
}

export function useCurrentTopic() {
  const context = useContext(CurrentTopicContext);

  if (!context) {
    throw new Error("useCurrentTopic must be used inside CurrentTopicProvider");
  }

  return context;
}