/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@assiettly/shared"],
  async headers() {
    return [
      {
        // Photos de démo statiques (public/landing/demo/*.webp) : jamais
        // modifiées en place (un remplacement = nouveau nom de fichier ou
        // redéploiement complet), donc immutable + cache long côté
        // navigateur et CDN.
        source: "/landing/demo/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
