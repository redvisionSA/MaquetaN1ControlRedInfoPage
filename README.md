# ControlRed — Maqueta N1 (Info Page)

Sitio informativo de una sola pagina para ControlRed, distribuidor argentino de seguridad electronica — Powered by Hikvision.

## Contenido
- index.html: sitio completo, autocontenido (HTML + CSS + JS embebidos, imagenes en base64). No requiere build ni dependencias.

## Stack
- HTML / CSS / JS vanilla
- Three.js (via CDN) para la animacion 3D del hero
- Sin frameworks, sin paso de build

## Despliegue en Vercel
Sitio 100% estatico con un unico index.html en la raiz. Vercel lo detecta automaticamente como proyecto Other, sin configuracion adicional.

1. En vercel.com/new, elegi Import Git Repository y seleccioná este repo.
2. Framework Preset: Other.
3. Build Command / Output Directory: vacios.
4. Deploy.

## Estado
Maqueta de prueba N1. El archivo index.html (~1.2MB, con logos embebidos) se sube por separado via git:

git clone https://github.com/redvisionSA/MaquetaN1ControlRedInfoPage.git
cd MaquetaN1ControlRedInfoPage
git add index.html
git commit -m "maquetan1"
git push
