
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      { // Added for Firebase Storage
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      { // Added for blogger content
        protocol: 'https',
        hostname: 'blogger.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      { // Added for freepik content
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
      { // Added for Canva content
        protocol: 'https',
        hostname: 'www.canva.com',
        port: '',
        pathname: '/**',
      },
      { // Added for ImageKit content
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
      { // Added for back.mansoura-eco-build.com
        protocol: 'https',
        hostname: 'back.mansoura-eco-build.com',
        port: '',
        pathname: '/**',
      },
      { // Added for emaratalyoum.com
        protocol: 'https',
        hostname: 'www.emaratalyoum.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
