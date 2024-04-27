// PageContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
  } from "react";
  import { v4 as uuidv4 } from "uuid";
  
  interface Page {
    id: string;
    title: string;
    status: string;
    priority: string;
    need: string;
    label: string;
  }
  
  interface PageContextProps {
    pages: Page[];
    addPage: (newPage: {
      title: string;
      status: string;
      priority: string;
      need: string;
      label: string;
    }) => void;
    updatePage: (pageId: string, updatedPage: Partial<Page>) => void;
    deletePage: (pageId: string) => void;
    duplicatePage: (page: Page) => void;
  }
  
  const PageContext = createContext<PageContextProps | undefined>(undefined);
  
  interface PageProviderProps {
    children: ReactNode;
  }
  
  export const PageProvider: React.FC<PageProviderProps> = ({ children }) => {
    const [pages, setPages] = useState<Page[]>([]);
  
    const getPages = () => {
      try {
        const pageJson = localStorage.getItem("pages");
  
        if (!pageJson) {
          return [];
        }
  
        const parsedPages = JSON.parse(pageJson);
  
        if (Array.isArray(parsedPages)) {
          return parsedPages;
        } else if (typeof parsedPages === "object") {
          // If the existing data is an object, treat it as a single page
          return [parsedPages];
        } else {
          console.error("Invalid format for existing pages:", parsedPages);
          return [];
        }
      } catch (error) {
        console.error("Error parsing pages from local storage:", error);
        return [];
      }
    };
  
    const savePages = (data: any) => {
      const pagesJson = JSON.stringify(data);
      localStorage.setItem("pages", pagesJson);
    };
  
    const addPage = (newPage: {
      title: string;
      status: string;
      priority: string;
      need: string;
      label: string;
    }) => {
      const pages = getPages();
  
      if (Array.isArray(pages)) {
        const updatedPages = [
          ...pages,
          createPage(newPage.title, newPage.status, newPage.priority, newPage.need, newPage.label),
        ];
        savePages(updatedPages);
        setPages(updatedPages);
      } else {
        console.error("Existing pages is not an array:", pages);
        // Handle the situation where pages is not an array
        const updatedPages = [
          createPage(newPage.title, newPage.status, newPage.priority, newPage.need, newPage.label),
        ];
        savePages(updatedPages);
        setPages(updatedPages);
      }
  
    };
  
    const updatePage = (pageId: string, updatedPage: Partial<Page>) => {
      const pages = getPages();
  
      const updatedPages = pages.map((page) =>
        page.id === pageId ? { ...page, ...updatedPage } : page
      );
      savePages(updatedPages);
  
      setPages(updatedPages);
    };
  
    const deletePage = (id: string) => {
      const pageId = id;
      const pages = getPages();
      const updatedPages = pages.filter((page: any) => page.id !== pageId);
      savePages(updatedPages);
      setPages(updatedPages);
    };
  
    const duplicatePage = (page: Page) => {
      const duplicatedPage = { ...page, id: uuidv4() };
      addPage(duplicatedPage);
    };
  
    useEffect(() => {
      const initialPages = getPages();
      setPages(initialPages);
    }, []); // Empty dependency array ensures it runs only once on mount
  
    return (
      <PageContext.Provider
        value={{ pages, duplicatePage, addPage, updatePage, deletePage }}
      >
        {children}
      </PageContext.Provider>
    );
  };
  
  export const usePage = () => {
    const context = useContext(PageContext);
    if (!context) {
      throw new Error("usePage must be used within a PageProvider");
    }
    return context;
  };
  
  const createPage = (title: string, status: string, priority: string, need: string, label: string,): Page => {
    return {
      id: uuidv4(),
      title,
      status,
      priority,
      need,
      label,
    };
  };