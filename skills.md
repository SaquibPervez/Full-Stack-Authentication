# 🚀 ProFlow Intelligence System — Engineering Standards

---

## 1. UI/UX Philosophy (Elite Interface Design)

### Design Language
Ultra-minimalist, dark tactical interface inspired by modern platforms such as Linear and Vercel.

### Color System
- **Background:** `bg-slate-950` (primary canvas)
- **Surface Layers:** `bg-slate-900/50` with `backdrop-blur-md`
- **Borders:** `border-slate-800` (low-contrast separation)
- **Primary Actions:** `indigo-500 → indigo-600`

### Status Indicators
- **Success:** Emerald
- **In Progress:** Amber
- **Critical:** Rose

### Layout & Spacing
- Container padding: strictly `p-6` or `p-8`
- Grid spacing: `gap-6`
- Maintain strong visual rhythm and whitespace discipline

### Component Standards
- Border radius: `rounded-xl` or `rounded-2xl` only
- No sharp edges or inconsistent curvature
- Use subtle transparency and blur instead of heavy shadows

---

## 2. Frontend Architecture (React + Vite)

### State Management
- TanStack Query (React Query) is mandatory for all server state
- Avoid duplicating server data in local state

### API Layer
- Centralized Axios instance:
  - `withCredentials: true`
  - Global response interceptors for unified error handling
- Errors must be surfaced via toast notifications (Sonner or React Hot Toast)

### Architectural Patterns
- **Custom Hooks:** Encapsulate all business and data-fetching logic  
  _Examples: `useTasks`, `useAuth`_

- **Presentational Components:**  
  Strictly UI-focused, no embedded logic

### Navigation & Transitions
- Smooth route transitions using Framer Motion
- Implement progressive loading indicators (e.g., top progress bars)

---

## 3. Backend Architecture (Node.js + Prisma)

### Structural Pattern
Controller → Service → Repository (strict separation of concerns)

#### Repository Layer
- Handles all Prisma queries
- No business logic allowed

#### Service Layer
- Contains core business logic and computations
- Acts as the system’s decision engine

#### Controller Layer
- Handles HTTP requests/responses
- Delegates processing to services

### Security
- Authentication via JWT stored in HttpOnly cookies
- Enforce Role-Based Access Control (RBAC):

```ts
authorize('ADMIN', 'MANAGER')