-- ============================================================
-- CATALOGPRO — SQL COMPLETO v2
-- Planes: Free / Básico / Pro / Founders
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ENUMS
create type user_role as enum ('super_admin','admin','owner','editor');
create type business_plan as enum ('free','basico','pro','founders');
create type subscription_status as enum ('active','grace_period','expired','suspended');
create type event_type as enum ('catalog_view','whatsapp_click','catalog_share_open');
create type payment_method as enum ('efectivo','transferencia','otro');

-- TABLA: businesses (antes de users por FK cruzada)
create table businesses (
  id                        uuid primary key default uuid_generate_v4(),
  name                      text not null,
  slug                      text not null unique,
  description               text,
  logo_url                  text,
  accent_color              text not null default '#25D366',
  whatsapp_number           text,
  whatsapp_message_template text not null default 'Hola! Me interesa este producto: {product_name} - Precio: {product_price}',
  business_category         text default 'otro',
  plan                      business_plan not null default 'free',
  subscription_status       subscription_status not null default 'active',
  subscription_expires_at   timestamptz,
  is_active                 boolean not null default true,
  owner_id                  uuid,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- TABLA: users
create table users (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null unique,
  full_name   text not null,
  role        user_role not null default 'owner',
  business_id uuid references businesses(id) on delete set null,
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table businesses
  add constraint businesses_owner_id_fkey
  foreign key (owner_id) references users(id) on delete set null;

-- TABLA: plan_limits (fuente de verdad para límites)
create table plan_limits (
  plan                  business_plan primary key,
  display_name          text not null,
  max_products          integer,
  max_categories        integer,
  max_editors           integer,
  has_analytics         boolean not null default false,
  analytics_days        integer,
  has_share_tracking    boolean not null default false,
  has_custom_template   boolean not null default false,
  show_branding         boolean not null default true,
  monthly_price_usd     numeric(10,2) not null default 0,
  is_permanent          boolean not null default false
);

insert into plan_limits values
  ('free',     'Free',     10,   1,    0,    false, null, false, false, true,  0.00,  true),
  ('basico',   'Básico',   50,   5,    1,    true,  30,   false, true,  true,  9.00,  false),
  ('pro',      'Pro',      null, null, 1,    true,  90,   true,  true,  false, 19.00, false),
  ('founders', 'Founders', null, null, null, true,  null, true,  true,  false, 0.00,  true);

-- TABLA: subscription_history
create table subscription_history (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references businesses(id) on delete cascade,
  renewed_by      uuid not null references users(id) on delete restrict,
  plan            business_plan not null,
  months_added    integer not null check (months_added >= 0),
  valid_from      date not null,
  valid_until     date,
  payment_method  payment_method not null default 'efectivo',
  note            text,
  created_at      timestamptz not null default now()
);

-- TABLA: categories
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  name        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- TABLA: products
create table products (
  id           uuid primary key default uuid_generate_v4(),
  business_id  uuid not null references businesses(id) on delete cascade,
  category_id  uuid references categories(id) on delete set null,
  name         text not null,
  description  text,
  price        numeric(10,2) not null default 0,
  currency     text not null default 'USD',
  image_url    text,
  is_available boolean not null default true,
  is_featured  boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- TABLA: analytics_events
create table analytics_events (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  product_id  uuid references products(id) on delete set null,
  event_type  event_type not null,
  referrer    text,
  created_at  timestamptz not null default now()
);

-- TABLA: invitations
create table invitations (
  id             uuid primary key default uuid_generate_v4(),
  business_id    uuid not null references businesses(id) on delete cascade,
  invited_email  text not null,
  role           text not null default 'editor',
  token          text not null unique default encode(gen_random_bytes(32),'hex'),
  accepted       boolean not null default false,
  expires_at     timestamptz not null default (now() + interval '72 hours'),
  created_at     timestamptz not null default now()
);

-- TABLA: support_notes
create table support_notes (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  author_id   uuid not null references users(id) on delete cascade,
  note        text not null,
  created_at  timestamptz not null default now()
);

-- ÍNDICES
create index idx_businesses_slug        on businesses(slug);
create index idx_businesses_owner_id    on businesses(owner_id);
create index idx_businesses_plan        on businesses(plan);
create index idx_businesses_sub_status  on businesses(subscription_status);
create index idx_businesses_sub_expires on businesses(subscription_expires_at) where subscription_expires_at is not null;
create index idx_users_email            on users(email);
create index idx_users_business_id      on users(business_id);
create index idx_sub_history_business   on subscription_history(business_id);
create index idx_sub_history_created    on subscription_history(created_at desc);
create index idx_categories_business    on categories(business_id, sort_order);
create index idx_products_business      on products(business_id);
create index idx_products_category      on products(category_id);
create index idx_products_sort          on products(business_id, sort_order);
create index idx_analytics_business     on analytics_events(business_id);
create index idx_analytics_type         on analytics_events(event_type);
create index idx_analytics_created      on analytics_events(created_at desc);

-- RLS
alter table users                enable row level security;
alter table businesses           enable row level security;
alter table plan_limits          enable row level security;
alter table subscription_history enable row level security;
alter table categories           enable row level security;
alter table products             enable row level security;
alter table analytics_events     enable row level security;
alter table invitations          enable row level security;
alter table support_notes        enable row level security;

-- Helper functions
create or replace function get_my_role()
returns user_role language sql security definer stable as $$
  select role from users where id = auth.uid()
$$;
create or replace function get_my_business_id()
returns uuid language sql security definer stable as $$
  select business_id from users where id = auth.uid()
$$;
create or replace function is_platform_admin()
returns boolean language sql security definer stable as $$
  select exists(select 1 from users where id = auth.uid() and role in ('super_admin','admin'))
$$;

-- RLS Policies
create policy "public_read_plan_limits" on plan_limits for select using (true);
create policy "public_read_active_businesses" on businesses for select using (is_active = true);
create policy "platform_admins_all_businesses" on businesses for all using (is_platform_admin()) with check (is_platform_admin());
create policy "owner_editor_select_own_business" on businesses for select using (id = get_my_business_id());
create policy "owner_update_own_business" on businesses for update using (owner_id = auth.uid() or get_my_role() = 'super_admin');
create policy "allow_insert_business" on businesses for insert with check (auth.uid() = owner_id);
create policy "superadmin_delete_businesses" on businesses for delete using (get_my_role() = 'super_admin');
create policy "platform_admins_all_users" on users for all using (is_platform_admin()) with check (is_platform_admin());
create policy "users_select_self" on users for select using (auth.uid() = id or (business_id = get_my_business_id() and get_my_role() = 'owner'));
create policy "users_update_self" on users for update using (auth.uid() = id or get_my_role() = 'super_admin');
create policy "platform_admins_sub_history" on subscription_history for all using (is_platform_admin()) with check (is_platform_admin());
create policy "owner_read_own_sub_history" on subscription_history for select using (business_id = get_my_business_id());
create policy "public_read_categories" on categories for select using (true);
create policy "owner_editor_manage_categories" on categories for all using (business_id = get_my_business_id()) with check (business_id = get_my_business_id());
create policy "platform_admins_read_categories" on categories for select using (is_platform_admin());
create policy "public_read_products" on products for select using (true);
create policy "owner_editor_manage_products" on products for all using (business_id = get_my_business_id()) with check (business_id = get_my_business_id());
create policy "platform_admins_read_products" on products for select using (is_platform_admin());
create policy "public_insert_analytics" on analytics_events for insert with check (true);
create policy "owner_editor_read_analytics" on analytics_events for select using (business_id = get_my_business_id() or is_platform_admin());
create policy "owner_manage_invitations" on invitations for all using (business_id = get_my_business_id() and get_my_role() = 'owner') with check (business_id = get_my_business_id() and get_my_role() = 'owner');
create policy "public_read_invitations" on invitations for select using (true);
create policy "platform_admins_support_notes" on support_notes for all using (is_platform_admin()) with check (is_platform_admin());

-- FUNCIÓN: generar slug único
create or replace function generate_unique_slug(business_name text)
returns text language plpgsql as $$
declare
  base_slug text; final_slug text; counter integer := 1;
begin
  base_slug := lower(business_name);
  base_slug := regexp_replace(base_slug, '[áàäâã]','a','g');
  base_slug := regexp_replace(base_slug, '[éèëê]', 'e','g');
  base_slug := regexp_replace(base_slug, '[íìïî]', 'i','g');
  base_slug := regexp_replace(base_slug, '[óòöôõ]','o','g');
  base_slug := regexp_replace(base_slug, '[úùüû]', 'u','g');
  base_slug := regexp_replace(base_slug, '[ñ]',    'n','g');
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]','','g');
  base_slug := regexp_replace(base_slug, '\s+','-','g');
  base_slug := regexp_replace(base_slug, '-+','-','g');
  base_slug := trim(both '-' from base_slug);
  if length(base_slug) < 3 then base_slug := base_slug || '-negocio'; end if;
  final_slug := base_slug;
  while exists (select 1 from businesses where slug = final_slug) loop
    counter := counter + 1; final_slug := base_slug || '-' || counter;
  end loop;
  return final_slug;
end;
$$;

-- FUNCIÓN: renovar suscripción manualmente
create or replace function renew_subscription(
  p_business_id    uuid,
  p_plan           business_plan,
  p_months         integer,
  p_payment_method payment_method,
  p_note           text default null,
  p_renewed_by     uuid default null
)
returns json language plpgsql security definer as $$
declare
  v_business      businesses%rowtype;
  v_current_expiry date; v_new_expiry date; v_valid_from date;
  v_renewer_id     uuid; v_is_permanent boolean := false;
  v_founders_count integer;
begin
  select * into v_business from businesses where id = p_business_id;
  if not found then return json_build_object('error','Negocio no encontrado'); end if;

  if p_plan = 'founders' then
    select count(*) into v_founders_count from businesses where plan = 'founders' and id != p_business_id;
    if v_founders_count >= 5 then
      return json_build_object('error','Ya se asignaron los 5 planes Founders disponibles.');
    end if;
    v_is_permanent := true;
  end if;

  v_renewer_id := coalesce(p_renewed_by, auth.uid());
  v_valid_from := current_date;

  if v_is_permanent or p_plan = 'free' then
    v_new_expiry := null;
  else
    if v_business.subscription_expires_at is not null
       and v_business.subscription_expires_at::date > current_date then
      v_current_expiry := v_business.subscription_expires_at::date;
      v_valid_from     := v_current_expiry;
    else
      v_current_expiry := current_date;
    end if;
    v_new_expiry := v_current_expiry + (p_months || ' months')::interval;
  end if;

  update businesses set
    plan = p_plan, subscription_status = 'active', is_active = true,
    subscription_expires_at = case when v_new_expiry is null then null else v_new_expiry::timestamptz end,
    updated_at = now()
  where id = p_business_id;

  insert into subscription_history (business_id, renewed_by, plan, months_added, valid_from, valid_until, payment_method, note)
  values (p_business_id, v_renewer_id, p_plan,
    case when v_is_permanent or p_plan = 'free' then 0 else p_months end,
    v_valid_from, v_new_expiry, p_payment_method, p_note);

  return json_build_object('success',true,'plan',p_plan,'valid_from',v_valid_from,'valid_until',v_new_expiry,'permanent',v_is_permanent or p_plan='free');
end;
$$;

-- FUNCIÓN: actualizar estados vencidos (llamar periódicamente)
create or replace function update_subscription_statuses()
returns integer language plpgsql security definer as $$
declare v_updated integer := 0; v_count integer;
begin
  update businesses set subscription_status = 'grace_period', updated_at = now()
  where plan not in ('founders','free') and subscription_expires_at is not null
    and subscription_expires_at < now() and subscription_expires_at >= now() - interval '3 days'
    and subscription_status = 'active' and is_active = true;
  get diagnostics v_count = row_count; v_updated := v_updated + v_count;

  update businesses set subscription_status = 'expired', updated_at = now()
  where plan not in ('founders','free') and subscription_expires_at is not null
    and subscription_expires_at < now() - interval '3 days'
    and subscription_status in ('active','grace_period') and is_active = true;
  get diagnostics v_count = row_count; v_updated := v_updated + v_count;
  return v_updated;
end;
$$;

-- FUNCIÓN: verificar límite de plan
create or replace function check_plan_limit(p_business_id uuid, p_resource text)
returns json language plpgsql security definer as $$
declare v_plan business_plan; v_current integer := 0; v_max integer;
begin
  select plan into v_plan from businesses where id = p_business_id;
  if p_resource = 'products' then
    select count(*) into v_current from products where business_id = p_business_id;
    select max_products into v_max from plan_limits where plan = v_plan;
  elsif p_resource = 'categories' then
    select count(*) into v_current from categories where business_id = p_business_id;
    select max_categories into v_max from plan_limits where plan = v_plan;
  elsif p_resource = 'editors' then
    select count(*) into v_current from users where business_id = p_business_id and role = 'editor';
    select max_editors into v_max from plan_limits where plan = v_plan;
  end if;
  return json_build_object('allowed',(v_max is null) or (v_current < v_max),'current',v_current,'max',v_max,'unlimited',v_max is null,'plan',v_plan);
end;
$$;

-- FUNCIÓN: métricas globales admin
create or replace function get_global_metrics()
returns json language plpgsql security definer as $$
declare v_total integer; v_active integer; v_expired integer; v_clicks integer; v_founders integer;
begin
  select count(*) into v_total from businesses;
  select count(*) filter (where is_active) into v_active from businesses;
  select count(*) filter (where subscription_status = 'expired') into v_expired from businesses;
  select count(*) filter (where plan = 'founders') into v_founders from businesses;
  select count(*) into v_clicks from analytics_events where event_type = 'whatsapp_click' and created_at >= current_date;
  return json_build_object('total_businesses',v_total,'active_businesses',v_active,'expired_count',v_expired,'wa_clicks_today',v_clicks,'founders_used',v_founders,'founders_remaining',5-v_founders);
end;
$$;

-- FUNCIÓN: analytics de negocio
create or replace function get_business_analytics(p_business_id uuid, p_days integer default 30)
returns json language plpgsql security definer as $$
declare v_views integer; v_clicks integer; v_share_opens integer; v_conversion numeric;
begin
  select
    count(*) filter (where event_type = 'catalog_view'),
    count(*) filter (where event_type = 'whatsapp_click'),
    count(*) filter (where event_type = 'catalog_share_open')
  into v_views, v_clicks, v_share_opens
  from analytics_events
  where business_id = p_business_id and created_at >= now() - (p_days || ' days')::interval;
  v_conversion := case when v_views > 0 then round((v_clicks::numeric / v_views * 100),2) else 0 end;
  return json_build_object('catalog_views',v_views,'wa_clicks',v_clicks,'share_opens',v_share_opens,'conversion_rate',v_conversion,'days',p_days);
end;
$$;

-- FUNCIÓN: aceptar invitación de editor
create or replace function accept_invitation(p_token text, p_full_name text, p_email text)
returns json language plpgsql security definer as $$
declare v_inv invitations%rowtype; v_uid uuid;
begin
  select * into v_inv from invitations where token = p_token and accepted = false and expires_at > now();
  if not found then return json_build_object('error','Esta invitación ha expirado o ya fue usada.'); end if;
  insert into users (email, full_name, role, business_id)
  values (p_email, p_full_name, 'editor', v_inv.business_id) returning id into v_uid;
  update invitations set accepted = true where id = v_inv.id;
  return json_build_object('user_id',v_uid,'business_id',v_inv.business_id);
end;
$$;

-- TRIGGERS: updated_at automático
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger trg_businesses_updated_at before update on businesses for each row execute function set_updated_at();
create trigger trg_users_updated_at before update on users for each row execute function set_updated_at();
create trigger trg_categories_updated_at before update on categories for each row execute function set_updated_at();
create trigger trg_products_updated_at before update on products for each row execute function set_updated_at();

-- TRIGGER: validar límite de productos
create or replace function check_product_limit_trigger() returns trigger language plpgsql as $$
declare v_result json; begin
  v_result := check_plan_limit(new.business_id, 'products');
  if not (v_result->>'allowed')::boolean then
    raise exception 'PLAN_LIMIT_REACHED:products:current=%:max=%', v_result->>'current', v_result->>'max';
  end if; return new; end; $$;
create trigger trg_check_product_limit before insert on products for each row execute function check_product_limit_trigger();

-- TRIGGER: validar límite de categorías
create or replace function check_category_limit_trigger() returns trigger language plpgsql as $$
declare v_result json; begin
  v_result := check_plan_limit(new.business_id, 'categories');
  if not (v_result->>'allowed')::boolean then
    raise exception 'PLAN_LIMIT_REACHED:categories:current=%:max=%', v_result->>'current', v_result->>'max';
  end if; return new; end; $$;
create trigger trg_check_category_limit before insert on categories for each row execute function check_category_limit_trigger();

-- ============================================================
-- AUTHENTICATION TRIGGERS (Auto-sync auth.users to public.users)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_first_user boolean;
begin
  -- Check if this is the very first user in the system
  select count(*) = 0 into is_first_user from public.users;

  insert into public.users (id, email, full_name, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when is_first_user then 'super_admin'::user_role else 'owner'::user_role end,
    true
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- VISTAS
create or replace view admin_businesses_view as
select b.id, b.name, b.slug, b.plan, pl.display_name as plan_display_name,
  b.subscription_status, b.subscription_expires_at, b.is_active, b.created_at,
  b.accent_color, b.whatsapp_number, b.business_category,
  u.full_name as owner_name, u.email as owner_email,
  case when b.plan in ('founders','free') then null
       when b.subscription_expires_at is null then null
       else extract(day from (b.subscription_expires_at - now()))::integer end as days_remaining,
  count(distinct p.id) as products_count,
  count(distinct c.id) as categories_count,
  count(distinct wa.id) as total_wa_clicks
from businesses b
join plan_limits pl on pl.plan = b.plan
left join users u on u.id = b.owner_id
left join products p on p.business_id = b.id
left join categories c on c.business_id = b.id
left join analytics_events wa on wa.business_id = b.id and wa.event_type = 'whatsapp_click'
group by b.id, pl.display_name, u.full_name, u.email;

create or replace view public_catalog_view as
select b.id, b.name, b.slug, b.description, b.logo_url, b.accent_color,
  b.whatsapp_number, b.whatsapp_message_template, b.plan,
  pl.show_branding, pl.display_name as plan_display_name
from businesses b
join plan_limits pl on pl.plan = b.plan
where b.is_active = true and b.subscription_status in ('active','grace_period');

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('logos','logos',true),('products','products',true) on conflict (id) do nothing;

drop policy if exists "public_read_logos" on storage.objects;
drop policy if exists "public_read_products" on storage.objects;
drop policy if exists "auth_upload_logos" on storage.objects;
drop policy if exists "auth_upload_products" on storage.objects;
drop policy if exists "auth_update_files" on storage.objects;
drop policy if exists "auth_delete_files" on storage.objects;

create policy "public_read_logos" on storage.objects for select using (bucket_id = 'logos');
create policy "public_read_products" on storage.objects for select using (bucket_id = 'products');
create policy "auth_upload_logos" on storage.objects for insert with check (bucket_id = 'logos' and auth.role() = 'authenticated');
create policy "auth_upload_products" on storage.objects for insert with check (bucket_id = 'products' and auth.role() = 'authenticated');
create policy "auth_update_files" on storage.objects for update using (auth.role() = 'authenticated');
create policy "auth_delete_files" on storage.objects for delete using (auth.role() = 'authenticated');

-- SEED DATA (Only Demo Businesses and Products - Real Auth Users are handled by the App)
do $$
declare
  v_owner1_id     uuid := gen_random_uuid();
  v_owner2_id     uuid := gen_random_uuid();
  v_owner3_id     uuid := gen_random_uuid();
  v_business1_id  uuid := gen_random_uuid();
  v_business2_id  uuid := gen_random_uuid();
  v_business3_id  uuid := gen_random_uuid();
  v_cat_ropa      uuid := gen_random_uuid();
  v_cat_acces     uuid := gen_random_uuid();
  v_cat_ofertas   uuid := gen_random_uuid();
  v_cat_almuerzo  uuid := gen_random_uuid();
  v_cat_gadgets   uuid := gen_random_uuid();
begin
  -- Note: We now use dynamic UUIDs. We ONLY insert mock data into public tables.
  -- For authentication, users must sign up via the frontend which triggers `handle_new_user`.

  insert into users (id, email, full_name, role, is_active) values
    (v_owner1_id,    'elena@modaelena.com',         'Elena Martínez', 'owner',      true),
    (v_owner2_id,    'carlos@saboresdelnorte.com',  'Carlos Díaz',    'owner',      true),
    (v_owner3_id,    'founders@test.com',           'María Founders', 'owner',      true)
  on conflict (id) do nothing;

  insert into businesses (id, name, slug, description, accent_color, whatsapp_number, plan, subscription_status, subscription_expires_at, is_active, owner_id, business_category) values
    (v_business1_id,'Moda Elena','moda-elena','Ropa y accesorios para mujer. Moda actual a precios accesibles.','#E91E8C','+18091234567','pro','active',now()+interval'60 days',true,v_owner1_id,'ropa'),
    (v_business2_id,'Sabores del Norte','sabores-del-norte','Comida casera dominicana. Almuerzos frescos todos los días.','#FF6B35','+18097654321','free','active',null,true,v_owner2_id,'comida'),
    (v_business3_id,'Tech Founders Store','founders-test','Gadgets y tecnología para el hogar y la oficina.','#6366F1','+18095559999','founders','active',null,true,v_owner3_id,'electronica')
  on conflict (id) do nothing;

  update users set business_id = v_business1_id where id = v_owner1_id;
  update users set business_id = v_business2_id where id = v_owner2_id;
  update users set business_id = v_business3_id where id = v_owner3_id;

  insert into categories (id, business_id, name, sort_order) values
    (v_cat_ropa,    v_business1_id,'Ropa de mujer',1),
    (v_cat_acces,   v_business1_id,'Accesorios',2),
    (v_cat_ofertas, v_business1_id,'Ofertas',3),
    (v_cat_almuerzo,v_business2_id,'Almuerzos',1),
    (v_cat_gadgets, v_business3_id,'Gadgets',1)
  on conflict (id) do nothing;

  -- Productos Moda Elena (9)
  insert into products (id,business_id,category_id,name,description,price,currency,image_url,is_available,is_featured,sort_order) values
    (gen_random_uuid(),v_business1_id,v_cat_ropa,   'Blusa floral manga larga','Tela liviana, tallas S-M-L.',18.99,'USD','https://picsum.photos/seed/me01/400/400',true,true,1),
    (gen_random_uuid(),v_business1_id,v_cat_ropa,   'Vestido casual verano','Fresco y cómodo para cualquier ocasión.',32.00,'USD','https://picsum.photos/seed/me02/400/400',true,true,2),
    (gen_random_uuid(),v_business1_id,v_cat_ropa,   'Jeans tiro alto skinny','Alta calidad con elástico en cintura.',28.50,'USD','https://picsum.photos/seed/me03/400/400',true,false,3),
    (gen_random_uuid(),v_business1_id,v_cat_ropa,   'Conjunto deportivo','Top y licra a juego, tela transpirable.',24.00,'USD','https://picsum.photos/seed/me04/400/400',false,false,4),
    (gen_random_uuid(),v_business1_id,v_cat_acces,  'Bolso de cuero sintético','Varios compartimentos, negro y café.',22.99,'USD','https://picsum.photos/seed/me05/400/400',true,true,5),
    (gen_random_uuid(),v_business1_id,v_cat_acces,  'Aretes dorados largos','Elegantes, bañados en oro 18k.',8.50,'USD','https://picsum.photos/seed/me06/400/400',true,false,6),
    (gen_random_uuid(),v_business1_id,v_cat_acces,  'Pulsera tejida multicolor','Artesanal, hecha a mano.',5.00,'USD','https://picsum.photos/seed/me07/400/400',true,false,7),
    (gen_random_uuid(),v_business1_id,v_cat_ofertas,'Blusa básica algodón 2x1','Lleva 2 blusas por el precio de 1.',12.00,'USD','https://picsum.photos/seed/me08/400/400',true,false,8),
    (gen_random_uuid(),v_business1_id,v_cat_ofertas,'Falda floral liquidación','Últimas unidades, descuento 40%.',10.99,'USD','https://picsum.photos/seed/me09/400/400',true,false,9);

  -- Productos Sabores del Norte (8)
  insert into products (id,business_id,category_id,name,description,price,currency,image_url,is_available,is_featured,sort_order) values
    (gen_random_uuid(),v_business2_id,v_cat_almuerzo,'Pollo guisado con arroz','Con habichuelas y ensalada.',6.50,'USD','https://picsum.photos/seed/sn01/400/400',true,true,1),
    (gen_random_uuid(),v_business2_id,v_cat_almuerzo,'Res guisada','Con papas, arroz y tostones.',7.50,'USD','https://picsum.photos/seed/sn02/400/400',true,true,2),
    (gen_random_uuid(),v_business2_id,v_cat_almuerzo,'Pescado frito','Fresco del día, con ensalada.',8.00,'USD','https://picsum.photos/seed/sn03/400/400',true,false,3),
    (gen_random_uuid(),v_business2_id,v_cat_almuerzo,'Cerdo asado','Marinado lentamente, con aguacate.',7.00,'USD','https://picsum.photos/seed/sn04/400/400',true,false,4),
    (gen_random_uuid(),v_business2_id,v_cat_almuerzo,'Sancocho especial','Tres carnes, solo viernes y sábados.',9.00,'USD','https://picsum.photos/seed/sn05/400/400',true,true,5),
    (gen_random_uuid(),v_business2_id,v_cat_almuerzo,'Moro de guandules','Con coco y longaniza.',3.00,'USD','https://picsum.photos/seed/sn06/400/400',true,false,6),
    (gen_random_uuid(),v_business2_id,v_cat_almuerzo,'Tostones con ajo','Crujientes con salsa de ajo casera.',2.50,'USD','https://picsum.photos/seed/sn07/400/400',true,false,7),
    (gen_random_uuid(),v_business2_id,v_cat_almuerzo,'Jugo natural del día','Chinola, tamarindo o parcha.',1.50,'USD','https://picsum.photos/seed/sn08/400/400',false,false,8);

  -- Productos Founders (5)
  insert into products (id,business_id,category_id,name,description,price,currency,image_url,is_available,is_featured,sort_order) values
    (gen_random_uuid(),v_business3_id,v_cat_gadgets,'Auriculares Bluetooth Pro','Cancelación de ruido, 20h batería.',45.00,'USD','https://picsum.photos/seed/tf01/400/400',true,true,1),
    (gen_random_uuid(),v_business3_id,v_cat_gadgets,'Cargador Inalámbrico 15W','Rápido, compatible iPhone y Android.',28.00,'USD','https://picsum.photos/seed/tf02/400/400',true,true,2),
    (gen_random_uuid(),v_business3_id,v_cat_gadgets,'Soporte laptop aluminio','Ajustable, ergonómico.',35.00,'USD','https://picsum.photos/seed/tf03/400/400',true,false,3),
    (gen_random_uuid(),v_business3_id,v_cat_gadgets,'Hub USB-C 7 en 1','HDMI 4K, USB-A x3, SD, 100W PD.',55.00,'USD','https://picsum.photos/seed/tf04/400/400',true,false,4),
    (gen_random_uuid(),v_business3_id,v_cat_gadgets,'Webcam Full HD 1080p','Autofocus, micrófono integrado.',42.00,'USD','https://picsum.photos/seed/tf05/400/400',false,false,5);

  -- Historial suscripciones
  insert into subscription_history (id,business_id,renewed_by,plan,months_added,valid_from,valid_until,payment_method,note) values
    (gen_random_uuid(),v_business1_id,v_owner1_id,'basico',1,(current_date-interval'90 days')::date,(current_date-interval'60 days')::date,'efectivo','Primer pago. Plan Básico 1 mes.'),
    (gen_random_uuid(),v_business1_id,v_owner1_id,'pro',2,(current_date-interval'60 days')::date,(current_date+interval'60 days')::date,'transferencia','Upgrade a Pro. 2 meses adelantados.'),
    (gen_random_uuid(),v_business3_id,v_owner3_id,'founders',0,current_date,null,'otro','Plan Founders asignado manualmente. Cliente beta #1.');

  -- Analytics records
  insert into analytics_events (business_id,event_type,created_at)
  select v_business1_id,'catalog_view',now()-(floor(random()*30)||' days')::interval-(floor(random()*24)||' hours')::interval
  from generate_series(1,780);
  
  insert into analytics_events (business_id,event_type,created_at)
  select v_business2_id,'catalog_view',now()-(floor(random()*30)||' days')::interval-(floor(random()*24)||' hours')::interval
  from generate_series(1,270);
  
  insert into analytics_events (business_id,event_type,created_at)
  select v_business3_id,'catalog_view',now()-(floor(random()*30)||' days')::interval-(floor(random()*24)||' hours')::interval
  from generate_series(1,145);

end $$;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
