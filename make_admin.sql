-- Run AFTER creating your admin user in Supabase > Authentication > Users.
-- Replace the email below with the admin's email.
insert into public.admins (user_id)
select id from auth.users where email = 'YOUR-EMAIL@example.com';
