import React, { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import "../../css/emotion.css";
import { route } from "ziggy-js";
import CameraIcon from "../../images/decoration/camera.svg?react";
import UploadIcon from "../../images/decoration/upload.svg?react";

export default function EmotionUpload() {
    const [mode, setMode] = useState("upload");
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitError, setShowSubmitError] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Validación manual
    const validateFile = (file) => {
        const newErrors = {};

        if (!file) {
            newErrors.photo = "Debes subir una foto o tomar una con la cámara";
            return newErrors;
        }

        // Validar tamaño (120MB)
        if (file.size > 120 * 1024 * 1024) {
            newErrors.photo = "El archivo es demasiado grande (máx. 120MB)";
        }

        // Validar tipo
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            newErrors.photo = "Formato no válido (solo PNG, JPEG, JPG)";
        }

        return newErrors;
    };

    // --- Cámara ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("No se pudo acceder a la cámara:", err);
            setErrors({ photo: "No se pudo acceder a la cámara" });
        }
    };

    const takePhoto = () => {
        if (!videoRef.current) {
            setErrors({ photo: "La cámara no está disponible" });
            return;
        }

        const context = canvasRef.current.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, 300, 200);
        canvasRef.current.toBlob(
            (blob) => {
                const photoFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
                setFile(photoFile);
                setErrors(validateFile(photoFile));
                setShowSubmitError(false); // Ocultar error de envío si ahora hay imagen
            },
            "image/jpeg",
            0.8
        );
    };

    // --- Subida de archivo ---
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setErrors(validateFile(selectedFile));
        setShowSubmitError(false); // Ocultar error de envío si ahora hay imagen
    };

    const removeFile = () => {
        setFile(null);
        setErrors({});
        setShowSubmitError(false);
        // Resetear input file
        const fileInput = document.getElementById("fileInput");
        if (fileInput) fileInput.value = "";
    };

    // --- Enviar al backend ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        router.get(route("Dashboard")); //Prueba ruta

        // Validar si no hay archivo
        if (!file) {
            setShowSubmitError(true);
            setErrors({ photo: "Debes subir una imagen antes de continuar" });
            return;
        }

        // Validar archivo existente
        const validationErrors = validateFile(file);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setShowSubmitError(true);
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setShowSubmitError(false);

        const formData = new FormData();
        formData.append("photo", file);

        try {
            await router.post(route("emotion.upload"), formData, {
                forceFormData: true,
                onSuccess: () => {
                    console.log("Foto enviada correctamente");
                    setFile(null);
                    setShowSubmitError(false);
                    // Resetear cámara si está activa
                    if (videoRef.current && videoRef.current.srcObject) {
                        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                    }
                    router.get(route("Dashboard"));
                },
                onError: (errors) => {
                    if (errors.photo) {
                        setErrors({ photo: Array.isArray(errors.photo) ? errors.photo[0] : errors.photo });
                    } else {
                        setErrors({ photo: "Error al subir el archivo" });
                    }
                    setShowSubmitError(true);
                },
            });
        } catch (error) {
            setErrors({ photo: "Error de conexión" });
            setShowSubmitError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTabChange = (newMode) => {
        setMode(newMode);
        setErrors({});
        setShowSubmitError(false);
        
        if (newMode === "camera") {
            startCamera();
        }
    };

    return (
        <div className="emotion-upload-container">
            {/* Tabs */}
            <div className="upload-tabs">
                <button
                    type="button"
                    className={`tab ${mode === "camera" ? "active" : ""}`}
                    onClick={() => handleTabChange("camera")}
                >
                    <CameraIcon className="icon" />
                </button>
                <button
                    type="button"
                    className={`tab ${mode === "upload" ? "active" : ""}`}
                    onClick={() => handleTabChange("upload")}
                >
                    <UploadIcon className="icon" />
                </button>
            </div>

            {/* Cámara */}
            {mode === "camera" && (
                <div className="camera-box">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        width="100%"
                        height="250"
                    />
                    <button 
                        type="button" 
                        className="capture-btn" 
                        onClick={takePhoto}
                        disabled={isSubmitting}
                    >
                        Tomar foto
                    </button>
                    <canvas
                        ref={canvasRef}
                        width="300"
                        height="200"
                        style={{ display: "none" }}
                    />
                </div>
            )}

            {/* Upload */}
            {mode === "upload" && (
                <div className="upload-box">
                    <label htmlFor="fileInput" className="upload-label">
                        <div className="upload-icon">
                            <UploadIcon className="icon-large" />
                        </div>
                        <p>Max 120Mb, PNG, JPEG, JPG</p>
                        <span className="upload-btn">Buscar archivo</span>
                    </label>
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        style={{ display: "none" }}
                    />
                </div>
            )}

            {/* Preview */}
            {file && (
                <div className="file-preview">
                    <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="file-thumb"
                    />
                    <div className="file-info">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">
                            {(file.size / 1024 / 1024).toFixed(2)} Mb
                        </p>
                    </div>
                    <button 
                        type="button" 
                        className="file-remove" 
                        onClick={removeFile}
                        disabled={isSubmitting}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Mensaje de error al intentar enviar sin imagen */}
            {showSubmitError && !file && (
                <div className="submit-error-message">
                    ⚠ Debes subir una imagen antes de generar recomendaciones
                </div>
            )}
            
            <button 
                type="button" 
                className="generate-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Enviando..." : "Generar recomendación"}
            </button>
        </div>
    );
}