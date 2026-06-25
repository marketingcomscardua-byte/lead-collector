-- Seed Data for Lead Collector
-- Cole este conteúdo diretamente no SQL Editor do Supabase.
-- Não cole `sql nem `.

-- 1. COMPANIES
INSERT INTO public.companies (id, name, slug, status)
VALUES
('c1', 'TRAÇÃOFORT MAQUINAS E EQUIPAMENTOS LTDA', 'tracaofort-maquinas-e-equipamentos-ltda', 'Ativo'),
('c2', 'PORTO LIVRE', 'porto-livre', 'Ativo'),
('c3', 'MARINE CENTER', 'marine-center', 'Ativo'),
('c4', 'C. SCARDUA LTDA - PA', 'c-scardua-ltda-pa', 'Ativo'),
('c5', 'C. SCARDUA LTDA - M.G', 'c-scardua-ltda-mg', 'Ativo'),
('c6', 'C. SCARDUA LTDA - LINHARES', 'c-scardua-ltda-linhares', 'Ativo'),
('c7', 'C. SCARDUA LTDA - ITARANA', 'c-scardua-ltda-itarana', 'Ativo'),
('c8', 'C. SCARDUA LTDA - CARAPINA', 'c-scardua-ltda-carapina', 'Ativo'),
('c9', 'Comercial Scardua', 'comercial-scardua', 'Ativo'),
('c_sem_empresa', 'Sem Empresa', 'sem-empresa', 'Ativo')
ON CONFLICT (id) DO UPDATE
SET
name = EXCLUDED.name,
slug = EXCLUDED.slug,
status = EXCLUDED.status;

-- 2. PROFILES
-- Atenção: isso cria os perfis do app.
-- Se o app estiver usando Supabase Auth real, os usuários também precisam existir em Authentication > Users.

-- Root Admin
INSERT INTO public.profiles (
id,
name,
username,
email,
phone,
role,
company_id,
status,
is_protected,
password
)
VALUES (
'root-admin',
'Administrador Principal',
'admin',
'[admin@scardua.com.br](mailto:admin@scardua.com.br)',
'27999990000',
'root_admin',
NULL,
'Ativo',
TRUE,
'Psw@1830'
)
ON CONFLICT (id) DO UPDATE
SET
name = EXCLUDED.name,
username = EXCLUDED.username,
email = EXCLUDED.email,
phone = EXCLUDED.phone,
role = EXCLUDED.role,
company_id = EXCLUDED.company_id,
status = EXCLUDED.status,
is_protected = TRUE,
password = EXCLUDED.password;

-- Default Test Sellers
INSERT INTO public.profiles (
id,
name,
username,
email,
phone,
role,
company_id,
status,
is_protected,
password
)
VALUES
('s_test1', 'teste1', 'teste1', '[teste@123.com.br](mailto:teste@123.com.br)', '27995293341', 'vendor', 'c8', 'Ativo', FALSE, '123456'),
('s_ramiro', 'Ramiro', 'ramiro', '[ramiro@scardua.com.br](mailto:ramiro@scardua.com.br)', '27999998888', 'vendor', 'c2', 'Ativo', FALSE, '123')
ON CONFLICT (id) DO UPDATE
SET
name = EXCLUDED.name,
username = EXCLUDED.username,
email = EXCLUDED.email,
phone = EXCLUDED.phone,
role = EXCLUDED.role,
company_id = EXCLUDED.company_id,
status = EXCLUDED.status,
is_protected = EXCLUDED.is_protected,
password = EXCLUDED.password;

-- Portal Lead Default Sellers
INSERT INTO public.profiles (
id,
name,
username,
email,
phone,
role,
company_id,
status,
is_protected,
password
)
VALUES
('s_yuri', 'Yuri', 'yuri', '[yuri@portallead.com.br](mailto:yuri@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_weverson', 'Weverson', 'weverson', '[weverson@portallead.com.br](mailto:weverson@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_solimar', 'Solimar', 'solimar', '[solimar@portallead.com.br](mailto:solimar@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_sandro', 'Sandro', 'sandro', '[sandro@portallead.com.br](mailto:sandro@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_renato', 'Renato', 'renato', '[renato@portallead.com.br](mailto:renato@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_rogerio', 'Rogério', 'rogerio', '[rogerio@portallead.com.br](mailto:rogerio@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_pedro', 'Pedro', 'pedro', '[pedro@portallead.com.br](mailto:pedro@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_patrick', 'Patrick', 'patrick', '[patrick@portallead.com.br](mailto:patrick@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_maicon_m', 'Maicon M.', 'maicon.m', '[maicon.m@portallead.com.br](mailto:maicon.m@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_maicon_g', 'Maicon G.', 'maicon.g', '[maicon.g@portallead.com.br](mailto:maicon.g@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_leonardo', 'Leonardo', 'leonardo', '[leonardo@portallead.com.br](mailto:leonardo@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_leon', 'Leon', 'leon', '[leon@portallead.com.br](mailto:leon@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_juliano', 'Juliano', 'juliano', '[juliano@portallead.com.br](mailto:juliano@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_junio_g', 'Junio Gonçalves', 'junio.goncalves', '[junio.goncalves@portallead.com.br](mailto:junio.goncalves@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_junior_v', 'Junior Vivas', 'junior.vivas', '[junior.vivas@portallead.com.br](mailto:junior.vivas@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_jeferson', 'Jeferson', 'jeferson', '[jeferson@portallead.com.br](mailto:jeferson@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_grimaldo', 'Grimaldo', 'grimaldo', '[grimaldo@portallead.com.br](mailto:grimaldo@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_felipe', 'Felipe', 'felipe', '[felipe@portallead.com.br](mailto:felipe@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_flavio', 'Flavio', 'flavio', '[flavio@portallead.com.br](mailto:flavio@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_fernando_d', 'Fernando Delai', 'fernando.delai', '[fernando.delai@portallead.com.br](mailto:fernando.delai@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_ernandes', 'Ernandes', 'ernandes', '[ernandes@portallead.com.br](mailto:ernandes@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_emilio', 'Emilio', 'emilio', '[emilio@portallead.com.br](mailto:emilio@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_derick', 'Derick', 'derick', '[derick@portallead.com.br](mailto:derick@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_bruno', 'Bruno', 'bruno', '[bruno@portallead.com.br](mailto:bruno@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_arthur', 'Arthur', 'arthur', '[arthur@portallead.com.br](mailto:arthur@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456'),
('s_andre', 'Andre', 'andre', '[andre@portallead.com.br](mailto:andre@portallead.com.br)', '27999999999', 'vendor', 'c_sem_empresa', 'Ativo', FALSE, '123456')
ON CONFLICT (id) DO UPDATE
SET
name = EXCLUDED.name,
username = EXCLUDED.username,
email = EXCLUDED.email,
phone = EXCLUDED.phone,
role = EXCLUDED.role,
company_id = EXCLUDED.company_id,
status = EXCLUDED.status,
is_protected = EXCLUDED.is_protected,
password = EXCLUDED.password;

-- 3. PRODUCTS
INSERT INTO public.products (
id,
name,
brand,
category,
company_id,
company_name,
status
)
VALUES
('p1', 'Agritech', 'Agritech', 'Trator', 'c8', 'C. SCARDUA LTDA - CARAPINA', 'Ativo'),
('p2', 'Agritech', 'Agritech', 'Trator', 'c6', 'C. SCARDUA LTDA - LINHARES', 'Ativo'),
('p3', 'Sunward', 'Sunward', 'Mini Escavadeira', 'c2', 'PORTO LIVRE', 'Ativo'),
('p4', 'YTO ESK305', 'Lovol', 'Escavadeira', 'c2', 'PORTO LIVRE', 'Ativo')
ON CONFLICT (id) DO UPDATE
SET
name = EXCLUDED.name,
brand = EXCLUDED.brand,
category = EXCLUDED.category,
company_id = EXCLUDED.company_id,
company_name = EXCLUDED.company_name,
status = EXCLUDED.status;

-- 4. EVENTS
INSERT INTO public.events (
id,
name,
start_date,
end_date,
state,
state_uf,
city,
city_id,
location,
status,
description,
company_id
)
VALUES (
'e_teixeira',
'Loja Teixeira',
'2026-06-24',
'2026-06-25',
'Bahia',
'BA',
'Teixeira de Freitas',
2931350,
'Centro - Teixeira de Freitas',
'active',
'Evento inicial na Bahia.',
'c2'
)
ON CONFLICT (id) DO UPDATE
SET
name = EXCLUDED.name,
start_date = EXCLUDED.start_date,
end_date = EXCLUDED.end_date,
state = EXCLUDED.state,
state_uf = EXCLUDED.state_uf,
city = EXCLUDED.city,
city_id = EXCLUDED.city_id,
location = EXCLUDED.location,
status = EXCLUDED.status,
description = EXCLUDED.description,
company_id = EXCLUDED.company_id;

-- 5. EVENT PRODUCTS AND SELLERS ASSIGNMENTS
INSERT INTO public.event_products (event_id, product_id)
VALUES
('e_teixeira', 'p4')
ON CONFLICT (event_id, product_id) DO NOTHING;

INSERT INTO public.event_sellers (event_id, seller_id)
VALUES
('e_teixeira', 's_ramiro'),
('e_teixeira', 's_test1')
ON CONFLICT (event_id, seller_id) DO NOTHING;
