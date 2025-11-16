# 🚀 Subir Proyecto a GitHub

## Pasos para Subir a GitHub

### 1. Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Completa:
   - **Repository name**: `StockApp-Company` (o el nombre que prefieras)
   - **Description**: "Sistema de gestión de stock industrial con Next.js, TypeScript y Supabase"
   - **Visibility**: Elige **Private** (recomendado) o **Public**
   - **NO marques** "Initialize this repository with a README" (ya tenemos uno)
4. Haz clic en **"Create repository"**

### 2. Conectar el Repositorio Local con GitHub

Después de crear el repositorio, GitHub te mostrará comandos. Ejecuta estos en tu terminal:

```bash
# Asegúrate de estar en el directorio del proyecto
cd "C:\Users\Franco Luca Parera\StockApp-Company"

# Agrega el remote (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/StockApp-Company.git

# O si prefieres usar SSH:
# git remote add origin git@github.com:TU_USUARIO/StockApp-Company.git

# Verifica que se agregó correctamente
git remote -v
```

### 3. Subir el Código

```bash
# Sube el código a GitHub
git push -u origin main
```

Si te pide credenciales:
- **Usuario**: Tu usuario de GitHub
- **Contraseña**: Usa un **Personal Access Token** (no tu contraseña normal)
  - Cómo crear un token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

### 4. Verificar

Ve a tu repositorio en GitHub y verifica que todos los archivos estén ahí.

## ⚠️ Importante

**NO subas el archivo `.env.local`** - Ya está en `.gitignore`, pero verifica que no se haya subido por error.

Si por error se subió, elimínalo:
```bash
git rm --cached .env.local
git commit -m "Remove .env.local from repository"
git push
```

## 📝 Archivos que NO se subirán (gracias a .gitignore)

- ✅ `.env.local` - Variables de entorno (contiene credenciales)
- ✅ `node_modules/` - Dependencias
- ✅ `.next/` - Build de Next.js
- ✅ `.cursor/` - Archivos de Cursor
- ✅ `.history/` - Historial de ediciones

## 🔄 Comandos Útiles para el Futuro

```bash
# Ver estado de cambios
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir cambios
git push

# Ver historial
git log --oneline
```

## 📚 Recursos

- [Guía de GitHub](https://docs.github.com/es/get-started)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

