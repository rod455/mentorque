-- O bucket "Avatars" do Storage: foto de perfil e fotos de momentos.
--
-- Cada arquivo vive em "<user_id>/<key>.jpg" (lib/app/uploadPhoto.ts): a
-- pasta é o dono. As policies dão escrita só ao dono da pasta e LEITURA
-- PÚBLICA a qualquer um com a URL, porque o app grava a URL pública
-- (getPublicUrl) na sessão e ela precisa abrir em qualquer aparelho da
-- pessoa, logado ou não, sem assinar link. A URL leva o UUID do usuário e não
-- é listável: quem não tem o link não acha a foto.
--
-- O QUE FALTAVA (13/09/2026): a policy de leitura pública existia, mas o
-- interruptor `public` do bucket ficou em falso, e a rota /object/public/
-- responde 400 para bucket privado, mesmo com policy. Foto do perfil e foto
-- de momento apareciam como imagem quebrada. A migração
-- avatars_bucket_publico ligou o interruptor. Este arquivo é o retrato do
-- que tem que existir; se um dia o bucket for recriado, rode-o inteiro.

insert into storage.buckets (id, name, public)
values ('Avatars', 'Avatars', true)
on conflict (id) do update set public = true;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select to public
  using (bucket_id = 'Avatars');

drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'Avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'Avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'Avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'Avatars' and (storage.foldername(name))[1] = auth.uid()::text);
