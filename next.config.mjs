/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    // Permette immagini da qualsiasi dominio in produzione se necessario
    remotePatterns: [],
  },
}

export default nextConfig
