import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LISTAS, useCuenta } from '../cuenta/CuentaContext.jsx'
import { pedir } from '../cuenta/api.js'
import { AvisoError, Campo, Migas, Placa } from '../tienda/piezas.jsx'
import { IconoOjo, IconoUsuario, IconoWhatsapp } from '../tienda/Iconos.jsx'
import { enlaceConsulta } from '../tienda/whatsapp.js'
import Pagina, { usePagina } from './Pagina.jsx'

/**
 * Cuenta de cliente de la tienda (Gremio, Mayorista, Distribuidor).
 *
 * Tres formas de tener cuenta:
 *   - invitacion del vendedor al correo (enlace de un solo uso a /cuenta/activar);
 *   - codigo que el vendedor entrega en mano (/cuenta/activar-codigo);
 *   - registro propio con correo y CUIT/DNI (/cuenta/registrarse, 14/11). Si el
 *     documento es de un cliente pero el correo no es el de su ficha, la cuenta
 *     queda «pendiente» (link PENDING) hasta que el vendedor la aprueba, y
 *     mientras tanto ve la lista Gremio.
 * Los mensajes de error son los que manda el ERP, ya en castellano.
 */

const AVISO_PENDIENTE =
  'Estamos verificando que la cuenta corresponda a ese cliente. Mientras tanto ve los precios de lista Gremio.'

const MIN = 8
const MAX = 128
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* Solo rutas internas del sitio: nunca otro dominio (?volver=//otro.com) */
function destinoSeguro(valor) {
  return typeof valor === 'string' && valor.startsWith('/') && !valor.startsWith('//') ? valor : '/cuenta'
}

function validarNueva(password, repetida) {
  if (password.length < MIN) return { password: `La contraseña debe tener al menos ${MIN} caracteres.` }
  if (password.length > MAX) return { password: `La contraseña puede tener hasta ${MAX} caracteres.` }
  if (password !== repetida) return { repetida: 'Las contraseñas no coinciden.' }
  return {}
}

/* ------------------------------------------------------------ Piezas */

function Marco({ migas, titulo, bajada, children, ancho = 'max-w-md' }) {
  return (
    <Pagina>
      <Migas items={[{ label: 'Inicio', to: '/' }, ...migas]} />
      <div className={`cr-solido mx-auto ${ancho} p-6 sm:p-8`}>
        <span className="cr-senal mb-4">
          <span className="cr-senal__sim">
            <IconoUsuario className="h-3.5 w-3.5" />
          </span>
          <span className="cr-senal__txt">Cuenta de cliente</span>
        </span>
        <h1 className="text-onglass font-display text-2xl font-bold sm:text-3xl">{titulo}</h1>
        {bajada && <p className="cr-muted mt-2 text-sm leading-relaxed">{bajada}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </Pagina>
  )
}

function CampoContrasena({ id, label, error, ayuda, autoComplete, value, onChange }) {
  const [visible, setVisible] = useState(false)
  return (
    <Campo id={id} label={label} error={error} ayuda={ayuda}>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          maxLength={MAX}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="cr-field pr-14 text-base"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 inline-flex w-12 cursor-pointer items-center justify-center rounded-r-2xl text-black/60 hover:text-cr-blue dark:text-white/70"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
        >
          <IconoOjo tachado={visible} className="h-5 w-5" />
        </button>
      </div>
    </Campo>
  )
}

function Enviar({ enviando, children, textoEnviando }) {
  return (
    <button type="submit" disabled={enviando} aria-busy={enviando || undefined} className="cr-btn-primary mt-2 w-full">
      {enviando ? <><span className="cr-led" aria-hidden="true" />{textoEnviando}</> : children}
    </button>
  )
}

function Aviso({ children, info = false }) {
  return (
    <Placa tono={info ? 'info' : 'listo'} cabecera="cuenta" className="mb-5">
      <p>{children}</p>
    </Placa>
  )
}

/** Estado comun de un formulario que llama a la API. */
function useEnvio() {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  async function enviar(fn) {
    setError('')
    setEnviando(true)
    try {
      return await fn()
    } catch (e) {
      setError(e.message || 'No se pudo completar la operación.')
      return undefined
    } finally {
      setEnviando(false)
    }
  }
  return { enviando, error, enviar, limpiar: () => setError('') }
}

/* Contrasena nueva + repeticion (activar, restablecer, cambiar) */
function useContrasenaNueva() {
  const [password, setPassword] = useState('')
  const [repetida, setRepetida] = useState('')
  const [errores, setErrores] = useState({})
  return {
    password,
    validar() {
      const e = validarNueva(password, repetida)
      setErrores(e)
      return Object.keys(e).length === 0
    },
    campos: (
      <>
        <CampoContrasena
          id="password"
          label="Contraseña nueva"
          ayuda={`Entre ${MIN} y ${MAX} caracteres.`}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={errores.password}
        />
        <CampoContrasena id="repetida" label="Repita la contraseña" autoComplete="new-password" value={repetida} onChange={setRepetida} error={errores.repetida} />
      </>
    ),
  }
}

/* ------------------------------------------------------------ /cuenta/ingresar */

export function Ingresar() {
  usePagina({ titulo: 'Ingresar a tu cuenta', indexar: false })
  const { cuenta, ingresar } = useCuenta()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [params] = useSearchParams()
  const destino = destinoSeguro(params.get('volver'))
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})
  const { enviando, error, enviar } = useEnvio()

  if (cuenta && !enviando) return <Navigate to={destino} replace />

  async function onSubmit(event) {
    event.preventDefault()
    const e = {}
    if (!login.trim()) e.login = 'Indicá tu usuario o correo.'
    if (!password) e.password = 'Indicá tu contraseña.'
    setErrores(e)
    if (Object.keys(e).length) return
    const ok = await enviar(() => ingresar(login.trim(), password))
    if (ok) navigate(destino, { replace: true })
  }

  return (
    <Marco
      migas={[{ label: 'Ingresar' }]}
      titulo="Ingresar a tu cuenta"
      bajada="Con tu cuenta ves los precios de tu lista: gremio, mayorista o distribuidor. Si todavía no tenés una, podés crearla con tu correo y tu CUIT o DNI."
    >
      {state?.aviso && <Aviso>{state.aviso}</Aviso>}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Campo id="login" label="Usuario" error={errores.login} ayuda="Tu CUIT o DNI (con o sin guiones) o tu correo.">
          <input
            id="login"
            name="login"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="cr-field text-base"
            aria-invalid={!!errores.login}
          />
        </Campo>
        <CampoContrasena id="password" label="Contraseña" autoComplete="current-password" value={password} onChange={setPassword} error={errores.password} />
        <AvisoError>{error}</AvisoError>
        <Enviar enviando={enviando} textoEnviando="Ingresando…">
          Ingresar
        </Enviar>
      </form>
      <Link to="/cuenta/registrarse" className="cr-btn-glass mt-3 w-full">
        Crear cuenta
      </Link>
      <div className="mt-6 flex flex-col gap-2 border-t cr-hairline pt-5 text-sm">
        <Link to="/cuenta/olvide" className="cr-link font-semibold">
          ¿Olvidaste tu contraseña o tu usuario?
        </Link>
        <Link to="/cuenta/activar-codigo" className="cr-link">
          ¿Tu vendedor te dio un código? Activá tu cuenta
        </Link>
      </div>
    </Marco>
  )
}

/* ------------------------------------------------------------ /cuenta/activar?token= */

function EnlaceInvalido({ titulo, texto }) {
  return (
    <Marco migas={[{ label: titulo }]} titulo={titulo} bajada={texto}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/cuenta/ingresar" className="cr-btn-primary">
          Ingresar
        </Link>
        <a href={enlaceConsulta('asesor')} target="_blank" rel="noopener noreferrer" className="cr-btn-glass">
          <IconoWhatsapp className="h-4 w-4" />
          Hablar con ventas
        </a>
      </div>
    </Marco>
  )
}

export function Activar() {
  usePagina({ titulo: 'Activar tu cuenta', indexar: false })
  const { activar } = useCuenta()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const nueva = useContrasenaNueva()
  const { enviando, error, enviar } = useEnvio()

  if (!token) {
    return (
      <EnlaceInvalido
        titulo="Activar tu cuenta"
        texto="El enlace está incompleto. Abrilo directamente desde el correo de invitación o pedile uno nuevo a tu vendedor."
      />
    )
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (!nueva.validar()) return
    const cuenta = await enviar(() => activar(token, nueva.password))
    if (cuenta) navigate('/cuenta', { replace: true, state: { aviso: 'Tu cuenta quedó activa. Ya podés ingresar con tu usuario o tu correo.' } })
  }

  return (
    <Marco
      migas={[{ label: 'Activar cuenta' }]}
      titulo="Activar tu cuenta"
      bajada="Elegí la contraseña con la que vas a ingresar a la tienda. El enlace de la invitación vale una sola vez y vence a las 72 horas."
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {nueva.campos}
        <AvisoError>{error}</AvisoError>
        <Enviar enviando={enviando} textoEnviando="Activando…">
          Activar cuenta
        </Enviar>
      </form>
      <p className="cr-muted mt-5 text-xs leading-relaxed">
        Si el enlace venció o ya se usó, pedile una invitación nueva a tu vendedor.
      </p>
    </Marco>
  )
}

/* ------------------------------------------------------------ /cuenta/activar-codigo */

/* XXXX-XXXX en mayusculas mientras se escribe */
function formatoCodigo(valor) {
  const limpio = valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  return limpio.length > 4 ? `${limpio.slice(0, 4)}-${limpio.slice(4)}` : limpio
}

export function ActivarCodigo() {
  usePagina({ titulo: 'Activar con código', indexar: false })
  const { activarConCodigo } = useCuenta()
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [errores, setErrores] = useState({})
  const nueva = useContrasenaNueva()
  const { enviando, error, enviar } = useEnvio()

  async function onSubmit(event) {
    event.preventDefault()
    const e = {}
    if (!/^\d{7,11}$/.test(login.replace(/\D/g, '')) || /[^\d\s.-]/.test(login)) e.login = 'Indicá tu CUIT o DNI.'
    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) e.code = 'El código tiene el formato XXXX-XXXX.'
    if (!EMAIL_RE.test(email.trim())) e.email = 'Revisá el correo (ejemplo: nombre@dominio.com).'
    setErrores(e)
    const okNueva = nueva.validar()
    if (Object.keys(e).length || !okNueva) return
    const cuenta = await enviar(() => activarConCodigo({ login: login.trim(), code, email: email.trim(), password: nueva.password }))
    if (cuenta) navigate('/cuenta', { replace: true, state: { aviso: 'Tu cuenta quedó activa. Ya podés ingresar con tu usuario o tu correo.' } })
  }

  return (
    <Marco
      migas={[{ label: 'Activar con código' }]}
      titulo="Activar con código"
      bajada="Usá el código que te dio tu vendedor. Vale 48 horas y una sola vez. El correo que indiques queda como el de tu cuenta para recuperar la contraseña."
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Campo id="login" label="Usuario (CUIT o DNI)" error={errores.login} ayuda="Con o sin guiones.">
          <input
            id="login"
            name="login"
            autoComplete="username"
            inputMode="numeric"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="cr-field text-base"
            aria-invalid={!!errores.login}
          />
        </Campo>
        <Campo id="code" label="Código de activación" error={errores.code}>
          <input
            id="code"
            name="code"
            autoComplete="one-time-code"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="XXXX-XXXX"
            value={code}
            onChange={(e) => setCode(formatoCodigo(e.target.value))}
            className="cr-field num text-base tracking-[0.2em]"
            aria-invalid={!!errores.code}
          />
        </Campo>
        <Campo id="email" label="Correo electrónico" error={errores.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cr-field text-base"
            aria-invalid={!!errores.email}
          />
        </Campo>
        {nueva.campos}
        <AvisoError>{error}</AvisoError>
        <Enviar enviando={enviando} textoEnviando="Activando…">
          Activar cuenta
        </Enviar>
      </form>
      <p className="mt-5 text-sm">
        <Link to="/cuenta/ingresar" className="cr-link">
          ¿Ya activaste tu cuenta? Ingresar
        </Link>
      </p>
    </Marco>
  )
}

/* ------------------------------------------------------------ /cuenta/registrarse */

const RESPUESTA_REGISTRO =
  'Si podés crear una cuenta con ese correo, te enviamos un código de 6 números (vale 15 minutos). Si ya tenés una cuenta, te enviamos tu usuario.'

export function Registrarse() {
  usePagina({ titulo: 'Crear cuenta', indexar: false })
  const { cuenta, registrar } = useCuenta()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [code, setCode] = useState('')
  const [taxId, setTaxId] = useState('')
  const [name, setName] = useState('')
  const [errores, setErrores] = useState({})
  const [reenviado, setReenviado] = useState(false)
  const nueva = useContrasenaNueva()
  const paso1 = useEnvio()
  const paso2 = useEnvio()

  if (cuenta && !paso2.enviando) return <Navigate to="/cuenta" replace />

  /* Paso 1: 202 siempre, exista o no una cuenta con ese correo */
  async function pedirCodigo(event) {
    event?.preventDefault()
    const limpio = email.trim()
    if (!EMAIL_RE.test(limpio)) {
      setErrores({ email: 'Revisá el correo (ejemplo: nombre@dominio.com).' })
      return
    }
    setErrores({})
    const ok = await paso1.enviar(async () => {
      await pedir('auth/register/start', { cuerpo: { email: limpio } })
      return true
    })
    if (ok) {
      paso2.limpiar()
      setReenviado(enviado)
      setEnviado(true)
    }
  }

  async function crear(event) {
    event.preventDefault()
    const e = {}
    if (!/^\d{6}$/.test(code)) e.code = 'El código son 6 números.'
    const digitos = taxId.replace(/\D/g, '')
    if (/[^\d\s.-]/.test(taxId) || !(digitos.length === 11 || (digitos.length >= 7 && digitos.length <= 8))) {
      e.taxId = 'Indicá tu CUIT (11 números) o tu DNI (7 u 8 números).'
    }
    if (name.trim().length < 2) e.name = 'Indicá tu nombre o razón social.'
    setErrores(e)
    const okNueva = nueva.validar()
    if (Object.keys(e).length || !okNueva) return
    const creada = await paso2.enviar(() => registrar({ email: email.trim(), code, taxId: digitos, name: name.trim(), password: nueva.password }))
    if (creada) {
      const aviso =
        creada.link === 'LINKED' && creada.priceTier !== 'GREMIO'
          ? `Tu cuenta quedó creada. Ya ves los precios de tu lista ${LISTAS[creada.priceTier] || creada.priceTier}.`
          : 'Tu cuenta quedó creada.'
      navigate('/cuenta', { replace: true, state: { aviso } })
    }
  }

  return (
    <Marco
      migas={[{ label: 'Ingresar', to: '/cuenta/ingresar' }, { label: 'Crear cuenta' }]}
      titulo="Crear cuenta"
      bajada="Con tu correo y tu CUIT o DNI. Si ya sos cliente de Control Red, la cuenta se vincula a tu ficha y ves los precios de tu lista."
    >
      <form onSubmit={pedirCodigo} noValidate className="flex flex-col gap-4">
        <Campo id="email" label="Correo electrónico" error={errores.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            readOnly={enviado}
            onChange={(e) => setEmail(e.target.value)}
            className={`cr-field text-base ${enviado ? 'opacity-70' : ''}`}
            aria-invalid={!!errores.email}
          />
        </Campo>
        {!enviado && (
          <>
            <AvisoError>{paso1.error}</AvisoError>
            <Enviar enviando={paso1.enviando} textoEnviando="Enviando…">
              Enviar código
            </Enviar>
          </>
        )}
      </form>

      {enviado && (
        <>
          <div className="mt-4">
            <Aviso>{RESPUESTA_REGISTRO}</Aviso>
          </div>
          <form onSubmit={crear} noValidate className="flex flex-col gap-4">
            <Campo id="code" label="Código del correo" error={errores.code}>
              <input
                id="code"
                name="code"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="cr-field num text-base tracking-[0.3em]"
                aria-invalid={!!errores.code}
              />
            </Campo>
            <Campo id="taxId" label="CUIT o DNI" error={errores.taxId} ayuda="Con o sin guiones.">
              <input
                id="taxId"
                name="taxId"
                inputMode="numeric"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="cr-field text-base"
                aria-invalid={!!errores.taxId}
              />
            </Campo>
            <Campo id="name" label="Nombre y apellido o razón social" error={errores.name}>
              <input
                id="name"
                name="name"
                autoComplete="organization"
                maxLength={200}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="cr-field text-base"
                aria-invalid={!!errores.name}
              />
            </Campo>
            {nueva.campos}
            <AvisoError>{paso2.error || paso1.error}</AvisoError>
            <Enviar enviando={paso2.enviando} textoEnviando="Creando cuenta…">
              Crear cuenta
            </Enviar>
          </form>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <button type="button" onClick={() => pedirCodigo()} disabled={paso1.enviando} className="cr-link cursor-pointer font-semibold disabled:opacity-60">
              {paso1.enviando ? 'Enviando…' : reenviado ? 'Código reenviado. Reenviar otra vez' : 'Reenviar el código'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEnviado(false)
                setCode('')
                setReenviado(false)
              }}
              className="cr-link cursor-pointer"
            >
              Usar otro correo
            </button>
          </div>
        </>
      )}

      <p className="mt-6 border-t cr-hairline pt-5 text-sm">
        <Link to="/cuenta/ingresar" className="cr-link font-semibold">
          ¿Ya tenés cuenta? Ingresar
        </Link>
      </p>
    </Marco>
  )
}

/* ------------------------------------------------------------ /cuenta/olvide */

const RESPUESTA_OLVIDE =
  'Si los datos corresponden a una cuenta, te enviamos un correo con las instrucciones. Revisá también la carpeta de correo no deseado.'

function FormOlvide({ id, titulo, texto, label, ayuda, tipo, validar, enviarA }) {
  const [valor, setValor] = useState('')
  const [errorCampo, setErrorCampo] = useState('')
  const [listo, setListo] = useState(false)
  const { enviando, error, enviar } = useEnvio()

  async function onSubmit(event) {
    event.preventDefault()
    const e = validar(valor.trim())
    setErrorCampo(e)
    if (e) return
    /* 202 siempre: se muestra lo mismo exista o no la cuenta */
    const ok = await enviar(async () => {
      await enviarA(valor.trim())
      return true
    })
    if (ok) setListo(true)
  }

  return (
    <section className="cr-sutil rounded-2xl p-5" aria-labelledby={`${id}-titulo`}>
      <h2 id={`${id}-titulo`} className="font-display text-lg font-bold text-black dark:text-white">
        {titulo}
      </h2>
      <p className="cr-muted mt-1 text-sm">{texto}</p>
      {listo ? (
        <div className="mt-4">
          <Aviso>{RESPUESTA_OLVIDE}</Aviso>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-4">
          <Campo id={id} label={label} error={errorCampo} ayuda={ayuda}>
            <input
              id={id}
              name={id}
              type={tipo}
              autoComplete={tipo === 'email' ? 'email' : 'username'}
              inputMode={tipo === 'email' ? 'email' : undefined}
              autoCapitalize="none"
              spellCheck={false}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="cr-field text-base"
              aria-invalid={!!errorCampo}
            />
          </Campo>
          <AvisoError>{error}</AvisoError>
          <Enviar enviando={enviando} textoEnviando="Enviando…">
            Enviar correo
          </Enviar>
        </form>
      )}
    </section>
  )
}

export function Olvide() {
  usePagina({ titulo: 'Recuperar el acceso', indexar: false })
  return (
    <Marco
      migas={[{ label: 'Ingresar', to: '/cuenta/ingresar' }, { label: 'Recuperar el acceso' }]}
      titulo="Recuperar el acceso"
      bajada="Te enviamos un correo a la dirección registrada en tu cuenta. Si tu cuenta no tiene correo, pedile un código de activación a tu vendedor."
      ancho="max-w-3xl"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormOlvide
          id="olvide-contrasena"
          titulo="Olvidé mi contraseña"
          texto="Vas a recibir un enlace para elegir una contraseña nueva. Vence a los 30 minutos."
          label="Usuario o correo"
          ayuda="Tu CUIT o DNI (con o sin guiones) o tu correo."
          tipo="text"
          validar={(v) => (v ? '' : 'Indicá tu usuario o correo.')}
          enviarA={(login) => pedir('auth/forgot-password', { cuerpo: { login } })}
        />
        <FormOlvide
          id="olvide-usuario"
          titulo="Olvidé mi usuario"
          texto="Te enviamos tu usuario al correo de tu cuenta."
          label="Correo electrónico"
          tipo="email"
          validar={(v) => (EMAIL_RE.test(v) ? '' : 'Revisá el correo (ejemplo: nombre@dominio.com).')}
          enviarA={(email) => pedir('auth/forgot-username', { cuerpo: { email } })}
        />
      </div>
      <p className="mt-6 text-sm">
        <Link to="/cuenta/ingresar" className="cr-link font-semibold">
          Volver a ingresar
        </Link>
      </p>
    </Marco>
  )
}

/* ------------------------------------------------------------ /cuenta/restablecer?token= */

export function Restablecer() {
  usePagina({ titulo: 'Contraseña nueva', indexar: false })
  const { restablecer } = useCuenta()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const nueva = useContrasenaNueva()
  const { enviando, error, enviar } = useEnvio()

  if (!token) {
    return (
      <EnlaceInvalido
        titulo="Contraseña nueva"
        texto="El enlace está incompleto. Abrilo directamente desde el correo o pedí uno nuevo en «Olvidé mi contraseña»."
      />
    )
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (!nueva.validar()) return
    const ok = await enviar(async () => {
      await restablecer(token, nueva.password)
      return true
    })
    if (ok) navigate('/cuenta/ingresar', { replace: true, state: { aviso: 'Tu contraseña se actualizó. Ingresá con la contraseña nueva.' } })
  }

  return (
    <Marco
      migas={[{ label: 'Contraseña nueva' }]}
      titulo="Elegir una contraseña nueva"
      bajada="Al guardarla se cierran las sesiones abiertas en todos los dispositivos."
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {nueva.campos}
        <AvisoError>{error}</AvisoError>
        <Enviar enviando={enviando} textoEnviando="Guardando…">
          Guardar contraseña
        </Enviar>
      </form>
      <p className="mt-5 text-sm">
        <Link to="/cuenta/olvide" className="cr-link">
          ¿El enlace venció? Pedí otro
        </Link>
      </p>
    </Marco>
  )
}

/* ------------------------------------------------------------ /cuenta */

function CambiarContrasena() {
  const { cambiarContrasena } = useCuenta()
  const [actual, setActual] = useState('')
  const [errorActual, setErrorActual] = useState('')
  const [listo, setListo] = useState(false)
  const nueva = useContrasenaNueva()
  const { enviando, error, enviar } = useEnvio()

  async function onSubmit(event) {
    event.preventDefault()
    setErrorActual(actual ? '' : 'Indicá tu contraseña actual.')
    const okNueva = nueva.validar()
    if (!actual || !okNueva) return
    const ok = await enviar(async () => {
      await cambiarContrasena(actual, nueva.password)
      return true
    })
    if (ok) setListo(true)
  }

  if (listo) return <Aviso>Tu contraseña se actualizó. Se cerraron las sesiones de los otros dispositivos.</Aviso>

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <CampoContrasena id="actual" label="Contraseña actual" autoComplete="current-password" value={actual} onChange={setActual} error={errorActual} />
      {nueva.campos}
      <AvisoError>{error}</AvisoError>
      <Enviar enviando={enviando} textoEnviando="Guardando…">
        Cambiar contraseña
      </Enviar>
    </form>
  )
}

export function MiCuenta() {
  usePagina({ titulo: 'Mi cuenta', indexar: false })
  const { cuenta, salir } = useCuenta()
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!cuenta) return <Navigate to="/cuenta/ingresar?volver=/cuenta" replace />

  /* Primero se sale de la pagina: si no, al quedar sin cuenta redirigiria a «Ingresar» */
  function onSalir() {
    navigate('/', { replace: true })
    salir()
  }

  return (
    <Pagina>
      <Migas items={[{ label: 'Inicio', to: '/' }, { label: 'Mi cuenta' }]} />
      <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="cr-solido p-6 sm:p-8">
          {state?.aviso && <Aviso>{state.aviso}</Aviso>}
          {cuenta.link === 'PENDING' && <Aviso info>{AVISO_PENDIENTE}</Aviso>}
          <p className="cr-eyebrow mb-2">Mi cuenta</p>
          <h1 className="text-onglass font-display text-2xl font-bold sm:text-3xl">{cuenta.name}</h1>
          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="cr-muted text-xs font-semibold uppercase tracking-wide">Usuario</dt>
              <dd className="num font-semibold text-black dark:text-white">{cuenta.username || 'Ingresás con tu correo'}</dd>
            </div>
            {cuenta.priceTier && (
              <div>
                <dt className="cr-muted text-xs font-semibold uppercase tracking-wide">Lista de precios</dt>
                <dd className="font-semibold text-black dark:text-white">{LISTAS[cuenta.priceTier] || cuenta.priceTier}</dd>
              </div>
            )}
            <div>
              <dt className="cr-muted text-xs font-semibold uppercase tracking-wide">Correo</dt>
              <dd className="break-all font-semibold text-black dark:text-white">{cuenta.email || 'Sin correo registrado'}</dd>
            </div>
          </dl>
          <p className="cr-muted mt-5 text-xs leading-relaxed">
            Para cambiar el correo o los datos de facturación, hablá con tu vendedor.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/productos" className="cr-btn-primary">
              Ver productos
            </Link>
            <button type="button" onClick={onSalir} className="cr-btn-glass">
              Cerrar sesión
            </button>
          </div>
        </div>
        <div className="cr-solido p-6 sm:p-8">
          <h2 className="text-onglass mb-4 font-display text-lg font-bold">Cambiar contraseña</h2>
          <CambiarContrasena />
        </div>
      </div>
    </Pagina>
  )
}
