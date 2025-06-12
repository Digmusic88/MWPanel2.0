import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Camera, AlertTriangle, Loader2, Check } from 'lucide-react';
import { ImageService, ImageValidationError } from '../../services/imageService';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  onImageUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showRemoveButton?: boolean;
  userId?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32'
};

export default function ImageUpload({
  currentImage,
  onImageChange,
  onImageUpload,
  disabled = false,
  size = 'md',
  className = '',
  showRemoveButton = true,
  userId = 'default'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validar archivo
      const validationError = ImageService.validateImageFile(file);
      if (validationError) {
        setError(validationError.message);
        return;
      }

      // Crear preview inmediato
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      let imageUrl: string;

      if (onImageUpload) {
        // Usar función personalizada de subida
        imageUrl = await onImageUpload(file);
      } else {
        // Usar servicio de imágenes por defecto
        const result = await ImageService.uploadImage(file, userId);
        imageUrl = result.url;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Pequeña pausa para mostrar el 100%
      setTimeout(() => {
        onImageChange(imageUrl);
        setPreviewUrl(null);
        setUploadProgress(0);
      }, 500);

    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Error al subir la imagen');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [disabled, onImageChange, onImageUpload, userId]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleRemoveImage = () => {
    if (disabled) return;
    onImageChange(null);
    setPreviewUrl(null);
    setError(null);
  };

  const displayImage = previewUrl || currentImage;
  const showProgress = isUploading && uploadProgress > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Imagen actual o preview */}
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100 relative group cursor-pointer transition-all duration-200 ${
          dragActive ? 'border-emerald-500 bg-emerald-50' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-400'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            {/* Overlay para hover */}
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Indicador de progreso */}
        {showProgress && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              {uploadProgress < 100 ? (
                <>
                  <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-2" />
                  <div className="text-white text-xs">{uploadProgress}%</div>
                </>
              ) : (
                <Check className="w-6 h-6 text-green-400" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botón de eliminar */}
      {showRemoveButton && displayImage && !isUploading && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveImage();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          title="Eliminar imagen"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        className="hidden"
        disabled={disabled}
      />

      {/* Mensaje de error */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-600 text-xs">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Instrucciones */}
    </div>
  );
}