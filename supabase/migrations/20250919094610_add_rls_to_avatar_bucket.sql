-- Policy pour que chaque user authentifié puisse insérer un report pour un autre user
CREATE POLICY "Enable insert for authenticated users only"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
