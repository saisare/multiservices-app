'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';

interface ProfilePhotoUploadProps {
  currentUrl?: string;
  userName: string;
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export function ProfilePhotoUpload({ currentUrl, userName, onUpload, isLoading = false }: ProfilePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format invalid. PNG, JPEG ou WebP seulement');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 5MB)');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      setUploading(true);
      setError('');
      await onUpload(file);
    } catch (err: any) {
      setError(err.message || 'Erreur upload');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative inline-block">
        {/* Photo Preview */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
          {preview ? (
            <img src={preview} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <div className="text-white text-3xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Upload Button Overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isLoading}
            className="absolute inset-0 bg-black/0 hover:bg-black/50 flex items-center justify-center transition group disabled:opacity-50"
          >
            <div className="opacity-0 group-hover:opacity-100 transition">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>

        {/* Clear Button */}
        {preview && preview !== currentUrl && (
          <button
            onClick={() => {
              setPreview(currentUrl || null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || isLoading}
      />

      {/* Help Text */}
      <div className="text-sm text-gray-600">
        <p>Cliquez sur la photo pour changer</p>
        <p className="text-xs text-gray-500">PNG, JPEG ou WebP (max 5MB)</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="text-sm text-blue-600 flex items-center gap-2">
          <div className="animate-spin border-2 border-blue-600 border-t-transparent rounded-full w-4 h-4" />
          Upload en cours...
        </div>
      )}
    </div>
  );
}
