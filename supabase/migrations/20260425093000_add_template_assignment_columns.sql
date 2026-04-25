alter table public.invitations
  add column if not exists template_name text,
  add column if not exists template_schema jsonb;

update public.invitations
set template_name = case template
  when 'ELEGANT_LUXURY' then 'Elegant Luxury'
  when 'KOREAN_SOFT' then 'Korean Soft'
  when 'MODERN_MINIMAL' then 'Modern Minimal'
  else replace(template::text, '_', ' ')
end
where template_name is null;

update public.invitations
set template_schema = '[]'::jsonb
where template_schema is null;
