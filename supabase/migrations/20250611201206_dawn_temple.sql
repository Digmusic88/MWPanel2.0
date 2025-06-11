/*
  # Remove family connections functionality

  1. Cleanup
    - Drop family_connections table if it exists
    - Drop related functions and triggers
    - Handle cases where objects don't exist

  2. Safety
    - Use IF EXISTS clauses to prevent errors
    - Use CASCADE to handle dependencies
*/

-- Drop triggers first (if they exist)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_family_connections_updated_at'
    ) THEN
        DROP TRIGGER trigger_update_family_connections_updated_at ON public.family_connections;
    END IF;
END $$;

-- Drop functions (if they exist)
DROP FUNCTION IF EXISTS public.update_family_connections_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop the family_connections table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'family_connections'
    ) THEN
        DROP TABLE public.family_connections CASCADE;
    END IF;
END $$;

-- Clean up any remaining policies that might reference family_connections
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE policyname LIKE '%family%' OR policyname LIKE '%connection%'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                policy_record.policyname, 
                policy_record.schemaname, 
                policy_record.tablename);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if policy doesn't exist
            NULL;
        END;
    END LOOP;
END $$;