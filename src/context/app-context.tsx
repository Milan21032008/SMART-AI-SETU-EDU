"use client";

import type { Conversation, Role } from "@/lib/types";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { useAuth, useFirestore, useUser, useMemoFirebase, useCollection } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc, collection, query, orderBy } from "firebase/firestore";

type AppState = {
  role: Role | null;
  history: Conversation[];
  currentConversation: Partial<Conversation> | null;
  isOnline: boolean;
};

type Action =
  | { type: "SET_ROLE"; payload: Role }
  | { type: "START_CONVERSATION" }
  | { type: "UPDATE_CONVERSATION"; payload: Partial<Conversation> }
  | { type: "FINISH_CONVERSATION"; payload?: Partial<Conversation> }
  | { type: "LOAD_HISTORY"; payload: Conversation[] }
  | { type: "SET_ONLINE_STATUS"; payload: boolean };

const initialState: AppState = {
  role: null,
  history: [],
  currentConversation: null,
  isOnline: true,
};

const isConversation = (
  conversation: Partial<Conversation>
): conversation is Conversation => {
  return (
    !!conversation.id &&
    !!conversation.timestamp &&
    !!conversation.role &&
    (!!conversation.audioDataUri || !!conversation.textMessage) &&
    !!conversation.transcription &&
    !!conversation.rephrased &&
    !!conversation.sentiment &&
    !!conversation.explanation &&
    !!conversation.safety
  );
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "START_CONVERSATION":
      return {
        ...state,
        currentConversation: { id: new Date().getTime().toString() },
      };
    case "UPDATE_CONVERSATION":
      if (!state.currentConversation) return state;
      return {
        ...state,
        currentConversation: { ...state.currentConversation, ...action.payload },
      };
    case "FINISH_CONVERSATION": {
      return {
        ...state,
        currentConversation: null,
      };
    }
    case "LOAD_HISTORY":
      return { ...state, history: action.payload };
    case "SET_ONLINE_STATUS":
      return { ...state, isOnline: action.payload };
    default:
      return state;
  }
};

interface AppContextType extends AppState {
  setRole: (role: Role) => void;
  startConversation: () => void;
  updateConversation: (data: Partial<Conversation>) => void;
  finishConversation: (finalData?: Partial<Conversation>) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  // Initialize Auth
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Sync History from Firestore
  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "conversations"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: firestoreHistory } = useCollection<Conversation>(historyQuery);

  useEffect(() => {
    if (firestoreHistory) {
      dispatch({ type: "LOAD_HISTORY", payload: firestoreHistory });
    }
  }, [firestoreHistory]);

  // Load initial role from local storage
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("setu-role") as Role | null;
      if (storedRole) {
        dispatch({ type: "SET_ROLE", payload: storedRole });
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error);
    }
  }, []);

  // Save role to local storage
  useEffect(() => {
    if (state.role) {
      localStorage.setItem("setu-role", state.role);
    }
  }, [state.role]);
  
  // Online status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if(typeof navigator !== 'undefined') {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: navigator.onLine });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setRole = useCallback((role: Role) => {
    dispatch({ type: "SET_ROLE", payload: role });
  }, []);

  const startConversation = useCallback(() => {
    dispatch({ type: "START_CONVERSATION" });
  }, []);

  const updateConversation = useCallback((data: Partial<Conversation>) => {
    dispatch({ type: "UPDATE_CONVERSATION", payload: data });
  }, []);

  const finishConversation = useCallback((finalData?: Partial<Conversation>) => {
    const conversationToSave = { 
      ...(state.currentConversation || {}), 
      ...(finalData || {}),
      userId: user?.uid,
    };

    if (isConversation(conversationToSave) && db && user) {
      // CRITICAL: Remove all undefined values before sending to Firestore
      const cleanData = Object.fromEntries(
        Object.entries(conversationToSave).filter(([_, v]) => v !== undefined)
      );

      const convRef = doc(db, "users", user.uid, "conversations", conversationToSave.id);
      setDocumentNonBlocking(convRef, cleanData, { merge: true });
    }

    dispatch({ type: "FINISH_CONVERSATION", payload: finalData });
  }, [state.currentConversation, db, user]);

  const value = useMemo(
    () => ({
      ...state,
      setRole,
      startConversation,
      updateConversation,
      finishConversation,
    }),
    [state, setRole, startConversation, updateConversation, finishConversation]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};