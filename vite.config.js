import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' makes the site work on GitHub Pages under any repository name.
export default defineConfig({ base: './', plugins: [react()] })
