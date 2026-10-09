(()=>{
const $=id=>document.getElementById(id);
const SUBMISSIONS_BUCKET='bus-photo-submissions';
const $msg=(text,bad=false)=>{const el=$('uploadMessage');if(el){el.textContent=text;el.style.color=bad?'#b42318':'#167dff'}};
const clean=s=>String(s||'').trim();
function setUploadUI(session){const form=$('uploadForm'),gate=$('uploadGate');if(!form||!gate)return;const signed=!!session?.user;form.hidden=!signed;gate.hidden=signed;if(signed)$msg('Можно загружать фотографию. До одобрения файл хранится приватно и не виден в галерее.');else $msg('');}
async function refreshUploadAuth(){if(typeof sb==='undefined'||!sb)return;const {data:{session}}=await sb.auth.getSession();setUploadUI(session)}
async function submitPhoto(e){e.preventDefault();if(typeof sb==='undefined'||!sb)return $msg('Supabase временно недоступен.',true);
 const button=$('uploadSubmit'),file=$('photoFile')?.files?.[0],model=clean($('photoModel')?.value),city=clean($('photoCity')?.value),country=clean($('photoCountry')?.value);
 if(!file||!model||!city||!country)return $msg('Выберите фото и заполните модель, город и страну.',true);
 if(!['image/jpeg','image/png','image/webp','image/heic','image/heif'].includes(file.type))return $msg('Поддерживаются JPEG, PNG, WebP, HEIC и HEIF.',true);
 if(file.size>50*1024*1024)return $msg('Файл слишком большой. Максимум 50 МБ.',true);
 button.disabled=true;button.textContent='Загружаю…';$msg('Проверяю аккаунт…');let objectPath='';
 try{
  const {data:{user},error:userError}=await sb.auth.getUser();if(userError||!user)throw new Error('Сначала войдите в аккаунт BusFoto.');
  const {data:profile,error:profileError}=await sb.from('users').select('id').eq('auth_user_id',user.id).single();if(profileError||!profile)throw new Error('Профиль BusFoto не найден. Выйдите и войдите снова.');
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';objectPath=`${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  $msg('Загружаю файл в защищённое хранилище…');const {error:uploadError}=await sb.storage.from(SUBMISSIONS_BUCKET).upload(objectPath,file,{contentType:file.type,cacheControl:'3600',upsert:false});if(uploadError)throw uploadError;
  const yearRaw=clean($('photoYear')?.value),vehicleRaw=clean($('photoVehicle')?.value);
  const row={user_id:profile.id,auth_user_id:user.id,model,city,country,operator:clean($('photoOperator')?.value)||null,fleet:clean($('photoFleet')?.value)||null,registration_number:clean($('photoRegistration')?.value),year:yearRaw?Number(yearRaw):null,vehicle_id:vehicleRaw?Number(vehicleRaw):null,story:clean($('photoStory')?.value),file:objectPath,storage_bucket:SUBMISSIONS_BUCKET,status:'pending'};
  const {error:insertError}=await sb.from('photos').insert(row);if(insertError){await sb.storage.from(SUBMISSIONS_BUCKET).remove([objectPath]);throw insertError;}
  e.target.reset();$msg('Готово! Фото отправлено на модерацию. До одобрения оно хранится приватно.');
 }catch(err){console.error(err);$msg(err?.message||'Не удалось загрузить фотографию.',true)}finally{button.disabled=false;button.textContent='Отправить на модерацию'}}
$('uploadForm')?.addEventListener('submit',submitPhoto);refreshUploadAuth();if(typeof sb!=='undefined'&&sb)sb.auth.onAuthStateChange((_event,session)=>setTimeout(()=>setUploadUI(session),0));
})();