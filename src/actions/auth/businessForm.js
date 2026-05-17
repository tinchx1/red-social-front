"use server"

export async function submitBusinessForm(formData) {
  try {
    // Validate form data
    if (!validateFormData(formData)) {
      throw new Error("Por favor, completa todos los campos requeridos.")
    }
    const apiData = {
      roleKey: formData.accountType === "industrial" ? "parque_industrial" : "empresa",
      email: formData.emailEmpresarial,
      password: formData.contraseña,
      phone: formData.telefonoEmpresarial,
      businessName: formData.nombre,
      representative: formData.representante,
      province: formData.provincia,
      locality: formData.localidad,
      address: formData.direccion,
      industry: formData.rubroIndustria,
      industrialSectors: Array.isArray(formData.sectoresInteres)
        ? formData.sectoresInteres
        : [],
      linkedinUrl: formData.linkedinUrl || null,
      websiteUrl: formData.sitioWeb || null,
      ...(formData.accountType !== "industrial" && {
        employeesCount: parseInt(formData.cantidadEmpleados) || null,
      }),
      statuteFile: formData.estatuto || null,
      logoFile: formData.logotipo || null,
      bio: formData.descripcion || null,
    }
    // Make API call
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      const error = new Error('API Error')
      error.response = { status: response.status, data: errorData }
      throw error
    }
    
    const result = await response.json()
    
    return { success: true, message: "Te enviamos un correo para confirmar tu email", data: result }
  } catch (error) {
    console.error("Error submitting business form:", error.message)
    if (error.response?.status === 409) {
      return { success: false, message: "El email ya está en uso" }
    }
    const message = 'Error al crear la cuenta, por favor intentá nuevamente, revisar los campos requeridos'
    return { success: false, message }
  }
}

function validateFormData(formData) {
  // Stage 1 validation
  if (!formData.nombre || !formData.emailEmpresarial || !formData.telefonoEmpresarial || 
      !formData.representante || !formData.contraseña) {
    return false
  }
  
  // Stage 2 validation
  if (!formData.rubroIndustria || !formData.localidad || 
      !formData.provincia || !formData.direccion) {
    return false
  }
  
  // Stage 3 validation
  if (!formData.representanteAutorizado) {
    return false
  }
  
  return true
}
