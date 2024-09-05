import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import axios from "axios";

import useTokenValidation from "../helpers/useTokenValidation";
const config = require("../../../env");

const MyEditor = ({ handleTextInput, prevText }) => {
  const [editorContent, setEditorContent] = useState("");
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const isInitialized = useRef(false);

  const apiUrl = config.apiUrl;
  const validateToken = useTokenValidation();

  useEffect(() => {
    if (!isInitialized.current) {
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: {
            container: [
              [{ header: "1" }, { header: "2" }],
              [{ list: "ordered" }, { list: "bullet" }],
              ["bold", "italic", "underline"],
              [{ color: [] }, { background: [] }],
              ["link", "image"],
              ["clean"],
            ],
            handlers: {
              image: () => {
                const input = document.createElement("input");
                input.setAttribute("type", "file");
                input.setAttribute("accept", "image/*");
                input.click();
                input.addEventListener("change", () => {
                  const file = input.files[0];
                  if (file) {
                    uploadImage(file);
                  }
                });
              },
            },
          },
        },
      });

      quillRef.current = quill;
      isInitialized.current = true;

      const attachImageClickListeners = () => {
        const images = editorRef.current.querySelectorAll("img");
        images.forEach((img) => {
          img.addEventListener("click", () => handleImageClick(img));
        });
      };

      const handleImageClick = (imgElement) => {
        if (window.confirm("¿Quieres borrar esta imagen?")) {
          const imgUrl = imgElement.src;
          imgElement.remove();
          deleteImageFromServer(imgUrl);
        }
      };

      const deleteImageFromServer = async (imgUrl) => {
        try {
          const response = await axios.post(
            `${apiUrl}/api/protocols/delete_protocol_img`,
            {
              img_url: imgUrl,
            }
          );

          if (response.status !== 200) {
            throw new Error("Error eliminando imagen del servidor");
          }

          console.log("Imagen eliminada correctamente");
        } catch (error) {
          console.error(error);
        }
      };

      if (prevText) {
        quill.clipboard.dangerouslyPasteHTML(prevText);
        setEditorContent(prevText);

        attachImageClickListeners();
      }

      quill.on("text-change", () => {
        const content = quill.root.innerHTML;
        setEditorContent(content);
        handleTextInput(content);
      });

      const handleDrop = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const dataTransfer = event.dataTransfer;
        if (
          dataTransfer &&
          dataTransfer.files &&
          dataTransfer.files.length > 0
        ) {
          const file = dataTransfer.files[0];
          if (file && file.type.startsWith("image/")) {
            quill.root
              .querySelectorAll('img[src^="data:image"]')
              .forEach((img) => img.remove());
            uploadImage(file);
          }
        }
      };

      editorRef.current.addEventListener("drop", handleDrop);

      const uploadImage = async (file) => {
        const quill = quillRef.current;
        let range = quill.getSelection();

        if (!range) {
          range = { index: quill.getLength(), length: 0 };
        }
        try {
          const formData = new FormData();
          formData.append("file", file);
          let response;

          if (validateToken) {
            response = await axios.post(
              `${apiUrl}/api/protocols/upload_protocol_img`,
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );
          }

          const data = response.data;
          const imageUrl = data.secure_url;

          console.log("imageUrl", imageUrl);

          quill.insertEmbed(range.index, "image", imageUrl);
          attachImageClickListeners();
        } catch (error) {
          console.error("Subida de imagen ha fallado:", error);
        }
        const placeholderImages = quill.root.querySelectorAll(
          'img[src^="data:image"]'
        );
        placeholderImages.forEach((img) => img.remove());
      };

      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener("drop", handleDrop);
        }
        if (quillRef.current) {
          quillRef.current.off("text-change");
          quillRef.current.disable();
          quillRef.current = null;
          isInitialized.current = false;
        }
      };
    }
  }, [prevText, handleTextInput]);

  return (
    <div className="quill-text-editor-container">
      <div ref={editorRef} style={{ height: "400px" }}></div>
      <textarea
        value={editorContent}
        onChange={(e) => setEditorContent(e.target.value)}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default MyEditor;
