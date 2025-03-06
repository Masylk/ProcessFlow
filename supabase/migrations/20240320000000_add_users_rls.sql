-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT
    USING (auth.uid() = auth_id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE
    USING (auth.uid() = auth_id);

-- Allow authenticated users to read has_completed_tutorial
CREATE POLICY "Users can read tutorial status" ON public.users
    FOR SELECT
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to update has_completed_tutorial
CREATE POLICY "Users can update tutorial status" ON public.users
    FOR UPDATE
    USING (auth.uid() = auth_id)
    WITH CHECK (auth.uid() = auth_id);
