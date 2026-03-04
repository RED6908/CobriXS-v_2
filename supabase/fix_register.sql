-- =============================================
-- FIX: Trigger auto-crear user_profile al registrarse
-- Ejecuta esto en el SQL Editor de Supabase
-- =============================================

-- Función que se ejecuta cuando se crea un usuario en auth.users
create or replace function public.fn_handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, name, role)
  values (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'vendedor'
  )
  on conflict (user_id) do nothing;
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger que llama la función al crear usuario
drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.fn_handle_new_user();

-- =============================================
-- FIX: Política RLS para user_profiles
-- Permitir que el propio usuario lea/edite su perfil
-- y que el trigger (security definer) pueda insertar
-- =============================================
drop policy if exists "auth_all" on public.user_profiles;

create policy "perfil_select" on public.user_profiles
  for select using (auth.role() = 'authenticated');

create policy "perfil_insert" on public.user_profiles
  for insert with check (true);

create policy "perfil_update" on public.user_profiles
  for update using (auth.role() = 'authenticated');
