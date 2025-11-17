import api from '../utils/api'

const personaService = {
  async getPersonaByNif(nif) {
    if (!nif) {
      throw new Error('NIF requerido')
    }

    const normalizedNif = nif.toUpperCase().trim()

    return await api.get(`/api/personas/${encodeURIComponent(normalizedNif)}/`)
  },

  async createPersona(data) {
    if (!data?.nif) {
      throw new Error('El NIF es obligatorio para crear una persona')
    }

    const payload = {
      ...data,
      nif: data.nif.toUpperCase().trim(),
    }

    return await api.post('/api/personas/', payload)
  },
}

export default personaService

