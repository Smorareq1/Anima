import React, { useState, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import "../../css/emotion.css";
import CameraIcon from "../../../public/images/decoration/camera.svg?react";
import UploadIcon from "../../../public/images/decoration/upload.svg?react";
import LoadingScreen from "./LoadingScreen";

export default function EmotionUpload({ errors: serverErrors = {} }) {
    const [mode, setMode] = useState("upload");
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState(serverErrors);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const loadingPhrases = [
        "Analizando tu emoción...",
        "Procesando tu expresión facial...",
        "Buscando la música perfecta para tu estado de ánimo...",
        "Creando playlist personalizada...",
        "Conectando con Spotify...",
        "Tu recomendación musical está en camino..."
    ];

    useEffect(() => {
        setErrors(serverErrors);
    }, [serverErrors]);

    useEffect(() => {
        const handleNavigation = () => stopCamera();

        // Inertia Router expone "on" para eventos globales
        router.on('before', handleNavigation);

        return () => {
            stopCamera();

            // Eliminamos manualmente el listener del objeto interno del router
            if (router._events && router._events.before) {
                router._events.before = router._events.before.filter(
                    (fn) => fn !== handleNavigation
                );
            }
        };
    }, []);


    const validateFile = (file) => {
        const newErrors = {};

        if (!file) {
            newErrors.photo = "Debes subir una foto o tomar una con la cámara";
            return newErrors;
        }

        if (file.size > 10 * 1024 * 1024) {
            newErrors.photo = "El archivo es demasiado grande (máx. 10MB)";
        }

        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            newErrors.photo = "Formato no válido (solo PNG, JPEG, JPG)";
        }

        return newErrors;
    };

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

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) {
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
            },
            "image/jpeg",
            0.8
        );
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setErrors(validateFile(selectedFile));
    };

    const removeFile = () => {
        setFile(null);
        setErrors({});
        const fileInput = document.getElementById("fileInput");
        if (fileInput) fileInput.value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file) {
            setErrors({ photo: "Debes subir una imagen antes de continuar" });
            return;
        }

        const validationErrors = validateFile(file);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        // Usar Inertia router con FormData
        router.post(route('emotion.upload'), {
            photo: file
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setFile(null);
                stopCamera();
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error('Upload errors:', errors);
                setErrors(errors);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleTabChange = (newMode) => {
        setMode(newMode);
        setErrors({});

        if (newMode === "upload") {
            stopCamera();
        } else if (newMode === "camera") {
            startCamera();
        }
    };

    return (
        <div className="emotion-upload-container">
            <div className="upload-tabs">
                <button
                    type="button"
                    className={`tab ${mode === "camera" ? "active" : ""}`}
                    onClick={() => handleTabChange("camera")}
                    disabled={isSubmitting}
                >
                    <CameraIcon className="icon" />
                </button>
                <button
                    type="button"
                    className={`tab ${mode === "upload" ? "active" : ""}`}
                    onClick={() => handleTabChange("upload")}
                    disabled={isSubmitting}
                >
                    <UploadIcon className="icon" />
                </button>
            </div>

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

            {mode === "upload" && (
                <div className="upload-box">
                    <label htmlFor="fileInput" className="upload-label">
                        <div className="upload-icon">
                            <UploadIcon className="icon-large" />
                        </div>
                        <p>Max 10MB, PNG, JPEG, JPG</p>
                        <span className="upload-btn">Sube tu foto</span>
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
                            {(file.size / 1024 / 1024).toFixed(2)} MB
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

            {errors.photo && (
                <div className="submit-error-message">
                    {errors.photo}
                </div>
            )}

            <button
                type="button"
                className="generate-btn"
                onClick={handleSubmit}
                disabled={isSubmitting || !file}
            >
                {isSubmitting ? "Procesando..." : "Generar recomendación"}
            </button>

            <LoadingScreen
                isLoading={isSubmitting}
                phrases={loadingPhrases}
            />
        </div>
    );
}
