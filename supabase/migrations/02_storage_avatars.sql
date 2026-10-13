-- PrepSmart AI - Supabase Storage Setup for Avatars
-- Enables cloud avatar photo uploads and public image serving

-- 1. Create the 'avatars' storage bucket if it does not already exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- 2. Allow public access to view avatar images
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 3. Allow authenticated users to upload avatar images
create policy "Authenticated users can upload avatars."
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

-- 4. Allow authenticated users to update their avatars
create policy "Authenticated users can update their avatars."
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' );

-- 5. Allow authenticated users to delete their avatars
create policy "Authenticated users can delete their avatars."
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'avatars' );
