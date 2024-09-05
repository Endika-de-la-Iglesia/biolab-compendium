import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MyDropzone = ({ onDrop, previousImg }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (previousImg) {
      setPreview(previousImg);
    } else {
      setPreview(null);
    }
  }, [previousImg]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles[0]) {
        const file = acceptedFiles[0];
        console.log("file", file)
        const previewUrl = URL.createObjectURL(file);
        console.log("previewUrl", previewUrl)
        setPreview(previewUrl);
        onDrop(acceptedFiles);
      }
    },
    [onDrop]
  );

  const removeImage = () => {
    if (typeof preview === "string" && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    } else if (typeof preview === "string" && !preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onDrop(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    multiple: false,
    noClick: preview !== null && preview !== undefined,
  });

  useEffect(() => {
    return () => {
      if (typeof preview === "string" && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div
      className="custom-dropzone"
      {...getRootProps()}
      style={{
        border: "2px dashed #007bff",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <input {...getInputProps()} />
      {!preview ? (
        <div className="dropzone-area-empty">
          <h2>
            <FontAwesomeIcon icon="fa-solid fa-file-image" size="xl" />
          </h2>
          <h3>JPG, PNG</h3>
          <p>Arrastra una imagen o pulsa para buscarla y añadirla</p>
        </div>
      ) : (
        <div className="preview-image">
          <img src={preview} alt="Preview" />
          <button
            className="btn"
            onClick={() => {
              removeImage();
            }}
            style={{ marginTop: "10px" }}
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

export default MyDropzone;
