// Script para verificar que las variables de entorno estén configuradas correctamente
const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')

console.log('🔍 Verificando configuración de variables de entorno...\n')

if (!fs.existsSync(envPath)) {
  console.error('❌ No se encontró el archivo .env.local')
  console.log('💡 Crea el archivo .env.local con tus credenciales de Supabase')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const lines = envContent.split('\n')

const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': false,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': false,
  'SUPABASE_SERVICE_ROLE_KEY': false,
}

let hasPlaceholders = false

lines.forEach((line) => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key] = trimmed.split('=')
    if (requiredVars.hasOwnProperty(key)) {
      requiredVars[key] = true
      const value = trimmed.split('=')[1]?.trim() || ''
      if (value.includes('placeholder') || value.includes('tu-proyecto') || !value) {
        hasPlaceholders = true
      }
    }
  }
})

console.log('Variables de entorno encontradas:')
Object.entries(requiredVars).forEach(([key, found]) => {
  console.log(`  ${found ? '✅' : '❌'} ${key}`)
})

if (hasPlaceholders) {
  console.log('\n⚠️  Advertencia: Se detectaron valores placeholder')
  console.log('   Asegúrate de reemplazarlos con tus credenciales reales de Supabase\n')
} else {
  console.log('\n✅ Todas las variables están configuradas\n')
}

const allFound = Object.values(requiredVars).every((v) => v)

if (!allFound) {
  console.error('❌ Faltan algunas variables de entorno requeridas')
  process.exit(1)
}

console.log('✅ Configuración verificada correctamente')
console.log('\n💡 Próximos pasos:')
console.log('   1. Asegúrate de haber ejecutado el schema.sql en Supabase')
console.log('   2. Crea un usuario en Authentication > Users')
console.log('   3. Asigna el rol de admin con el SQL:')
console.log('      UPDATE public.users SET role = \'admin\' WHERE email = \'tu-email@ejemplo.com\';')
console.log('   4. Ejecuta: npm run dev\n')

