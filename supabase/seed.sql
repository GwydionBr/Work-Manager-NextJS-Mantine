-- supabase/seed.sql
--
-- create test users
INSERT INTO
    auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) (
        select
            '00000000-0000-0000-0000-000000000000',
            uuid_generate_v4 (),
            'authenticated',
            'authenticated',
            'test' || (ROW_NUMBER() OVER ()) || '@test.com',
            crypt ('TestPassword', gen_salt ('bf')),
            current_timestamp,
            current_timestamp,
            current_timestamp,
            '{"provider":"email","providers":["email"]}',
            '{}',
            current_timestamp,
            current_timestamp,
            '',
            '',
            '',
            ''
        FROM
            generate_series(1, 2)
    );

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- get user_id
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email LIKE 'test%@test.com'
    ORDER BY email
    LIMIT 1;

    UPDATE public.profiles
    SET initialized = true,
        username = 'testuser',
        full_name = 'Test User',
        email = 'test1@test.com',
        avatar_url = 'https://ui-avatars.com/api/?name=Test+User'
    WHERE id = v_user_id;

    -- create finance categories
    INSERT INTO public.finance_category (title, description, user_id) VALUES
        ('Food', 'Food category', v_user_id),
        ('Transportation', 'Transportation category', v_user_id),
        ('Housing', 'Housing category', v_user_id),
        ('Utilities', 'Utilities category', v_user_id),
        ('Entertainment', 'Entertainment category', v_user_id),
        ('Other', 'Other category', v_user_id);

    -- create finance clients
    INSERT INTO public.finance_client (name, user_id) VALUES
    ('Client 1', v_user_id),
    ('Client 2', v_user_id),
    ('Client 3', v_user_id);

    INSERT INTO public.timer_project (title, description, salary, currency, user_id) VALUES
    ('Project 1', 'Project 1 description', 100, 'USD', v_user_id),
    ('Project 2', 'Project 2 description', 200, 'USD', v_user_id),
    ('Project 3', 'Project 3 description', 100, 'USD', v_user_id);

    INSERT INTO public.single_cash_flow (title, user_id, amount) VALUES
    ('Cash Flow 1', v_user_id, 100),
    ('Cash Flow 2', v_user_id, -200),
    ('Cash Flow 3', v_user_id, 100);

    INSERT INTO public.recurring_cash_flow (title, user_id, amount, description, start_date) VALUES
    ('Recurring Cash Flow 1', v_user_id, 100, 'Recurring Cash Flow 1 description', now()),
    ('Recurring Cash Flow 2', v_user_id, -200, 'Recurring Cash Flow 2 description', now()),
    ('Recurring Cash Flow 3', v_user_id, 100, 'Recurring Cash Flow 3 description', now());

END $$;