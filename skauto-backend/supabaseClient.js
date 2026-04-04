// Importamos la función que crea la conexión a Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Leemos la URL de Supabase desde el archivo .env
// process.env es la forma en que Node.js accede a variables de entorno
const supabaseUrl = process.env.SUPABASE_URL

// Leemos la clave privada (service role) desde el archivo .env
// Esta clave tiene permisos de administrador completos
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Creamos la conexión a Supabase usando la URL y la clave privada
// La exportamos para que otros archivos del backend puedan usarla
export const supabase = createClient(supabaseUrl, supabaseServiceKey)