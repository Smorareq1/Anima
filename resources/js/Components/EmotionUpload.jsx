import React, { useState, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import "../../css/emotion.css";
import { route } from "ziggy-js";
import CameraIcon from "../../../public/images/decoration/camera.svg?react";
import UploadIcon from "../../../public/images/decoration/upload.svg?react";
import LoadingScreen from "./LoadingScreen";

export default function EmotionUpload() {
    const [mode, setMode] = useState("upload");
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitError, setShowSubmitError] = useState(false);
    const [debugInfo, setDebugInfo] = useState([]); // ✅ Nuevo estado para debug
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

    // ✅ Función helper para agregar logs de debug
    const addDebug = (message, data = null) => {
        const timestamp = new Date().toISOString();
        const debugEntry = {
            time: timestamp,
            message,
            data
        };
        console.log(`[${timestamp}] ${message}`, data || '');
        setDebugInfo(prev => [...prev, debugEntry]);
    };

    useEffect(() => {
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const validateFile = (file) => {
        addDebug('Validating file', {
            name: file?.name,
            size: file?.size,
            type: file?.type
        });

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

        addDebug('Validation result', { errors: newErrors });
        return newErrors;
    };

    const startCamera = async () => {
        try {
            addDebug('Starting camera...');
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                addDebug('Camera started successfully');
            }
        } catch (err) {
            addDebug('Camera error', { error: err.message });
            console.error("No se pudo acceder a la cámara:", err);
            setErrors({ photo: "No se pudo acceder a la cámara" });
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            addDebug('Camera stopped');
        }
    };

    const takePhoto = () => {
        addDebug('Taking photo...');

        if (!videoRef.current || !canvasRef.current) {
            addDebug('Camera not available');
            setErrors({ photo: "La cámara no está disponible" });
            return;
        }

        const context = canvasRef.current.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, 300, 200);

        canvasRef.current.toBlob(
            (blob) => {
                const photoFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
                addDebug('Photo captured', {
                    size: photoFile.size,
                    type: photoFile.type
                });
                setFile(photoFile);
                setErrors(validateFile(photoFile));
                setShowSubmitError(false);
            },
            "image/jpeg",
            0.8
        );
    };

    const handleFileChange = (e) => {
        addDebug('File selected from input');
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setErrors(validateFile(selectedFile));
        setShowSubmitError(false);
    };

    const removeFile = () => {
        addDebug('File removed');
        setFile(null);
        setErrors({});
        setShowSubmitError(false);
        const fileInput = document.getElementById("fileInput");
        if (fileInput) fileInput.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        addDebug('=== SUBMIT STARTED ===');

        if (!file) {
            addDebug('No file selected');
            setShowSubmitError(true);
            setErrors({ photo: "Debes subir una imagen antes de continuar" });
            return;
        }

        const validationErrors = validateFile(file);
        if (Object.keys(validationErrors).length > 0) {
            addDebug('Validation failed', validationErrors);
            setErrors(validationErrors);
            setShowSubmitError(true);
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setShowSubmitError(false);

        const formData = new FormData();
        formData.append("photo", file);

        addDebug('FormData created', {
            hasPhoto: formData.has('photo'),
            fileSize: file.size,
            fileName: file.name,
            fileType: file.type
        });

        // ✅ Obtener la URL del route
        const uploadUrl = route("emotion.upload");
        addDebug('Posting to URL', { url: uploadUrl });

        // ✅ Usar fetch directo para más control y debugging
        try {
            addDebug('Sending request...');

            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'X-Inertia': 'true',
                    'X-Inertia-Version': window.InertiaAppVersion || '',
                }
            });

            addDebug('Response received', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            const responseText = await response.text();
            addDebug('Response body (raw)', {
                length: responseText.length,
                preview: responseText.substring(0, 500)
            });

            if (!response.ok) {
                addDebug('Response NOT OK', {
                    status: response.status,
                    body: responseText
                });

                try {
                    const errorData = JSON.parse(responseText);
                    addDebug('Error data parsed', errorData);

                    if (errorData.errors?.photo) {
                        setErrors({ photo: errorData.errors.photo });
                    } else if (errorData.message) {
                        setErrors({ photo: errorData.message });
                    } else {
                        setErrors({ photo: `Error ${response.status}: ${response.statusText}` });
                    }
                } catch (parseError) {
                    addDebug('Could not parse error response', {
                        parseError: parseError.message,
                        rawText: responseText.substring(0, 200)
                    });
                    setErrors({ photo: `Error ${response.status}: No se pudo procesar la respuesta del servidor` });
                }

                setShowSubmitError(true);
                setIsSubmitting(false);
                return;
            }

            addDebug('Request successful!');

            // Parsear respuesta exitosa
            try {
                const data = JSON.parse(responseText);
                addDebug('Success data parsed', data);

                // Si es una respuesta Inertia
                if (data.component || data.props) {
                    addDebug('Inertia response detected, redirecting...');
                    window.location.href = data.url || route('emotion.playlists.temp');
                } else {
                    addDebug('Regular JSON response');
                }
            } catch (parseError) {
                addDebug('Could not parse success response', {
                    parseError: parseError.message
                });
            }

            setFile(null);
            stopCamera();
            setIsSubmitting(false);

        } catch (error) {
            addDebug('=== EXCEPTION CAUGHT ===', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            setIsSubmitting(false);
            setErrors({ photo: `Error de conexión: ${error.message}` });
            setShowSubmitError(true);
        }
    };

    const handleTabChange = (newMode) => {
        addDebug('Tab changed', { from: mode, to: newMode });
        setMode(newMode);
        setErrors({});
        setShowSubmitError(false);

        if (newMode === "upload") {
            stopCamera();
        } else if (newMode === "camera") {
            startCamera();
        }
    };

    return (
        <div className="emotion-upload-container">
            {/* ✅ Panel de debug (solo en desarrollo o con query param ?debug=1) */}
            {(import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === '1') && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    backgroundColor: '#1a1a1a',
                    color: '#00ff00',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    padding: '10px',
                    zIndex: 9999,
                    borderTop: '2px solid #00ff00'
                }}>
                    <strong>DEBUG LOG:</strong>
                    <button
                        onClick={() => setDebugInfo([])}
                        style={{
                            float: 'right',
                            background: '#ff0000',
                            color: 'white',
                            border: 'none',
                            padding: '2px 8px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear
                    </button>
                    {debugInfo.map((entry, i) => (
                        <div key={i} style={{ borderBottom: '1px solid #333', padding: '2px 0' }}>
                            <strong>[{entry.time.split('T')[1].split('.')[0]}]</strong> {entry.message}
                            {entry.data && (
                                <pre style={{ margin: 0, fontSize: '10px', color: '#aaa' }}>
                                    {JSON.stringify(entry.data, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))}
                </div>
            )}

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

            {showSubmitError && errors.photo && (
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
