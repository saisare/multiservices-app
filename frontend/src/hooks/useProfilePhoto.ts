'use client';

import { useState, useCallback } from 'react';

interface UseProfilePhotoProps {
  userId: number | string;
  currentPhotoUrl?: string;
}

interface UseProfilePhotoReturn {
  photoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  uploadPhoto: (file: File) => Promise<void>;
  removePhoto: () => Promise<void>;
}

export function useProfilePhoto({ userId, currentPhotoUrl }: UseProfilePhotoProps): UseProfilePhotoReturn {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = useCallback(
    async (file: File) => {
      try {
        setIsLoading(true);
        setError(null);

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId.toString());

        // Upload to backend
        const response = await fetch('/api/users/profile-photo', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        setPhotoUrl(data.photoUrl);

        // Update localStorage user data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.photoUrl = data.photoUrl;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (err: any) {
        setError(err.message || 'Erreur upload photo');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const removePhoto = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/users/profile-photo?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setPhotoUrl(null);

      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      delete user.photoUrl;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err: any) {
      setError(err.message || 'Erreur suppression photo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    photoUrl,
    isLoading,
    error,
    uploadPhoto,
    removePhoto
  };
}
