import type { NewTestTubeForm } from '../../../../types/testTubes'

export function buildSaveTestTubeFormData(form: NewTestTubeForm): FormData {
  const fd = new FormData()
  fd.append('tube_name', (form.tubeName || '').trim())
  if (form.specialInstructions) fd.append('special_instructions', form.specialInstructions)
  if (form.quantity) {
    const raw = String(form.quantity).trim()
    const numeric = Number(raw.replace(/,/g, ''))
    if (!isNaN(numeric) && numeric > 0) {
      fd.append('quantity', raw + ' mL')
    } else {
      fd.append('quantity', raw)
    }
  }
  if (form.storageTemperature) fd.append('Storage_Temperature', String(form.storageTemperature))
  if (form.imageFile) fd.append('image_url', form.imageFile)
  return fd
}

export function buildUpdateTestTubeFormData(current: NewTestTubeForm, original: NewTestTubeForm): FormData {
  const fd = new FormData()

  if (current.tubeName !== original.tubeName) {
    fd.append('tube_name', (current.tubeName || '').trim())
  }
  if ((current.specialInstructions || '') !== (original.specialInstructions || '')) {
    if (current.specialInstructions) fd.append('special_instructions', current.specialInstructions)
  }
  if ((current.quantity || '') !== (original.quantity || '')) {
    if (current.quantity) {
      const raw = String(current.quantity).trim()
      const numeric = Number(raw.replace(/,/g, ''))
      if (!isNaN(numeric) && numeric > 0) {
        fd.append('quantity', raw + ' mL')
      } else {
        fd.append('quantity', raw)
      }
    }
  }
  if ((current.storageTemperature || '') !== (original.storageTemperature || '')) {
    if (current.storageTemperature) fd.append('Storage_Temperature', String(current.storageTemperature))
  }
  if (current.imageFile && current.imageFile !== original.imageFile) {
    fd.append('image_url', current.imageFile)
  }

  return fd
}
