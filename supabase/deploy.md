# Supabase Database Setup Guide

## 1. Deploy Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `schema.sql`
4. Click **Run** to create all tables and policies

## 2. Seed Initial Data
1. In the same SQL Editor
2. Copy and paste the contents of `seed.sql`
3. Click **Run** to populate questions and classes

## 3. Set Up Storage
1. Go to **Storage** → **Buckets**
2. Create a new bucket called `avatars`
3. Set it to **Public**
4. Add this storage policy:

```sql
-- Allow users to upload avatars
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

## 4. Test the App
1. Restart your dev server: `npm run dev`
2. Go to `http://localhost:3001`
3. Try signing up with a new account
4. Complete the questionnaire
5. Check your profile page

## 5. Verify Database
Check these tables have data:
- `profiles` - should have your user profile
- `questionnaire_questions` - should have 25 questions
- `classes` - should have 5 class definitions
- `questionnaire_responses` - should have your answers

## Troubleshooting
- If you get auth errors, check your `.env.local` has correct Supabase keys
- If tables don't exist, make sure you ran the schema.sql first
- If storage uploads fail, verify the bucket policies are set correctly
