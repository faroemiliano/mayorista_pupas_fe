export const CONTACT_PHONE_DISPLAY = '+54 9 11 2401-5552'
export const CONTACT_PHONE_LINK = '+5491124015552'
export const WHATSAPP_PHONE = '5491124015552'

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}
