# 📤 Comandos para Subir a GitHub

## Paso 1: Configurar Git (Solo la primera vez)

Ejecuta estos comandos con tu información:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

O solo para este repositorio (sin --global):

```bash
git config user.name "Tu Nombre"
git config user.email "tu-email@ejemplo.com"
```

## Paso 2: Hacer el Commit Inicial

```bash
cd "C:\Users\Franco Luca Parera\StockApp-Company"
git commit -m "Initial commit: StockApp - Sistema de gestión de stock industrial"
```

## Paso 3: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `StockApp-Company`
3. Descripción: "Sistema de gestión de stock industrial con Next.js, TypeScript y Supabase"
4. Elige **Private** o **Public**
5. **NO marques** "Initialize with README"
6. Haz clic en **"Create repository"**

## Paso 4: Conectar y Subir

Después de crear el repo, GitHub te dará comandos. Ejecuta:

```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/StockApp-Company.git

# Sube el código
git push -u origin main
```

## ⚠️ Si te pide credenciales:

- **Usuario**: Tu usuario de GitHub
- **Contraseña**: Necesitas un **Personal Access Token**
  - Ve a: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token
  - Selecciona: `repo` (todos los permisos)
  - Copia el token y úsalo como contraseña

## ✅ Verificar

Ve a tu repositorio en GitHub y verifica que todos los archivos estén ahí.

