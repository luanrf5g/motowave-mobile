const STATE_MAP: { [key: string]: string } = {
  'Acre': 'AC',
  'Alagoas': 'AL',
  'Amapá': 'AP',
  'Amazonas': 'AM',
  'Bahia': 'BA',
  'Ceará': 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  'Goiás': 'GO',
  'Maranhão': 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  'Pará': 'PA',
  'Paraíba': 'PB',
  'Paraná': 'PR',
  'Pernambuco': 'PE',
  'Piauí': 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  'Rondônia': 'RO',
  'Roraima': 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  'Sergipe': 'SE',
  'Tocantins': 'TO'
};

export const normalizeStateCode = (input: string | null | undefined): string => {
  if (!input) return 'BR' // Caso venha sem Estado

  const trimmed = input.trim()

  if (trimmed.length === 2) return trimmed.toUpperCase() // Caso já venha o estado correto

  // Caso venha no padrão android
  // Busca no mapa e retorna o estado referente ao texto
  return STATE_MAP[trimmed] || trimmed.substring(0, 2).toUpperCase()
}