/* =====================================================================
   Catálogo Control Red — fuente única de verdad para el showroom 3D
   y para la tienda. Cada hotspot del mapa 3D apunta acá por `id`.
   Precios en USD, referenciales (IVA no incluido).
   ===================================================================== */

const P = (sku, name, tier, price, specs, cat) => ({ sku, name, tier, price_usd: price, specs, cat, datasheet_url: `https://www.hikvision.com/es-la/search/?q=${encodeURIComponent(sku)}` });

/* ---------- Productos (SKUs oficiales Hikvision) ---------- */
export const PRODUCTS = {
  // Control de acceso MinMoe
  'DS-K1T671M':  P('DS-K1T671M',  'Terminal facial MinMoe 7" LCD',            'Gama Pro',     480, ['6.000 rostros · reconocimiento <0,2 s','Lente dual 2 MP con anti-spoofing','QR dinámico · Mifare · IP65'], 'acceso'),
  'DS-K1T343MX': P('DS-K1T343MX', 'Terminal facial MinMoe compacta 4.3"',     'Gama Media',   220, ['1.500 rostros · TCP/IP + Wi-Fi','Anti-spoofing avanzado','Lector Mifare integrado'], 'acceso'),
  'DS-K1T341AM': P('DS-K1T341AM', 'Terminal facial MinMoe 4.3" Value',        'Gama Media',   150, ['1.500 rostros','Detección de mascarilla','Wiegand / RS-485'], 'acceso'),
  'DS-K1801M':   P('DS-K1801M',   'Lector esclavo Mifare ultradelgado',       'Gama Entrada',  45, ['Wiegand / RS-485','Carcasa ultra delgada','Protección IP65'], 'acceso'),
  // Molinetes / swing barriers
  'DS-K3B961TX': P('DS-K3B961TX', 'Speed gate vidrio alto con núcleo DC',     'Gama Pro',    3900, ['Alas de vidrio 1.200 mm','Servomotor brushless · 45 pers/min','Integra terminal facial MinMoe'], 'acceso'),
  'DS-K3B501SX': P('DS-K3B501SX', 'Swing barrier serie Pro',                  'Gama Media',  2400, ['Detección infrarroja anti-atrapamiento','Indicador LED bidireccional','Fabricado en acero inoxidable 304'], 'acceso'),
  'DS-K3B411SX-L':P('DS-K3B411SX-L','Swing barrier Value carril 600 mm',      'Gama Entrada',1450, ['Apertura 0,3 s','Integración Wiegand','Ideal recepciones y oficinas'], 'acceso'),
  // Smart Hybrid Light / ColorVu
  'DS-2CD2347G2H-LISU/SL': P('DS-2CD2347G2H-LISU/SL','Turret 4 MP Smart Hybrid Light + Strobe & Audio','Gama Pro', 245, ['ColorVu / IR / Hybrid: 3 modos de luz','AcuSense: filtra humanos y vehículos','Sirena y luz estroboscópica integradas'], 'cctv'),
  'DS-2CD2047G2H-LIU':     P('DS-2CD2047G2H-LIU','Bullet 4 MP Smart Hybrid Light','Gama Media', 175, ['Luz blanca solo ante evento humano/vehículo','Micrófono incorporado','IP67 · WDR 130 dB'], 'cctv'),
  'DS-2CD2047G2H-LISU/SL': P('DS-2CD2047G2H-LISU/SL','Bullet 4 MP Hybrid Light con disuasión activa','Gama Media', 210, ['Strobe + audio de advertencia','AcuSense 2.0','IP67'], 'cctv'),
  'DS-2CE10DF3T-LFS':      P('DS-2CE10DF3T-LFS','Bullet TurboHD 2 MP Smart Hybrid Light','Gama Entrada', 48, ['Coaxial · sin re-cableado','Luz blanca hasta 40 m','Micrófono coaxial'], 'cctv'),
  'DS-2CD2387G2H-LISU/SL': P('DS-2CD2387G2H-LISU/SL','Turret 8 MP ColorVu Hybrid + Strobe & Audio','Gama Pro', 290, ['4K color real 24/7 · F1.0','Disuasión activa (luz + audio)','AcuSense 2.0 · IP67'], 'cctv'),
  'DS-2CD2347G2-LU':       P('DS-2CD2347G2-LU','Turret 4 MP ColorVu con micrófono','Gama Media', 190, ['Color real en 0,0005 lux','Micrófono incorporado','Luz cálida suplementaria 30 m'], 'cctv'),
  'DS-2CE10DF3T-F':        P('DS-2CE10DF3T-F','Bullet TurboHD 2 MP ColorVu','Gama Entrada', 40, ['Color 24/7 sobre coaxial','Luz blanca 20 m','IP67'], 'cctv'),
  'DS-2CD2T47G2-LSU/SL':   P('DS-2CD2T47G2-LSU/SL','Bullet 4 MP ColorVu con disuasión','Gama Media', 285, ['Color 24/7 · luz 60 m','Strobe + sirena','AcuSense'], 'cctv'),
  'DS-2CD2046G2-IU/SL':    P('DS-2CD2046G2-IU/SL','Bullet 4 MP AcuSense IP67 con strobe','Gama Entrada', 165, ['Filtrado de falsas alarmas','Luz estroboscópica y audio','IR 40 m'], 'cctv'),
  'DS-2CE12DF3T-PIRXOS':   P('DS-2CE12DF3T-PIRXOS','Bullet TurboHD ColorVu PIR + Strobe','Gama Entrada', 70, ['Sensor PIR integrado','Luz estroboscópica y alarma sonora','Coaxial'], 'cctv'),
  // Grabadores
  'DS-7732NXI-I4/16P/S': P('DS-7732NXI-I4/16P/S','NVR DeepinMind 32 ch · 16 PoE · AcuSeek','Gama Pro', 1650, ['Búsqueda por lenguaje natural (AcuSeek)','Reconocimiento facial y análisis perimetral','4 HDD · 4K · H.265+'], 'nvr'),
  'DS-7616NXI-K2/16P':   P('DS-7616NXI-K2/16P','NVR AcuSense 16 ch · 16 PoE','Gama Media', 520, ['Filtra humanos/vehículos en todos los canales','2 HDD · 4K','Alarma por luz/audio en cámaras compatibles'], 'nvr'),
  'iDS-7208HUHI-M2/S':   P('iDS-7208HUHI-M2/S','DVR AcuSense 8 ch 5 MP híbrido','Gama Entrada', 160, ['Coaxial + IP en un solo equipo','AcuSense en 8 canales','Audio por coaxial'], 'nvr'),
  // AX PRO
  'DS-PWA96-M-WE':    P('DS-PWA96-M-WE','Hub AX PRO 96 zonas · Wi-Fi/LAN/4G','Gama Pro', 310, ['Comunicación Tri-X encriptada','App Hik-Connect · Hik-ProConnect','Automatización con relés'], 'alarma'),
  'DS-PDPC12P-EG2-WE':P('DS-PDPC12P-EG2-WE','Detector PIR-Cam inalámbrico','Gama Media', 120, ['Verificación por foto ante evento','Inmunidad a mascotas','Batería 3 años'], 'alarma'),
  'DS-PS1-E-WE':      P('DS-PS1-E-WE','Sirena exterior inalámbrica con strobe','Gama Media', 95, ['110 dB · IP65','Luz estroboscópica','Anti-desmontaje'], 'alarma'),
  'DS-PDMC-EG2-WE':   P('DS-PDMC-EG2-WE','Contacto magnético inalámbrico','Gama Entrada', 24, ['Puertas y ventanas','Batería 5 años','Tamper'], 'alarma'),
  // ANPR / barreras
  'iDS-2CD7A46G0/P-IZHSY': P('iDS-2CD7A46G0/P-IZHSY','Bullet DeepinView 4 MP ANPR + metadatos','Gama Pro', 890, ['Lee patentes en <100 ms','Marca, color y tipo de vehículo','Lista blanca / apertura de barrera'], 'anpr'),
  'iDS-2CD7A26G0/P-IZHS':  P('iDS-2CD7A26G0/P-IZHS','Bullet DeepinView 2 MP ANPR','Gama Media', 620, ['Reconocimiento de patentes','Control de barrera por relé','IP67 · IK10'], 'anpr'),
  'DS-TMG4B0-A':           P('DS-TMG4B0-A','Barrera vehicular brazo recto 4 m','Gama Media', 1100, ['Apertura 3 s','Motor sin escobillas','Integra con cámara ANPR'], 'anpr'),
  'iDS-TCM403-AI':         P('iDS-TCM403-AI','Cámara checkpoint 4 MP ANPR + radar','Gama Pro', 1350, ['Captura y velocidad por radar','Metadatos de vehículo','Uso en playas de maniobra'], 'anpr'),
  // Conectividad
  'DS-3E1310P-SI':  P('DS-3E1310P-SI','Switch PoE gestionable 8 + 2 SFP','Gama Pro', 390, ['110 W PoE · VLAN','Topología de red y watchdog','Hik-Partner Pro'], 'red'),
  'DS-3E0310P-E/M':P('DS-3E0310P-E/M','Switch PoE 8 puertos no gestionable','Gama Media', 145, ['PoE 250 m modo extendido','Prioridad de tráfico','Fanless'], 'red'),
  'DS-3WF02C-5AC/O':P('DS-3WF02C-5AC/O','Puente inalámbrico 5 GHz exterior','Gama Entrada', 85, ['Enlace punto a punto 5 km','867 Mbps','PoE pasivo'], 'red'),
  'DS-3WF01C-2N/O': P('DS-3WF01C-2N/O','Puente inalámbrico 2.4 GHz ascensores/exterior','Gama Entrada', 60, ['300 Mbps','Plug & play','IP65'], 'red'),
  // TandemVu / PTZ / radar
  'DS-2SF8C442MXS-DLW(24F0)(P3)': P('DS-2SF8C442MXS-DLW(24F0)(P3)','TandemVu 8" 4 MP + panorámica 4 MP · limpiaparabrisas','Gama Pro', 4200, ['Panorámica fija + PTZ 42x en una unidad','Smart tracking con strobe blanco','IR 400 m · limpiaparabrisas'], 'ptz'),
  'DS-2SE7C425MW-AEB(14F1)(P3)':  P('DS-2SE7C425MW-AEB(14F1)(P3)','TandemVu 7" 4 MP 25x + panorámica','Gama Media', 2300, ['Visión global + detalle simultáneos','AcuSense en ambos lentes','IR 200 m'], 'ptz'),
  'DS-2SE4C425MWG-E/26(F0)':      P('DS-2SE4C425MWG-E/26(F0)','TandemVu 4" ColorVu + PTZ 25x','Gama Entrada', 1150, ['Panorámica a color 24/7','PTZ 25x AcuSense','Compacta para countries'], 'ptz'),
  'DS-2DF8C842IXS-AELW(T5)': P('DS-2DF8C842IXS-AELW(T5)','PTZ DarkFighterX 8 MP 42x · limpiaparabrisas','Gama Pro', 5200, ['Sensor dual DarkFighterX (color + IR fusionados)','Zoom 42x · IR 400 m','Tracking automático · Rapid Focus'], 'ptz'),
  'DS-2DE7A432IW-AEB(T5)':   P('DS-2DE7A432IW-AEB(T5)','PTZ 7" 4 MP 32x DarkFighter','Gama Media', 1650, ['Zoom 32x · IR 200 m','AcuSense + auto-tracking','IK10 · IP67'], 'ptz'),
  'DS-2DE4425IW-DE(T5)':     P('DS-2DE4425IW-DE(T5)','PTZ 4" 4 MP 25x','Gama Entrada', 720, ['Zoom 25x · IR 100 m','AcuSense · patrullas','Vinculable a radar'], 'ptz'),
  'DS-PR1-120': P('DS-PR1-120','Radar de seguridad 120 m',      'Gama Pro',   2900, ['Cobertura 120 m · 100°','Vincula hasta 4 PTZ para tracking','Inmune a lluvia, niebla y vegetación'], 'radar'),
  'DS-PR1-60':  P('DS-PR1-60', 'Radar de seguridad 60 m',       'Gama Media', 1600, ['Cobertura 60 m · 120°','Velocidad y trayectoria de objetivos','Zonas y reglas VCA'], 'radar'),
  // Térmicas
  'DS-2TD2628-3/QA':  P('DS-2TD2628-3/QA','Bullet HeatPro biespectral 256 × 192 + 4 MP','Gama Pro', 1450, ['Detección perimetral térmica 100+ m','Alarma por temperatura (incendio temprano)','Strobe y audio de disuasión'], 'termica'),
  'DS-2TD2617-3/QA':  P('DS-2TD2617-3/QA','Bullet HeatPro 160 × 120 + 4 MP','Gama Media', 1150, ['Fusión térmica + óptica','Detección de fuego','IP67'], 'termica'),
  'DS-2TD1228-2/QA':  P('DS-2TD1228-2/QA','Turret HeatPro biespectral','Gama Entrada', 790, ['Térmica 256 × 192','Alarma de temperatura','Compacta'], 'termica'),
  'DS-2TD2166-25/V1': P('DS-2TD2166-25/V1','Bullet térmica 640 × 512 · 25 mm','Gama Pro', 2600, ['Alcance de detección humana 1.500+ m','Medición de temperatura','Anti-incendio industrial'], 'termica'),
  'DS-2TD2137-15/PY': P('DS-2TD2137-15/PY','Bullet térmica detección de incendio 384 × 288','Gama Media', 1900, ['Alarma por punto y gradiente térmico','Alarma de humo + fuego','Termografía continua'], 'termica'),
  'DS-2TD4237-25/W':  P('DS-2TD4237-25/W','PTZ térmica biespectral 384 × 288 · 25 mm','Gama Pro', 6900, ['Detección de fuego a 3 km','PTZ óptico 36x + térmico','Uso forestal y agro'], 'termica'),
  // PanoVu
  'DS-2CD6944G0-IHS': P('DS-2CD6944G0-IHS','PanoVu 4 × 4 MP 180°','Gama Pro', 1900, ['Cuatro sensores en un domo','Cobertura 180° sin puntos ciegos','AcuSense'], 'cctv'),
  'DS-2CD6365G0E-IVS':P('DS-2CD6365G0E-IVS','Fisheye 6 MP 360°','Gama Media', 780, ['360° · dewarping en NVR','Mapa de calor y conteo','IR 15 m'], 'cctv'),
  // Intercom
  'DS-KD8003-IME1': P('DS-KD8003-IME1','Frente de calle modular IP TalkVu','Gama Pro', 330, ['Cámara 2 MP HDR','Módulos: teclado, lector, display','Llamada a app Hik-Connect'], 'intercom'),
  'DS-KH6320-WTE1': P('DS-KH6320-WTE1','Monitor interior 7" Wi-Fi','Gama Media', 210, ['Pantalla táctil','Desvío a smartphone','Integración AX PRO'], 'intercom'),
  'DS-KV6113-WPE1': P('DS-KV6113-WPE1','Frente de calle villa 1 botón Wi-Fi','Gama Entrada', 180, ['Cámara 2 MP gran angular','Lector Mifare','PoE / Wi-Fi'], 'intercom'),
  // Móvil
  'AE-MD5043-SD/GLF/WI58': P('AE-MD5043-SD/GLF/WI58','MDVR 4 ch 4G/Wi-Fi/GPS','Gama Pro', 980, ['Telemetría y geocerca','DSM fatiga + ADAS','HikCentral Mobility'], 'movil'),
  'AE-DC5313-C6': P('AE-DC5313-C6','Dashcam 4K con GPS y Wi-Fi','Gama Media', 140, ['Grabación 4K + cámara trasera','Detección de impacto','App móvil'], 'movil'),
  'AE-VC153T-ITS':P('AE-VC153T-ITS','Cámara móvil 2 MP IR para cabina','Gama Entrada', 95, ['Anti-vibración','IR 10 m','Conector aviación'], 'movil'),
  // Solar
  'DS-2XS6A46G1-IZS/C36S80':    P('DS-2XS6A46G1-IZS/C36S80','Kit solar 80 W · PTZ 4 MP 4G',  'Gama Pro', 1950, ['Panel 80 W + batería 360 Wh','Autonomía 7 días sin sol','Zoom 4x · AcuSense · 4G'], 'solar'),
  'DS-2XS2T47G1-LDH/4G/C18S40': P('DS-2XS2T47G1-LDH/4G/C18S40','Cámara solar ColorVu 4 MP 4G',  'Gama Media', 690, ['Color 24/7 · panel 40 W','Batería de litio integrada','Audio bidireccional · strobe'], 'solar'),
  'DS-2XS6A25G0-I/CH20S40':     P('DS-2XS6A25G0-I/CH20S40','Cámara solar 2 MP 4G',          'Gama Media', 520, ['Panel 40 W · batería 20 Ah','Bajo consumo con PIR','IR 30 m'], 'solar'),
  'DS-2XS2T41G1-ID/4G/C05S07':  P('DS-2XS2T41G1-ID/4G/C05S07','Cámara solar compacta 4 MP 4G','Gama Entrada', 310, ['Todo en uno · instalación en 10 min','Activación por PIR','Alertas a Hik-Connect'], 'solar'),
};

/* ---------- Escenas / mapas 3D ---------- */
export const SCENES = [
  { id:'office',    name:'Oficinas',   short:'Edificio corporativo, parking y garita', color:'#344AB2',
    objective:'Recepción desatendida, control de horarios, intrusión fuera de turno y búsqueda de incidentes en segundos.' },
  { id:'country',   name:'Countries',  short:'Barrio cerrado con perímetro y pórtico', color:'#FFB703',
    objective:'Cero falsas alarmas por vegetación o animales, ingreso vehicular sin demoras y perímetro custodiado a oscuras.' },
  { id:'warehouse', name:'Depósitos',  short:'Centro logístico con docks y camiones', color:'#F04E23',
    objective:'Prevenir incendios, fiscalizar maniobras, evitar robos en zonas sin luz y auditar velocidad en planta.' },
  { id:'agro',      name:'Agro',       short:'Campo con silobolsas y galpón de maquinaria', color:'#1F9D55',
    objective:'Proteger kilómetros sin red ni energía fija, anticipar incendios y custodiar maquinaria y bombas.' },
];

/* ---------- Hotspots: dispositivo en el mapa → tecnología → productos ---------- */
const H = (id, scene, title, tech, highlight, skus, feed) => ({ id, scene, title, technology_name: tech, feature_highlight: highlight, skus, feed });

export const HOTSPOTS = [
  // OFICINAS
  H('office_minmoe',   'office','Acceso facial MinMoe + TalkVu','Control de acceso facial MinMoe & Intercom IP','Reconocimiento biométrico en 0,2 s con detección de rostro vivo y videollamada IP a recepción.',
    ['DS-K1T671M','DS-K1T343MX','DS-K1801M','DS-KD8003-IME1'], 'color'),
  H('office_speedgate','office','Speed gate de vidrio','Molinetes Swing Barrier / Speed Gate','Alas de vidrio que se abren en 0,3 s con luz verde al validar el rostro; anti-tailgating por IR.',
    ['DS-K3B961TX','DS-K3B501SX','DS-K3B411SX-L'], 'color'),
  H('office_hybrid',   'office','Cámara Smart Hybrid Light','Smart Hybrid Light (IR + luz blanca inteligente)','IR discreto por defecto; ante un humano enciende luz blanca y graba a todo color.',
    ['DS-2CD2347G2H-LISU/SL','DS-2CD2047G2H-LIU','DS-2CE10DF3T-LFS'], 'ir'),
  H('office_nvr',      'office','NVR DeepinMind · AcuSeek','Búsqueda por lenguaje natural AcuSeek','Escribís "persona con campera roja" y el NVR devuelve el clip exacto en segundos.',
    ['DS-7732NXI-I4/16P/S','DS-7616NXI-K2/16P','iDS-7208HUHI-M2/S'], null),
  H('office_axpro',    'office','Alarma AX PRO','Intrusión inalámbrica AX PRO con PIR-Cam','Detecta fuera de turno, verifica con foto y dispara sirena + strobe antes de que entren.',
    ['DS-PWA96-M-WE','DS-PDPC12P-EG2-WE','DS-PS1-E-WE','DS-PDMC-EG2-WE'], null),
  H('office_lpr',      'office','Barrera + cámara ANPR','Acceso vehicular con lectura de patentes','Lee la patente en <100 ms, valida lista blanca y levanta la barrera sin frenar el auto.',
    ['iDS-2CD7A46G0/P-IZHSY','DS-TMG4B0-A','iDS-2CD7A26G0/P-IZHS'], 'color'),
  H('office_network',  'office','Rack de conectividad','Switching PoE gestionable Hik-Partner Pro','Topología, watchdog PoE y reinicio remoto de cámaras desde una sola app.',
    ['DS-3E1310P-SI','DS-3E0310P-E/M','DS-3WF02C-5AC/O'], null),

  // COUNTRIES
  H('country_tandemvu','country','PTZ TandemVu','TandemVu: panorámica + PTZ en una unidad','El lente fijo vigila todo el frente 24/7 mientras el PTZ persigue y acerca al objetivo.',
    ['DS-2SF8C442MXS-DLW(24F0)(P3)','DS-2SE7C425MW-AEB(14F1)(P3)','DS-2SE4C425MWG-E/26(F0)'], 'color'),
  H('country_radar',   'country','Radar de seguridad','Radar de seguridad + speed dome','Detección por radiofrecuencia hasta 120 m que gira la cámara al objetivo, con lluvia o niebla.',
    ['DS-PR1-120','DS-PR1-60','DS-2DE4425IW-DE(T5)'], null),
  H('country_heatpro', 'country','Cámara térmica HeatPro','Térmica biespectral HeatPro','Un animal no dispara alarma, un humano sí: reglas VCA sobre radiación infrarroja, inmune a ramas y lluvia.',
    ['DS-2TD2628-3/QA','DS-2TD2617-3/QA','DS-2TD1228-2/QA'], 'thermal'),
  H('country_lpr',     'country','Pórtico ANPR','Acceso vehicular ANPR con metadatos','Patente, marca y color en <100 ms; la barrera se levanta con el auto en movimiento.',
    ['iDS-2CD7A46G0/P-IZHSY','DS-TMG4B0-A','iDS-2CD7A26G0/P-IZHS'], 'color'),
  H('country_panovu',  'country','Cámara panorámica PanoVu','PanoVu 180° / 360°','Cuatro sensores en un domo: toda la plaza central sin puntos ciegos ni cámaras extra.',
    ['DS-2CD6944G0-IHS','DS-2CD6365G0E-IVS','DS-2CD2387G2H-LISU/SL'], 'color'),
  H('country_deter',   'country','Cámara con disuasión activa','AcuSense con luz estroboscópica y audio','Distingue humano de perro y, si corresponde, enciende strobe y mensaje de voz.',
    ['DS-2CD2387G2H-LISU/SL','DS-2CD2047G2H-LISU/SL','DS-2CE12DF3T-PIRXOS'], 'color'),
  H('country_intercom','country','Portero IP TalkVu','Videoportero IP con desvío a celular','Visitas y delivery atendidos desde el teléfono, apertura remota y registro con foto.',
    ['DS-KD8003-IME1','DS-KH6320-WTE1','DS-KV6113-WPE1'], null),

  // DEPÓSITOS
  H('wh_colorvu',   'warehouse','Cámara ColorVu 4K','ColorVu con apertura F1.0','Color real en oscuridad absoluta: uniforme, color de paquete y patente sin reflectores.',
    ['DS-2CD2387G2H-LISU/SL','DS-2CD2347G2-LU','DS-2CE10DF3T-F'], 'split'),
  H('wh_thermal',   'warehouse','Térmica anti-incendio','Termografía para detección temprana de incendio','Alerta por umbral (65 °C) y gradiente térmico sobre pallets o tableros antes de la llama.',
    ['DS-2TD2166-25/V1','DS-2TD2137-15/PY','DS-2TD2628-3/QA','DS-2TD1228-2/QA'], 'thermal'),
  H('wh_speed',     'warehouse','Radar de velocidad en docks','Control de tránsito interno con radar','Velocidad de camiones y autoelevadores con captura de patente e infracción automática.',
    ['DS-PR1-60','iDS-TCM403-AI','DS-2CD2T47G2-LSU/SL'], 'color'),
  H('wh_mdvr',      'warehouse','Dashcam / MDVR en camión','Video móvil HikCentral Mobility','Telemetría, fatiga del conductor (DSM) y ADAS en camiones y autoelevadores.',
    ['AE-MD5043-SD/GLF/WI58','AE-DC5313-C6','AE-VC153T-ITS'], 'dash'),
  H('wh_access',    'warehouse','Acceso a depósito','Control de acceso facial en puerta de dock','Solo personal habilitado por turno, sin tarjetas prestadas ni llaves perdidas.',
    ['DS-K1T343MX','DS-K1T341AM','DS-K1801M'], null),
  H('wh_acusense',  'warehouse','Grabador AcuSense','Grabación con filtrado de falsas alarmas','Clasifica humano/vehículo y avisa solo por lo que importa; búsqueda rápida por evento.',
    ['DS-7616NXI-K2/16P','DS-2CD2046G2-IU/SL','iDS-7208HUHI-M2/S'], null),

  // AGRO
  H('agro_solar',   'agro','Cámara solar 4G','Sistemas autónomos solares con 4G/5G','Sin cables ni red eléctrica: panel + batería de litio y alertas a Hik-Connect por 4G.',
    ['DS-2XS6A46G1-IZS/C36S80','DS-2XS2T47G1-LDH/4G/C18S40','DS-2XS6A25G0-I/CH20S40','DS-2XS2T41G1-ID/4G/C05S07'], 'color'),
  H('agro_ptz',     'agro','PTZ DarkFighterX 42x','PTZ de largo alcance DarkFighterX / DeepinView','Zoom óptico 32x–42x para vigilar tranqueras a cientos de metros, de noche y a color.',
    ['DS-2DF8C842IXS-AELW(T5)','DS-2DE7A432IW-AEB(T5)','DS-2DE4425IW-DE(T5)'], 'zoom'),
  H('agro_fire',    'agro','PTZ térmica anti-incendio','Termografía forestal de detección de fuego','Detecta columnas de humo y anomalías de calor a hasta 3 km y fija coordenadas del foco.',
    ['DS-2TD4237-25/W','DS-2TD2166-25/V1','DS-2TD2137-15/PY'], 'thermal'),
  H('agro_line',    'agro','Silobolsas · cruce de línea','Línea virtual con audio bidireccional','Vehículo no autorizado de noche: la cámara solar habla, enciende strobe y avisa al celular.',
    ['DS-2XS2T47G1-LDH/4G/C18S40','DS-2XS6A25G0-I/CH20S40','DS-2XS2T41G1-ID/4G/C05S07'], 'color'),
  H('agro_radar',   'agro','Radar milimétrico perimetral','Radar de seguridad en campo abierto','120 m de cobertura por sector que giran una PTZ al objetivo, sin falsas alarmas por pasto.',
    ['DS-PR1-120','DS-PR1-60','DS-2DE4425IW-DE(T5)'], null),
  H('agro_bridge',  'agro','Enlace inalámbrico','Puentes inalámbricos punto a punto','Llevá video del galpón a la casa principal a 5 km sin tender fibra ni cobre.',
    ['DS-3WF02C-5AC/O','DS-3WF01C-2N/O'], null),
];

export const CATEGORIES = [
  { id:'cctv', name:'Cámaras' }, { id:'ptz', name:'PTZ / TandemVu' }, { id:'termica', name:'Térmicas' },
  { id:'acceso', name:'Control de acceso' }, { id:'anpr', name:'ANPR y barreras' }, { id:'radar', name:'Radares' },
  { id:'alarma', name:'Alarmas AX PRO' }, { id:'nvr', name:'Grabadores' }, { id:'solar', name:'Solares 4G' },
  { id:'movil', name:'Video móvil' }, { id:'intercom', name:'Intercom' }, { id:'red', name:'Conectividad' },
];

export const hotspotById = (id) => HOTSPOTS.find(h => h.id === id);
export const productsFor = (hotspot) => hotspot.skus.map(s => PRODUCTS[s]).filter(Boolean).sort((a, b) => b.price_usd - a.price_usd);
export const allProducts = () => Object.values(PRODUCTS).sort((a, b) => b.price_usd - a.price_usd);
export const fmtUSD = (n) => 'US$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 });
