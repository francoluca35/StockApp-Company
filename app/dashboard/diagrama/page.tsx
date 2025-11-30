'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Database, Server, Monitor, Layers, ArrowRight, Users, Package, ArrowUpDown, Key, Shield, Zap, ShoppingCart, Plus, Edit, Maximize2, X } from 'lucide-react'
import { useThemeStore } from '@/lib/store/themeStore'

// Componente de Diagrama de Flujo General
function GeneralFlowchart() {
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'
  const textColor = isDark ? '#f3f4f6' : '#111827'
  const textColorLight = isDark ? '#d1d5db' : '#4b5563'
  const bgStart = isDark ? '#1f2937' : '#fce7f3'
  const bgEnd = isDark ? '#064e3b' : '#d1fae5'
  const bgProcess = isDark ? '#1e3a8a' : '#dbeafe'
  const bgDecision = isDark ? '#78350f' : '#fef3c7'
  const bgError = isDark ? '#7f1d1d' : '#fee2e2'
  const bgOptions = isDark ? '#312e81' : '#e0e7ff'
  const bgSuccess = isDark ? '#064e3b' : '#d1fae5'
  const bgEdit = isDark ? '#7c2d12' : '#fed7aa'

  return (
    <svg className="w-full h-full" viewBox="0 0 1400 2000" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker
          id="arrowhead-general"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill={isDark ? '#10b981' : '#10b981'} />
        </marker>
      </defs>

      {/* Inicio */}
      <ellipse cx="700" cy="30" rx="100" ry="35" fill={bgStart} stroke="#ec4899" strokeWidth="2" />
      <text x="700" y="35" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="600">
        Inicio - Usuario accede
      </text>

      {/* Login */}
      <rect x="600" y="100" width="200" height="50" rx="5" fill={bgProcess} stroke="#3b82f6" strokeWidth="2" />
      <text x="700" y="125" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="500">
        Página de Login
      </text>
      <path d="M 700 65 L 700 100" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* ¿Autenticado? */}
      <polygon points="700,180 780,220 700,260 620,220" fill={bgDecision} stroke="#f59e0b" strokeWidth="2" />
      <text x="700" y="220" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="600">
        ¿Autenticado?
      </text>
      <path d="M 700 150 L 700 180" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* No - Error */}
      <rect x="450" y="300" width="150" height="50" rx="5" fill={bgError} stroke="#ef4444" strokeWidth="2" />
      <text x="525" y="325" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="12" fontWeight="500">
        Mostrar Error
      </text>
      <path d="M 620 220 L 525 300" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />
      <text x="570" y="255" textAnchor="middle" fill={textColorLight} fontSize="11">No</text>

      {/* Sí - Dashboard */}
      <rect x="600" y="300" width="200" height="50" rx="5" fill={bgProcess} stroke="#3b82f6" strokeWidth="2" />
      <text x="700" y="325" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="500">
        Dashboard Principal
      </text>
      <path d="M 700 260 L 700 300" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />
      <text x="720" y="280" textAnchor="middle" fill={textColorLight} fontSize="11">Sí</text>

      {/* Opciones del Dashboard */}
      <rect x="500" y="400" width="400" height="60" rx="5" fill={bgOptions} stroke="#6366f1" strokeWidth="2" />
      <text x="700" y="420" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="600">
        Opciones Disponibles:
      </text>
      <text x="700" y="445" textAnchor="middle" dominantBaseline="middle" fill={textColorLight} fontSize="11">
        Venta Producto | Agregar Producto | Stocks | Stock Salidas | Configuración | Admin
      </text>
      <path d="M 700 350 L 700 400" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Venta Producto */}
      <rect x="200" y="520" width="180" height="80" rx="5" fill={bgProcess} stroke="#3b82f6" strokeWidth="2" />
      <text x="290" y="545" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="600">
        Venta Producto
      </text>
      <text x="290" y="565" textAnchor="middle" dominantBaseline="middle" fill={textColorLight} fontSize="11">
        Escanear/Buscar
      </text>
      <text x="290" y="580" textAnchor="middle" dominantBaseline="middle" fill={textColorLight} fontSize="11">
        Agregar al carrito
      </text>
      <path d="M 600 430 L 290 520" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Validar Stock */}
      <polygon points="290,640 370,680 290,720 210,680" fill={bgDecision} stroke="#f59e0b" strokeWidth="2" />
      <text x="290" y="680" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="12" fontWeight="600">
        ¿Stock suficiente?
      </text>
      <path d="M 290 600 L 290 640" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Crear Movimiento Salida */}
      <rect x="200" y="760" width="180" height="50" rx="5" fill={bgSuccess} stroke="#10b981" strokeWidth="2" />
      <text x="290" y="785" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="12" fontWeight="500">
        Crear movimiento "salida"
      </text>
      <path d="M 290 720 L 290 760" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />
      <text x="310" y="740" textAnchor="middle" fill={textColorLight} fontSize="11">Sí</text>

      {/* Agregar Producto */}
      <rect x="500" y="520" width="180" height="80" rx="5" fill={bgProcess} stroke="#3b82f6" strokeWidth="2" />
      <text x="590" y="545" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="600">
        Agregar Producto
      </text>
      <text x="590" y="565" textAnchor="middle" dominantBaseline="middle" fill={textColorLight} fontSize="11">
        Crear nuevo o
      </text>
      <text x="590" y="580" textAnchor="middle" dominantBaseline="middle" fill={textColorLight} fontSize="11">
        Actualizar stock
      </text>
      <path d="M 700 430 L 590 520" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Crear Movimiento Entrada */}
      <rect x="500" y="640" width="180" height="50" rx="5" fill={bgSuccess} stroke="#10b981" strokeWidth="2" />
      <text x="590" y="665" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="12" fontWeight="500">
        Crear movimiento "entrada"
      </text>
      <path d="M 590 600 L 590 640" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Stocks */}
      <rect x="800" y="520" width="180" height="80" rx="5" fill={bgProcess} stroke="#3b82f6" strokeWidth="2" />
      <text x="890" y="545" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="600">
        Gestión Stocks
      </text>
      <text x="890" y="565" textAnchor="middle" dominantBaseline="middle" fill={textColorLight} fontSize="11">
        Ver lista productos
      </text>
      <text x="890" y="580" textAnchor="middle" dominantBaseline="middle" fill={textColorLight} fontSize="11">
        Editar/Eliminar
      </text>
      <path d="M 800 430 L 890 520" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Editar Producto */}
      <rect x="800" y="640" width="180" height="50" rx="5" fill={bgEdit} stroke="#f97316" strokeWidth="2" />
      <text x="890" y="665" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="12" fontWeight="500">
        Editar producto
      </text>
      <path d="M 890 600 L 890 640" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Base de Datos */}
      <rect x="500" y="850" width="400" height="80" rx="5" fill={bgStart} stroke="#ec4899" strokeWidth="2" />
      <text x="700" y="875" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="600">
        Base de Datos (Supabase)
      </text>
      <text x="700" y="895" textAnchor="middle" dominantBaseline="middle" fill={textColorLight} fontSize="11">
        Tablas: users, products, movements
      </text>
      <text x="700" y="910" textAnchor="middle" dominantBaseline="middle" fill={textColorLight} fontSize="11">
        Triggers: update_product_stock()
      </text>
      <path d="M 290 810 L 500 890" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />
      <path d="M 590 690 L 600 850" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />
      <path d="M 890 690 L 800 850" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Actualizar Stock */}
      <rect x="500" y="980" width="400" height="50" rx="5" fill={bgSuccess} stroke="#10b981" strokeWidth="2" />
      <text x="700" y="1005" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="500">
        Trigger actualiza current_stock automáticamente
      </text>
      <path d="M 700 930 L 700 980" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Stock Salidas */}
      <rect x="200" y="1080" width="180" height="50" rx="5" fill={bgProcess} stroke="#3b82f6" strokeWidth="2" />
      <text x="290" y="1105" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="12" fontWeight="500">
        Ver Historial Salidas
      </text>
      <path d="M 500 1005 L 290 1080" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Configuración */}
      <rect x="500" y="1080" width="180" height="50" rx="5" fill={bgProcess} stroke="#3b82f6" strokeWidth="2" />
      <text x="590" y="1105" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="12" fontWeight="500">
        Configuración Usuario
      </text>
      <path d="M 700 1030 L 590 1080" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Admin */}
      <rect x="800" y="1080" width="180" height="50" rx="5" fill={bgProcess} stroke="#3b82f6" strokeWidth="2" />
      <text x="890" y="1105" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="12" fontWeight="500">
        Administración (Admin)
      </text>
      <path d="M 800 1030 L 890 1080" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Dashboard Actualizado */}
      <rect x="500" y="1180" width="400" height="50" rx="5" fill={bgProcess} stroke="#3b82f6" strokeWidth="2" />
      <text x="700" y="1205" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="500">
        Dashboard se actualiza con nuevos datos
      </text>
      <path d="M 290 1130 L 500 1205" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />
      <path d="M 590 1130 L 600 1205" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />
      <path d="M 890 1130 L 800 1205" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />

      {/* Fin */}
      <ellipse cx="700" cy="1300" rx="100" ry="35" fill={bgEnd} stroke="#10b981" strokeWidth="2" />
      <text x="700" y="1305" textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="14" fontWeight="600">
        Proceso Completado
      </text>
      <path d="M 700 1230 L 700 1300" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead-general)" />
    </svg>
  )
}

// Componente de Diagrama de Flujo
interface FlowchartProps {
  nodes: Array<{ id: string; type: string; label: string; x: number; y: number }>
  connections: Array<{ from: string; to: string; label?: string; position?: string }>
}

function Flowchart({ nodes, connections }: FlowchartProps) {
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'
  const textColor = isDark ? '#f3f4f6' : '#111827'
  const textColorLight = isDark ? '#d1d5db' : '#4b5563'

  // Calcular viewBox dinámico basado en los nodos
  const maxX = Math.max(...nodes.map(n => n.x)) + 150
  const maxY = Math.max(...nodes.map(n => n.y)) + 100
  const minX = Math.min(...nodes.map(n => n.x)) - 150
  const minY = Math.min(...nodes.map(n => n.y)) - 50
  const viewBoxWidth = maxX - minX
  const viewBoxHeight = maxY - minY

  return (
    <svg className="w-full h-full" viewBox={`${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet">
      {/* Conexiones */}
      {connections.map((conn, idx) => {
        const fromNode = nodes.find(n => n.id === conn.from)
        const toNode = nodes.find(n => n.id === conn.to)
        if (!fromNode || !toNode) return null

        const fromX = fromNode.x
        const fromY = fromNode.y + (fromNode.type === 'start' ? 30 : fromNode.type === 'decision' ? 40 : 30)
        const toX = toNode.x
        const toY = toNode.y - (toNode.type === 'end' ? 30 : toNode.type === 'decision' ? 40 : 30)

        // Calcular puntos de control para curvas
        const midY = (fromY + toY) / 2
        const path = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`
        
        return (
          <g key={idx}>
            <path
              d={path}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            {conn.label && (
              <text
                x={(fromX + toX) / 2}
                y={midY - 5}
                textAnchor="middle"
                fill={textColorLight}
                fontSize="11"
                fontWeight="500"
              >
                {conn.label}
              </text>
            )}
          </g>
        )
      })}

      {/* Definición de flecha */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
        </marker>
      </defs>

      {/* Nodos */}
      {nodes.map((node) => {
        if (node.type === 'start' || node.type === 'end') {
          return (
            <g key={node.id}>
              <ellipse
                cx={node.x}
                cy={node.y}
                rx="80"
                ry="30"
                fill={node.type === 'start' ? '#fce7f3' : '#d1fae5'}
                stroke={node.type === 'start' ? '#ec4899' : '#10b981'}
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textColor}
                fontSize="14"
                fontWeight="600"
              >
                {node.label.split('\n').map((line: string, i: number) => (
                  <tspan key={i} x={node.x} dy={i === 0 ? 0 : 16}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          )
        } else if (node.type === 'decision') {
          const points = [
            `${node.x},${node.y - 40}`,
            `${node.x + 80},${node.y}`,
            `${node.x},${node.y + 40}`,
            `${node.x - 80},${node.y}`
          ].join(' ')
          return (
            <g key={node.id}>
              <polygon
                points={points}
                fill="#fef3c7"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textColor}
                fontSize="14"
                fontWeight="600"
              >
                {node.label.split('\n').map((line: string, i: number) => (
                  <tspan key={i} x={node.x} dy={i === 0 ? -8 : 16}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          )
        } else {
          return (
            <g key={node.id}>
              <rect
                x={node.x - 100}
                y={node.y - 30}
                width="200"
                height="60"
                rx="5"
                fill="#dbeafe"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textColor}
                fontSize="14"
                fontWeight="500"
              >
                {node.label.split('\n').map((line: string, i: number) => (
                  <tspan key={i} x={node.x} dy={i === 0 ? -8 : 16}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          )
        }
      })}
    </svg>
  )
}

export default function DiagramaPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['frontend', 'backend', 'database']))
  const [expandedDiagram, setExpandedDiagram] = useState<string | null>(null)
  const theme = useThemeStore((state) => state.theme)

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const openDiagram = (diagramId: string) => {
    setExpandedDiagram(diagramId)
  }

  const closeDiagram = () => {
    setExpandedDiagram(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">Diagrama de Arquitectura</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Estructura completa de la aplicación: Frontend, Backend y Base de Datos
        </p>
      </div>

      {/* Diagrama Principal */}
      <div className="card mb-6 overflow-x-auto">
        <div className="min-w-[1200px] p-8">
          {/* Frontend Layer */}
          <div className="mb-8">
            <div 
              className="flex items-center gap-2 cursor-pointer mb-4"
              onClick={() => toggleSection('frontend')}
            >
              {expandedSections.has('frontend') ? (
                <ChevronDown className="w-5 h-5 text-neon-green" />
              ) : (
                <ChevronRight className="w-5 h-5 text-neon-green" />
              )}
              <Monitor className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold dark:text-white text-gray-900">Frontend</h2>
            </div>
            
            {expandedSections.has('frontend') && (
              <div className="ml-8 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Next.js 14 (App Router)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <div className="font-medium mb-2">Páginas</div>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• /login</li>
                        <li>• /dashboard</li>
                        <li>• /dashboard/ventas</li>
                        <li>• /dashboard/entradas</li>
                        <li>• /dashboard/stock</li>
                        <li>• /dashboard/stock-salidas</li>
                        <li>• /dashboard/configuracion</li>
                        <li>• /dashboard/admin</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <div className="font-medium mb-2">Componentes</div>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• DashboardLayout</li>
                        <li>• BarcodeScanner</li>
                        <li>• ThemeProvider</li>
                        <li>• Sidebar Navigation</li>
                        <li>• Header con Toggle</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">Estado y Librerías</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border text-center">
                      <div className="font-medium">Zustand</div>
                      <div className="text-xs text-gray-500">Tema (light/dark)</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border text-center">
                      <div className="font-medium">React Hook Form</div>
                      <div className="text-xs text-gray-500">Formularios</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border text-center">
                      <div className="font-medium">SweetAlert2</div>
                      <div className="text-xs text-gray-500">Alertas</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border text-center">
                      <div className="font-medium">Tailwind CSS</div>
                      <div className="text-xs text-gray-500">Estilos</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border text-center">
                      <div className="font-medium">TypeScript</div>
                      <div className="text-xs text-gray-500">Tipado</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border text-center">
                      <div className="font-medium">Lucide Icons</div>
                      <div className="text-xs text-gray-500">Iconos</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-4">
            <ArrowRight className="w-8 h-8 text-neon-green rotate-90" />
          </div>

          {/* Backend Layer */}
          <div className="mb-8">
            <div 
              className="flex items-center gap-2 cursor-pointer mb-4"
              onClick={() => toggleSection('backend')}
            >
              {expandedSections.has('backend') ? (
                <ChevronDown className="w-5 h-5 text-neon-green" />
              ) : (
                <ChevronRight className="w-5 h-5 text-neon-green" />
              )}
              <Server className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold dark:text-white text-gray-900">Backend (Supabase)</h2>
            </div>
            
            {expandedSections.has('backend') && (
              <div className="ml-8 space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Autenticación</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <div className="font-medium mb-2">Supabase Auth</div>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• signInWithPassword()</li>
                        <li>• getSession()</li>
                        <li>• getUser()</li>
                        <li>• signOut()</li>
                        <li>• updateUser()</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <div className="font-medium mb-2">Middleware</div>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• Protección de rutas</li>
                        <li>• Verificación de sesión</li>
                        <li>• Redirección automática</li>
                        <li>• Matcher: /dashboard/*</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">API Client</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                    <div className="font-medium mb-2">Supabase Client (@supabase/supabase-js)</div>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• createSupabaseClient() - Cliente singleton</li>
                      <li>• .from('table').select() - Consultas</li>
                      <li>• .from('table').insert() - Inserciones</li>
                      <li>• .from('table').update() - Actualizaciones</li>
                      <li>• .from('table').delete() - Eliminaciones</li>
                      <li>• Row Level Security (RLS) habilitado</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-4">
            <ArrowRight className="w-8 h-8 text-neon-green rotate-90" />
          </div>

          {/* Database Layer */}
          <div>
            <div 
              className="flex items-center gap-2 cursor-pointer mb-4"
              onClick={() => toggleSection('database')}
            >
              {expandedSections.has('database') ? (
                <ChevronDown className="w-5 h-5 text-neon-green" />
              ) : (
                <ChevronRight className="w-5 h-5 text-neon-green" />
              )}
              <Database className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold dark:text-white text-gray-900">Base de Datos (PostgreSQL)</h2>
            </div>
            
            {expandedSections.has('database') && (
              <div className="ml-8 space-y-4">
                {/* Tabla Users */}
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <h3 className="font-semibold text-red-900 dark:text-red-100">Tabla: users</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium mb-2">Columnas</div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 font-mono text-xs">
                          <li>• id (UUID, PK, FK → auth.users)</li>
                          <li>• email (TEXT, UNIQUE)</li>
                          <li>• role (ENUM: admin|empleado)</li>
                          <li>• name (TEXT)</li>
                          <li>• created_at (TIMESTAMP)</li>
                          <li>• updated_at (TIMESTAMP)</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium mb-2">Políticas RLS</div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-xs">
                          <li>• Usuarios ven su perfil</li>
                          <li>• Admins ven todos</li>
                          <li>• Admins pueden actualizar roles</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla Products */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Tabla: products</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium mb-2">Columnas</div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 font-mono text-xs">
                          <li>• id (UUID, PK)</li>
                          <li>• name (TEXT, NOT NULL)</li>
                          <li>• sku (TEXT, UNIQUE)</li>
                          <li>• barcode (TEXT, UNIQUE)</li>
                          <li>• category (TEXT)</li>
                          <li>• unit (TEXT, default: 'unidad')</li>
                          <li>• current_stock (INTEGER)</li>
                          <li>• min_stock (INTEGER)</li>
                          <li>• max_stock (INTEGER)</li>
                          <li>• price (DECIMAL 10,2)</li>
                          <li>• created_at (TIMESTAMP)</li>
                          <li>• updated_at (TIMESTAMP)</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium mb-2">Índices</div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-xs">
                          <li>• idx_products_sku</li>
                          <li>• idx_products_barcode</li>
                        </ul>
                        <div className="font-medium mb-2 mt-3">Políticas RLS</div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-xs">
                          <li>• Todos pueden ver productos</li>
                          <li>• Autenticados pueden insertar</li>
                          <li>• Autenticados pueden actualizar</li>
                          <li>• Autenticados pueden eliminar</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla Movements */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Tabla: movements</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium mb-2">Columnas</div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 font-mono text-xs">
                          <li>• id (UUID, PK)</li>
                          <li>• product_id (UUID, FK → products)</li>
                          <li>• user_id (UUID, FK → users)</li>
                          <li>• type (TEXT: entrada|salida)</li>
                          <li>• quantity (INTEGER, &gt; 0)</li>
                          <li>• reason (TEXT)</li>
                          <li>• fecha (DATE)</li>
                          <li>• hora (TIME)</li>
                          <li>• tiempo_produccion (INTEGER)</li>
                          <li>• despachado_por (TEXT)</li>
                          <li>• created_at (TIMESTAMP)</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium mb-2">Índices</div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-xs">
                          <li>• idx_movements_product_id</li>
                          <li>• idx_movements_user_id</li>
                          <li>• idx_movements_created_at</li>
                          <li>• idx_movements_fecha</li>
                          <li>• idx_movements_tipo_fecha</li>
                        </ul>
                        <div className="font-medium mb-2 mt-3">Trigger</div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-xs">
                          <li>• trigger_update_stock</li>
                          <li>• Función: update_product_stock()</li>
                          <li>• Actualiza current_stock automáticamente</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relaciones */}
                <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <h3 className="font-semibold text-teal-900 dark:text-teal-100">Relaciones</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-teal-600" />
                        <span className="font-mono">users.id</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-mono">movements.user_id</span>
                        <span className="text-xs text-gray-500">(1:N)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-teal-600" />
                        <span className="font-mono">products.id</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-mono">movements.product_id</span>
                        <span className="text-xs text-gray-500">(1:N)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-teal-600" />
                        <span className="font-mono">auth.users.id</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-mono">users.id</span>
                        <span className="text-xs text-gray-500">(1:1, CASCADE)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Funciones y Triggers */}
                <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    <h3 className="font-semibold text-pink-900 dark:text-pink-100">Funciones y Triggers</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium mb-1">update_product_stock()</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Función que actualiza automáticamente el stock cuando se inserta un movimiento.
                          Si type = 'entrada' → suma, si type = 'salida' → resta.
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">handle_new_user()</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Trigger que crea automáticamente un registro en public.users cuando se crea un usuario en auth.users.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flujo de Datos */}
      <div className="card">
        <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-4">Flujo de Datos</h2>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 rounded-lg text-white">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">1</div>
                <div className="text-sm mt-2">Usuario interactúa con Frontend</div>
              </div>
              <div>
                <div className="text-2xl font-bold">2</div>
                <div className="text-sm mt-2">Supabase Client envía petición</div>
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm mt-2">PostgreSQL procesa y responde</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Ejemplo: Venta de Producto</h3>
              <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-400 list-decimal list-inside">
                <li>Usuario escanea código de barras</li>
                <li>Frontend busca producto en products</li>
                <li>Usuario confirma venta</li>
                <li>Se inserta movimiento tipo 'salida'</li>
                <li>Trigger actualiza current_stock</li>
                <li>Se retorna confirmación al usuario</li>
              </ol>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">Ejemplo: Agregar Stock</h3>
              <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-400 list-decimal list-inside">
                <li>Usuario selecciona producto</li>
                <li>Ingresa cantidad a agregar</li>
                <li>Se inserta movimiento tipo 'entrada'</li>
                <li>Trigger suma cantidad a current_stock</li>
                <li>Se actualiza updated_at del producto</li>
                <li>Frontend muestra confirmación</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Diagrama de Flujo General */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold dark:text-white text-gray-900">Diagrama de Flujo General de la Aplicación</h2>
          <button
            onClick={() => openDiagram('general')}
            className="flex items-center gap-2 px-4 py-2 bg-neon-green hover:bg-neon-green/80 text-white rounded-lg transition-colors"
            title="Expandir diagrama"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-sm">Expandir</span>
          </button>
        </div>
        <div className="overflow-x-auto overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
          <div className="w-full min-w-[800px] p-4 md:p-6">
            <div className="w-full" style={{ aspectRatio: '1.4 / 1', minHeight: '600px' }}>
              <GeneralFlowchart />
            </div>
          </div>
        </div>
      </div>

      {/* Diagramas de Flujo Detallados */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-4">Diagramas de Flujo de Procesos Específicos</h2>

        {/* Flujo de Autenticación */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-bold dark:text-white text-gray-900">Flujo de Autenticación</h3>
            </div>
            <button
              onClick={() => openDiagram('auth')}
              className="flex items-center gap-2 px-4 py-2 bg-neon-green hover:bg-neon-green/80 text-white rounded-lg transition-colors"
              title="Expandir diagrama"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm">Expandir</span>
            </button>
          </div>
          <div className="overflow-x-auto overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="w-full min-w-[600px] p-4 md:p-6">
              <div className="w-full" style={{ aspectRatio: '1 / 1.2', minHeight: '500px' }}>
                <Flowchart
                  nodes={[
                    { id: 'start', type: 'start', label: 'Inicio', x: 400, y: 20 },
                    { id: 'check', type: 'decision', label: '¿Usuario autenticado?', x: 400, y: 100 },
                    { id: 'login', type: 'process', label: 'Página de Login\nIngresar email y contraseña', x: 200, y: 200 },
                    { id: 'validate', type: 'decision', label: '¿Credenciales válidas?', x: 200, y: 320 },
                    { id: 'error', type: 'process', label: 'Mostrar error', x: 50, y: 440 },
                    { id: 'dashboard', type: 'process', label: 'Acceso al Dashboard', x: 400, y: 200 },
                    { id: 'session', type: 'process', label: 'Verificar sesión\ncon Supabase Auth', x: 200, y: 500 },
                    { id: 'end', type: 'end', label: 'Usuario autenticado', x: 400, y: 600 },
                  ]}
                  connections={[
                    { from: 'start', to: 'check', label: '' },
                    { from: 'check', to: 'login', label: 'No', position: 'left' },
                    { from: 'check', to: 'dashboard', label: 'Sí', position: 'right' },
                    { from: 'login', to: 'validate', label: '' },
                    { from: 'validate', to: 'error', label: 'No', position: 'left' },
                    { from: 'validate', to: 'end', label: 'Sí', position: 'right' },
                    { from: 'error', to: 'session', label: '' },
                    { from: 'session', to: 'end', label: '' },
                    { from: 'dashboard', to: 'end', label: '' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Flujo de Venta de Productos */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-bold dark:text-white text-gray-900">Flujo de Venta de Productos</h3>
            </div>
            <button
              onClick={() => openDiagram('venta')}
              className="flex items-center gap-2 px-4 py-2 bg-neon-green hover:bg-neon-green/80 text-white rounded-lg transition-colors"
              title="Expandir diagrama"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm">Expandir</span>
            </button>
          </div>
          <div className="overflow-x-auto overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="w-full min-w-[600px] p-4 md:p-6">
              <div className="w-full" style={{ aspectRatio: '1 / 1.2', minHeight: '500px' }}>
                <Flowchart
                  nodes={[
                    { id: 'start', type: 'start', label: 'Inicio Venta', x: 450, y: 20 },
                    { id: 'method', type: 'decision', label: '¿Cómo agregar producto?', x: 450, y: 100 },
                    { id: 'scan', type: 'process', label: 'Escanear código\nde barras', x: 200, y: 200 },
                    { id: 'search', type: 'process', label: 'Buscar manualmente\npor nombre/SKU', x: 700, y: 200 },
                    { id: 'find', type: 'process', label: 'Buscar producto\nen base de datos', x: 450, y: 300 },
                    { id: 'exists', type: 'decision', label: '¿Producto encontrado?', x: 450, y: 400 },
                    { id: 'add', type: 'process', label: 'Agregar al carrito\n(Sumar si existe)', x: 450, y: 500 },
                    { id: 'confirm', type: 'decision', label: '¿Confirmar venta?', x: 450, y: 600 },
                    { id: 'validate', type: 'decision', label: '¿Stock suficiente?', x: 450, y: 700 },
                    { id: 'create', type: 'process', label: 'Crear movimiento\ntipo "salida"', x: 450, y: 800 },
                    { id: 'update', type: 'process', label: 'Trigger actualiza\ncurrent_stock', x: 450, y: 900 },
                    { id: 'success', type: 'end', label: 'Venta exitosa', x: 450, y: 1000 },
                    { id: 'error', type: 'process', label: 'Mostrar error\nStock insuficiente', x: 200, y: 700 },
                  ]}
                  connections={[
                    { from: 'start', to: 'method', label: '' },
                    { from: 'method', to: 'scan', label: 'Escáner', position: 'left' },
                    { from: 'method', to: 'search', label: 'Manual', position: 'right' },
                    { from: 'scan', to: 'find', label: '' },
                    { from: 'search', to: 'find', label: '' },
                    { from: 'find', to: 'exists', label: '' },
                    { from: 'exists', to: 'add', label: 'Sí', position: 'right' },
                    { from: 'add', to: 'confirm', label: '' },
                    { from: 'confirm', to: 'validate', label: 'Sí', position: 'right' },
                    { from: 'validate', to: 'create', label: 'Sí', position: 'right' },
                    { from: 'validate', to: 'error', label: 'No', position: 'left' },
                    { from: 'create', to: 'update', label: '' },
                    { from: 'update', to: 'success', label: '' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Flujo de Agregar Producto/Stock */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Plus className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-bold dark:text-white text-gray-900">Flujo de Agregar Producto/Stock</h3>
            </div>
            <button
              onClick={() => openDiagram('agregar')}
              className="flex items-center gap-2 px-4 py-2 bg-neon-green hover:bg-neon-green/80 text-white rounded-lg transition-colors"
              title="Expandir diagrama"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm">Expandir</span>
            </button>
          </div>
          <div className="overflow-x-auto overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="w-full min-w-[600px] p-4 md:p-6">
              <div className="w-full" style={{ aspectRatio: '1 / 1.2', minHeight: '500px' }}>
                <Flowchart
                  nodes={[
                    { id: 'start', type: 'start', label: 'Inicio', x: 400, y: 20 },
                    { id: 'type', type: 'decision', label: '¿Producto existe?', x: 400, y: 100 },
                    { id: 'new', type: 'process', label: 'Crear nuevo producto\n(Formulario completo)', x: 150, y: 200 },
                    { id: 'stock', type: 'decision', label: '¿Stock inicial &gt; 0?', x: 150, y: 320 },
                    { id: 'insert', type: 'process', label: 'Insertar en products', x: 150, y: 440 },
                    { id: 'movement', type: 'process', label: 'Crear movimiento\ntipo "entrada"', x: 150, y: 560 },
                    { id: 'select', type: 'process', label: 'Seleccionar producto\nexistente', x: 650, y: 200 },
                    { id: 'quantity', type: 'process', label: 'Ingresar cantidad\na agregar', x: 650, y: 320 },
                    { id: 'update', type: 'process', label: 'Actualizar current_stock', x: 650, y: 440 },
                    { id: 'create2', type: 'process', label: 'Crear movimiento\ntipo "entrada"', x: 650, y: 560 },
                    { id: 'trigger', type: 'process', label: 'Trigger actualiza\nstock automáticamente', x: 400, y: 680 },
                    { id: 'end', type: 'end', label: 'Producto/Stock agregado', x: 400, y: 800 },
                  ]}
                  connections={[
                    { from: 'start', to: 'type', label: '' },
                    { from: 'type', to: 'new', label: 'No', position: 'left' },
                    { from: 'type', to: 'select', label: 'Sí', position: 'right' },
                    { from: 'new', to: 'stock', label: '' },
                    { from: 'stock', to: 'insert', label: '' },
                    { from: 'insert', to: 'movement', label: 'Sí', position: 'right' },
                    { from: 'insert', to: 'trigger', label: 'No', position: 'right' },
                    { from: 'movement', to: 'trigger', label: '' },
                    { from: 'select', to: 'quantity', label: '' },
                    { from: 'quantity', to: 'update', label: '' },
                    { from: 'update', to: 'create2', label: '' },
                    { from: 'create2', to: 'trigger', label: '' },
                    { from: 'trigger', to: 'end', label: '' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Flujo de Edición de Producto */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Edit className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-bold dark:text-white text-gray-900">Flujo de Edición de Producto</h3>
            </div>
            <button
              onClick={() => openDiagram('edicion')}
              className="flex items-center gap-2 px-4 py-2 bg-neon-green hover:bg-neon-green/80 text-white rounded-lg transition-colors"
              title="Expandir diagrama"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm">Expandir</span>
            </button>
          </div>
          <div className="overflow-x-auto overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="w-full min-w-[600px] p-4 md:p-6">
              <div className="w-full" style={{ aspectRatio: '1 / 1.2', minHeight: '500px' }}>
                <Flowchart
                  nodes={[
                    { id: 'start', type: 'start', label: 'Inicio', x: 350, y: 20 },
                    { id: 'select', type: 'process', label: 'Seleccionar producto\nde la lista', x: 350, y: 100 },
                    { id: 'click', type: 'process', label: 'Click en botón\n"Editar"', x: 350, y: 200 },
                    { id: 'modal', type: 'process', label: 'Abrir modal de edición', x: 350, y: 300 },
                    { id: 'edit', type: 'process', label: 'Modificar datos:\n- Stock\n- Precio\n- Código de barras\n- Categoría', x: 350, y: 400 },
                    { id: 'confirm', type: 'decision', label: '¿Confirmar cambios?', x: 350, y: 500 },
                    { id: 'update', type: 'process', label: 'Actualizar producto\nen base de datos', x: 350, y: 600 },
                    { id: 'success', type: 'end', label: 'Producto actualizado', x: 350, y: 700 },
                    { id: 'cancel', type: 'end', label: 'Cancelar', x: 150, y: 500 },
                  ]}
                  connections={[
                    { from: 'start', to: 'select', label: '' },
                    { from: 'select', to: 'click', label: '' },
                    { from: 'click', to: 'modal', label: '' },
                    { from: 'modal', to: 'edit', label: '' },
                    { from: 'edit', to: 'confirm', label: '' },
                    { from: 'confirm', to: 'update', label: 'Sí', position: 'right' },
                    { from: 'confirm', to: 'cancel', label: 'No', position: 'left' },
                    { from: 'update', to: 'success', label: '' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Diagramas Expandidos */}
      {expandedDiagram && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closeDiagram}
        >
          <div 
            className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-xl font-bold dark:text-white text-gray-900">
                {expandedDiagram === 'general' && 'Diagrama de Flujo General de la Aplicación'}
                {expandedDiagram === 'auth' && 'Flujo de Autenticación'}
                {expandedDiagram === 'venta' && 'Flujo de Venta de Productos'}
                {expandedDiagram === 'agregar' && 'Flujo de Agregar Producto/Stock'}
                {expandedDiagram === 'edicion' && 'Flujo de Edición de Producto'}
              </h3>
              <button
                onClick={closeDiagram}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="w-full h-[calc(95vh-80px)] overflow-auto bg-gray-50 dark:bg-gray-900/50 p-8">
              {expandedDiagram === 'general' && (
                <div className="w-full h-full min-h-[1400px] flex items-center justify-center">
                  <div className="w-full max-w-[1600px]">
                    <GeneralFlowchart />
                  </div>
                </div>
              )}
              {expandedDiagram === 'auth' && (
                <div className="w-full h-full min-h-[800px] flex items-center justify-center">
                  <div className="w-full max-w-[1200px]">
                    <Flowchart
                    nodes={[
                      { id: 'start', type: 'start', label: 'Inicio', x: 400, y: 20 },
                      { id: 'check', type: 'decision', label: '¿Usuario autenticado?', x: 400, y: 100 },
                      { id: 'login', type: 'process', label: 'Página de Login\nIngresar email y contraseña', x: 200, y: 200 },
                      { id: 'validate', type: 'decision', label: '¿Credenciales válidas?', x: 200, y: 320 },
                      { id: 'error', type: 'process', label: 'Mostrar error', x: 50, y: 440 },
                      { id: 'dashboard', type: 'process', label: 'Acceso al Dashboard', x: 400, y: 200 },
                      { id: 'session', type: 'process', label: 'Verificar sesión\ncon Supabase Auth', x: 200, y: 500 },
                      { id: 'end', type: 'end', label: 'Usuario autenticado', x: 400, y: 600 },
                    ]}
                    connections={[
                      { from: 'start', to: 'check', label: '' },
                      { from: 'check', to: 'login', label: 'No', position: 'left' },
                      { from: 'check', to: 'dashboard', label: 'Sí', position: 'right' },
                      { from: 'login', to: 'validate', label: '' },
                      { from: 'validate', to: 'error', label: 'No', position: 'left' },
                      { from: 'validate', to: 'end', label: 'Sí', position: 'right' },
                      { from: 'error', to: 'session', label: '' },
                      { from: 'session', to: 'end', label: '' },
                      { from: 'dashboard', to: 'end', label: '' },
                    ]}
                    />
                  </div>
                </div>
              )}
              {expandedDiagram === 'venta' && (
                <div className="w-full h-full min-h-[1200px] flex items-center justify-center">
                  <div className="w-full max-w-[1400px]">
                    <Flowchart
                    nodes={[
                      { id: 'start', type: 'start', label: 'Inicio Venta', x: 450, y: 20 },
                      { id: 'method', type: 'decision', label: '¿Cómo agregar producto?', x: 450, y: 100 },
                      { id: 'scan', type: 'process', label: 'Escanear código\nde barras', x: 200, y: 200 },
                      { id: 'search', type: 'process', label: 'Buscar manualmente\npor nombre/SKU', x: 700, y: 200 },
                      { id: 'find', type: 'process', label: 'Buscar producto\nen base de datos', x: 450, y: 300 },
                      { id: 'exists', type: 'decision', label: '¿Producto encontrado?', x: 450, y: 400 },
                      { id: 'add', type: 'process', label: 'Agregar al carrito\n(Sumar si existe)', x: 450, y: 500 },
                      { id: 'confirm', type: 'decision', label: '¿Confirmar venta?', x: 450, y: 600 },
                      { id: 'validate', type: 'decision', label: '¿Stock suficiente?', x: 450, y: 700 },
                      { id: 'create', type: 'process', label: 'Crear movimiento\ntipo "salida"', x: 450, y: 800 },
                      { id: 'update', type: 'process', label: 'Trigger actualiza\ncurrent_stock', x: 450, y: 900 },
                      { id: 'success', type: 'end', label: 'Venta exitosa', x: 450, y: 1000 },
                      { id: 'error', type: 'process', label: 'Mostrar error\nStock insuficiente', x: 200, y: 700 },
                    ]}
                    connections={[
                      { from: 'start', to: 'method', label: '' },
                      { from: 'method', to: 'scan', label: 'Escáner', position: 'left' },
                      { from: 'method', to: 'search', label: 'Manual', position: 'right' },
                      { from: 'scan', to: 'find', label: '' },
                      { from: 'search', to: 'find', label: '' },
                      { from: 'find', to: 'exists', label: '' },
                      { from: 'exists', to: 'add', label: 'Sí', position: 'right' },
                      { from: 'add', to: 'confirm', label: '' },
                      { from: 'confirm', to: 'validate', label: 'Sí', position: 'right' },
                      { from: 'validate', to: 'create', label: 'Sí', position: 'right' },
                      { from: 'validate', to: 'error', label: 'No', position: 'left' },
                      { from: 'create', to: 'update', label: '' },
                      { from: 'update', to: 'success', label: '' },
                    ]}
                    />
                  </div>
                </div>
              )}
              {expandedDiagram === 'agregar' && (
                <div className="w-full h-full min-h-[1000px] flex items-center justify-center">
                  <div className="w-full max-w-[1400px]">
                    <Flowchart
                    nodes={[
                      { id: 'start', type: 'start', label: 'Inicio', x: 400, y: 20 },
                      { id: 'type', type: 'decision', label: '¿Producto existe?', x: 400, y: 100 },
                      { id: 'new', type: 'process', label: 'Crear nuevo producto\n(Formulario completo)', x: 150, y: 200 },
                      { id: 'stock', type: 'decision', label: '¿Stock inicial &gt; 0?', x: 150, y: 320 },
                      { id: 'insert', type: 'process', label: 'Insertar en products', x: 150, y: 440 },
                      { id: 'movement', type: 'process', label: 'Crear movimiento\ntipo "entrada"', x: 150, y: 560 },
                      { id: 'select', type: 'process', label: 'Seleccionar producto\nexistente', x: 650, y: 200 },
                      { id: 'quantity', type: 'process', label: 'Ingresar cantidad\na agregar', x: 650, y: 320 },
                      { id: 'update', type: 'process', label: 'Actualizar current_stock', x: 650, y: 440 },
                      { id: 'create2', type: 'process', label: 'Crear movimiento\ntipo "entrada"', x: 650, y: 560 },
                      { id: 'trigger', type: 'process', label: 'Trigger actualiza\nstock automáticamente', x: 400, y: 680 },
                      { id: 'end', type: 'end', label: 'Producto/Stock agregado', x: 400, y: 800 },
                    ]}
                    connections={[
                      { from: 'start', to: 'type', label: '' },
                      { from: 'type', to: 'new', label: 'No', position: 'left' },
                      { from: 'type', to: 'select', label: 'Sí', position: 'right' },
                      { from: 'new', to: 'stock', label: '' },
                      { from: 'stock', to: 'insert', label: '' },
                      { from: 'insert', to: 'movement', label: 'Sí', position: 'right' },
                      { from: 'insert', to: 'trigger', label: 'No', position: 'right' },
                      { from: 'movement', to: 'trigger', label: '' },
                      { from: 'select', to: 'quantity', label: '' },
                      { from: 'quantity', to: 'update', label: '' },
                      { from: 'update', to: 'create2', label: '' },
                      { from: 'create2', to: 'trigger', label: '' },
                      { from: 'trigger', to: 'end', label: '' },
                    ]}
                    />
                  </div>
                </div>
              )}
              {expandedDiagram === 'edicion' && (
                <div className="w-full h-full min-h-[900px] flex items-center justify-center">
                  <div className="w-full max-w-[1200px]">
                    <Flowchart
                    nodes={[
                      { id: 'start', type: 'start', label: 'Inicio', x: 350, y: 20 },
                      { id: 'select', type: 'process', label: 'Seleccionar producto\nde la lista', x: 350, y: 100 },
                      { id: 'click', type: 'process', label: 'Click en botón\n"Editar"', x: 350, y: 200 },
                      { id: 'modal', type: 'process', label: 'Abrir modal de edición', x: 350, y: 300 },
                      { id: 'edit', type: 'process', label: 'Modificar datos:\n- Stock\n- Precio\n- Código de barras\n- Categoría', x: 350, y: 400 },
                      { id: 'confirm', type: 'decision', label: '¿Confirmar cambios?', x: 350, y: 500 },
                      { id: 'update', type: 'process', label: 'Actualizar producto\nen base de datos', x: 350, y: 600 },
                      { id: 'success', type: 'end', label: 'Producto actualizado', x: 350, y: 700 },
                      { id: 'cancel', type: 'end', label: 'Cancelar', x: 150, y: 500 },
                    ]}
                    connections={[
                      { from: 'start', to: 'select', label: '' },
                      { from: 'select', to: 'click', label: '' },
                      { from: 'click', to: 'modal', label: '' },
                      { from: 'modal', to: 'edit', label: '' },
                      { from: 'edit', to: 'confirm', label: '' },
                      { from: 'confirm', to: 'update', label: 'Sí', position: 'right' },
                      { from: 'confirm', to: 'cancel', label: 'No', position: 'left' },
                      { from: 'update', to: 'success', label: '' },
                    ]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
