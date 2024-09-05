import { useReactToPrint } from "react-to-print";

export const useHandlePrint = (contentRef, selectorsToHide) => {
  return useReactToPrint({
    content: () => contentRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        selectorsToHide.forEach((selector) => {
          const elements = contentRef.current.querySelectorAll(selector);
          if (elements.length > 0) {
            elements.forEach((element) => (element.style.setProperty('display', 'none', 'important')));
          }
        });

        setTimeout(() => resolve(), 500);
      });
    },
    onAfterPrint: () => {
      selectorsToHide.forEach((selector) => {
        const elements = contentRef.current.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach((element) => (element.style.display = ""));
        }
      });
    },
  });
};
