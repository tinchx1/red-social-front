import FileUploadIcon from "@/assets/file-upload.svg"

// Account type options for the business form
export const ACCOUNT_TYPE_OPTIONS = [
  { value: "person", label: "Persona" },
  { value: "business", label: "Empresa" },
  { value: "industrial", label: "Parque Industrial" },
]

// Form field names for validation
export const FORM_FIELDS = {
  // Stage 1 - Basic Info
  NOMBRE: 'nombre',
  REPRESENTANTE: 'representante',
  ESTATUTO: 'estatuto',
  CONTRASEÑA: 'contraseña',
  CONFIRMAR_CONTRASEÑA: 'confirmarContraseña',
  
  // Stage 2 - Business Details
  EMAIL_EMPRESARIAL: 'emailEmpresarial',
  RUBRO_INDUSTRIA: 'rubroIndustria',
  LOCALIDAD: 'localidad',
  TELEFONO_EMPRESARIAL: 'telefonoEmpresarial',
  PROVINCIA: 'provincia',
  DIRECCION: 'direccion',
  SECTORES_INTERES: 'sectoresInteres',
  
  // Stage 3 - Company Profile
  LINKEDIN_URL: 'linkedinUrl',
  SITIO_WEB: 'sitioWeb',
  CANTIDAD_EMPLEADOS: 'cantidadEmpleados',
  LOGOTIPO: 'logotipo',
  DESCRIPCION: 'descripcion',
  REPRESENTANTE_AUTORIZADO: 'representanteAutorizado',
  ACEPTA_TERMINOS: 'aceptaTerminos',
}

// Form stages configuration
export const FORM_STAGES = {
  BASIC_INFO: 1,
  BUSINESS_DETAILS: 2,
  COMPANY_PROFILE: 3,
}

// Validation rules for each stage
export const STAGE_VALIDATION_RULES = {
  [FORM_STAGES.BASIC_INFO]: [
    FORM_FIELDS.NOMBRE,
      FORM_FIELDS.EMAIL_EMPRESARIAL,
      FORM_FIELDS.TELEFONO_EMPRESARIAL,
    FORM_FIELDS.PROVINCIA,
    FORM_FIELDS.REPRESENTANTE,
    FORM_FIELDS.CONTRASEÑA,
    FORM_FIELDS.CONFIRMAR_CONTRASEÑA
  ],
  [FORM_STAGES.BUSINESS_DETAILS]: [
    FORM_FIELDS.RUBRO_INDUSTRIA,
    FORM_FIELDS.LOCALIDAD,
    FORM_FIELDS.DIRECCION,
    FORM_FIELDS.SECTORES_INTERES
  ],
  [FORM_STAGES.COMPANY_PROFILE]: [
    FORM_FIELDS.REPRESENTANTE_AUTORIZADO,
    FORM_FIELDS.ACEPTA_TERMINOS
  ]
}

// Initial form data structure
export const INITIAL_FORM_DATA = {
  accountType: "",
  // Stage 1 - Basic Info
  [FORM_FIELDS.NOMBRE]: "",
  [FORM_FIELDS.REPRESENTANTE]: "",
  [FORM_FIELDS.ESTATUTO]: "",
  [FORM_FIELDS.CONTRASEÑA]: "",
  [FORM_FIELDS.CONFIRMAR_CONTRASEÑA]: "",
  // Stage 2 - Business Details
  [FORM_FIELDS.EMAIL_EMPRESARIAL]: "",
  [FORM_FIELDS.RUBRO_INDUSTRIA]: "",
  [FORM_FIELDS.LOCALIDAD]: "",
  [FORM_FIELDS.TELEFONO_EMPRESARIAL]: "",
  [FORM_FIELDS.PROVINCIA]: "",
  [FORM_FIELDS.DIRECCION]: "",
  [FORM_FIELDS.SECTORES_INTERES]: [],
  // Stage 3 - Company Profile
  [FORM_FIELDS.LINKEDIN_URL]: "",
  [FORM_FIELDS.SITIO_WEB]: "",
  [FORM_FIELDS.CANTIDAD_EMPLEADOS]: "",
  [FORM_FIELDS.LOGOTIPO]: null,
  [FORM_FIELDS.DESCRIPCION]: "",
  [FORM_FIELDS.REPRESENTANTE_AUTORIZADO]: false,
  [FORM_FIELDS.ACEPTA_TERMINOS]: false,
}

// File upload configurations
export const FILE_CONFIG = {
  ESTATUTO: {
    accept: ".pdf,.doc,.docx",
    icon: <FileUploadIcon width="24" height="24" />,
    placeholder: "Subir Estatuto"
  },
  LOGOTIPO: {
    accept: ".jpg,.jpeg,.png",
    recommendedSize: "300x300 px",
    description: "Se recomienda 300x300 px. Formatos compatibles: JPG, JPEG y PNG."
  }
}

// Form labels and placeholders
export const FORM_LABELS = {
  TITLE: "CREAR CUENTA",
  SUBTITLE_STAGE_1_2: "Seleccioná el tipo de cuenta que querés crear y completá los datos requeridos",
  SUBTITLE_STAGE_3_BUSINESS: "Detallá los datos para mostrar en el perfil de tu empresa",
  SUBTITLE_STAGE_3_INDUSTRIAL: "Detallá los datos para mostrar en el perfil de tu parque industrial",
  ACCOUNT_TYPE: "¿Qué tipo de cuenta querés crear?",
  SECTORS_LABEL: "¿Cuáles son tus sectores industriales de interés?",
  REPRESENTANTE_AUTORIZADO_TEXT: "Confirmo que soy un representante autorizado de esta empresa y que tengo el derecho a actuar en su nombre para gestionar esta página. La empresa y yo aceptamos las condiciones adicionales de las páginas.",
  DESCRIPCION_INFO: "Utiliza el lema para describir brevemente a qué se dedica tu empresa. Esto se puede cambia más adelante."
}

// Button texts
export const BUTTON_TEXTS = {
  BACK: "Volver",
  CONTINUE: "Siguiente",
  CREATE_ACCOUNT: "Crear Cuenta"
} 