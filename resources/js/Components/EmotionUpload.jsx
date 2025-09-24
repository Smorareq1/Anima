import React, { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import "../../css/emotion.css";
import {route} from "ziggy-js";
import CameraIcon from "../../images/decoration/camera.svg?react";
import UploadIcon from "../../images/decoration/upload.svg?react";

export default function EmotionUpload() {
    const [mode, setMode] = useState("upload"); // "upload" | "camera"
    const [file, setFile] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // --- Cámara ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("No se pudo acceder a la cámara:", err);
        }
    };

    const takePhoto = () => {
        const context = canvasRef.current.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, 300, 200);
        canvasRef.current.toBlob(
            (blob) => {
                const photoFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
                setFile(photoFile);
            },
            "image/jpeg",
            1
        );
    };

    // --- Subida de archivo ---
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const removeFile = () => {
        setFile(null);
    };

    // --- Enviar al backend ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) return; // mostrar un mensaje de error aqui

        const formData = new FormData();
        formData.append("photo", file);

        router.post(route("emotion.upload"), formData, {
            onSuccess: () => {
                console.log("Foto enviada correctamente");
            },
        });
    };

    return (
        <div className="emotion-upload-container">
            {/* Tabs */}
            <div className="upload-tabs">
                <button
                    className={`tab ${mode === "camera" ? "active" : ""}`}
                    onClick={() => {
                        setMode("camera");
                        startCamera();
                    }}
                >
                    <CameraIcon className="icon" />
                </button>
                <button
                    className={`tab ${mode === "upload" ? "active" : ""}`}
                    onClick={() => setMode("upload")}
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
                    <button className="capture-btn" onClick={takePhoto}>
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
                        accept="image/png, image/jpeg"
                        onChange={handleFileChange}
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
                    <button className="file-remove" onClick={removeFile}>
                        ✕
                    </button>
                </div>
            )}
            <a href={route('Home')} className="redirect-link">
                ¿No quieres tomarte una foto ahora? Podés hacerlo después.
            </a>
            <button className="generate-btn" onClick={handleSubmit}>
                Generar recomendación
            </button>

        </div>
    );
}
