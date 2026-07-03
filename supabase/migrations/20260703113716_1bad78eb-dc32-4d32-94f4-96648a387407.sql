
CREATE POLICY "pod_photos_rider_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pod-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "pod_photos_rider_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'pod-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR private.is_admin(auth.uid())
      OR private.has_role(auth.uid(), 'office'::app_role)
      OR private.has_role(auth.uid(), 'dc_admin'::app_role)
    )
  );

CREATE POLICY "pod_photos_admin_manage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'pod-photos' AND private.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'pod-photos' AND private.is_admin(auth.uid()));
