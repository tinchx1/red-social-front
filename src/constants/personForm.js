// Account type options for the person form
export const ACCOUNT_TYPE_OPTIONS = [
  { value: "person", label: "Persona" },
  { value: "business", label: "Empresa" },
  { value: "industrial", label: "Parque Industrial" },
]

// Form field names for validation
export const FORM_FIELDS = {
  // Stage 1 - Personal Info
  NOMBRE: 'nombre',
  APELLIDO: 'apellido',
  EMAIL: 'email',
  TELEFONO: 'telefono',
  PROVINCIA: 'provincia',
  CIUDAD: 'ciudad',
  CONTRASEÑA: 'contraseña',
  CONFIRMAR_CONTRASEÑA: 'confirmarContraseña',
  // Stage 2 - Professional Info
  RUBRO_INDUSTRIA: 'rubroIndustria',
  EMPRESA: 'empresa',
  SECTORES_INDUSTRIALES: 'sectoresIndustriales',
  ACEPTA_TERMINOS: 'aceptaTerminos',
}

// Form stages configuration
export const FORM_STAGES = {
  PERSONAL_INFO: 1,
  PROFESSIONAL_INFO: 2,
}

// Validation rules for each stage
export const STAGE_VALIDATION_RULES = {
  [FORM_STAGES.PERSONAL_INFO]: [
    FORM_FIELDS.NOMBRE,
    FORM_FIELDS.APELLIDO,
    FORM_FIELDS.EMAIL,
    FORM_FIELDS.TELEFONO,
    FORM_FIELDS.PROVINCIA,
    FORM_FIELDS.CIUDAD,
    FORM_FIELDS.CONTRASEÑA,
    FORM_FIELDS.CONFIRMAR_CONTRASEÑA
  ],
  [FORM_STAGES.PROFESSIONAL_INFO]: [
    FORM_FIELDS.RUBRO_INDUSTRIA,
    FORM_FIELDS.EMPRESA,
    FORM_FIELDS.SECTORES_INDUSTRIALES,
    FORM_FIELDS.ACEPTA_TERMINOS
  ]
}

// Initial form data structure
export const INITIAL_FORM_DATA = {
  accountType: "person",
  // Stage 1 - Personal Info
  [FORM_FIELDS.NOMBRE]: "",
  [FORM_FIELDS.APELLIDO]: "",
  [FORM_FIELDS.EMAIL]: "",
  [FORM_FIELDS.TELEFONO]: "",
  [FORM_FIELDS.PROVINCIA]: "",
  [FORM_FIELDS.CIUDAD]: "",
  [FORM_FIELDS.CONTRASEÑA]: "",
  [FORM_FIELDS.CONFIRMAR_CONTRASEÑA]: "",
  

  // Stage 2 - Professional Info
  [FORM_FIELDS.RUBRO_INDUSTRIA]: "",
  [FORM_FIELDS.EMPRESA]: "",
  [FORM_FIELDS.SECTORES_INDUSTRIALES]: [],
  [FORM_FIELDS.ACEPTA_TERMINOS]: false
}

// Form labels and placeholders
export const FORM_LABELS = {
  TITLE: "CREAR CUENTA",
  SUBTITLE: "Seleccioná el tipo de cuenta que querés crear y completá los datos requeridos",
  ACCOUNT_TYPE: "¿Qué tipo de cuenta querés crear?",
}

// Button texts
export const BUTTON_TEXTS = {
  BACK: "Volver",
  CONTINUE: "Siguiente",
  CREATE_ACCOUNT: "Crear Cuenta"
}

// Province options for Argentina
export const PROVINCE_OPTIONS = [
  { value: "buenos-aires", label: "Buenos Aires" },
  { value: "catamarca", label: "Catamarca" },
  { value: "chaco", label: "Chaco" },
  { value: "chubut", label: "Chubut" },
  { value: "ciudad-autonoma", label: "Ciudad Autónoma de Buenos Aires" },
  { value: "cordoba", label: "Córdoba" },
  { value: "corrientes", label: "Corrientes" },
  { value: "entre-rios", label: "Entre Ríos" },
  { value: "formosa", label: "Formosa" },
  { value: "jujuy", label: "Jujuy" },
  { value: "la-pampa", label: "La Pampa" },
  { value: "la-rioja", label: "La Rioja" },
  { value: "mendoza", label: "Mendoza" },
  { value: "misiones", label: "Misiones" },
  { value: "neuquen", label: "Neuquén" },
  { value: "rio-negro", label: "Río Negro" },
  { value: "salta", label: "Salta" },
  { value: "san-juan", label: "San Juan" },
  { value: "santa-cruz", label: "Santa Cruz" },
  { value: "santa-fe", label: "Santa Fe" },
  { value: "santiago-del-estero", label: "Santiago del Estero" },
  { value: "tierra-del-fuego", label: "Tierra del Fuego" },
  { value: "tucuman", label: "Tucumán" }
]

// Form field labels and placeholders
export const FIELD_LABELS = {
  NOMBRE: "Nombre*",
  APELLIDO: "Apellido*",
  EMAIL: "Correo electrónico*",
  TELEFONO: "Teléfono*",
  DNI: "DNI*",
  PROVINCIA: "Provincia*",
  CIUDAD: "Ciudad*",
  CONTRASEÑA: "Contraseña*",
  CONFIRMAR_CONTRASEÑA: "Repetir contraseña*",
  RUBRO_INDUSTRIA: "Rubro/Industria*",
  EMPRESA: "Empresa*",
  SECTORES_INTERES: "¿Cuáles son tus sectores industriales de interés?"
}

export const FIELD_PLACEHOLDERS = {
  NOMBRE: "Marta",
  APELLIDO: "Sanchez",
  EMAIL: "micorreo@persona.com.ar",
  TELEFONO: "2214567890",
  DNI: "33123456",
  PROVINCIA: "Seleccionar",
  CIUDAD: "Escribir",
  CONTRASEÑA: "•••••",
  RUBRO_INDUSTRIA: "Metalúrgica",
  EMPRESA: "Ingresá tu empresa"
} 