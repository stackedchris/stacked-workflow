import React from 'react'

export const TikTokIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="tiktok-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff0050" />
        <stop offset="50%" stopColor="#ff0050" />
        <stop offset="100%" stopColor="#00f2ea" />
      </linearGradient>
    </defs>
    <path
      d="M19.321 5.562a5.124 5.124 0 01-.443-.258 6.228 6.228 0 01-1.137-.966c-.849-.849-1.341-1.997-1.341-3.123V.8h-3.738v14.954c0 1.715-1.391 3.106-3.106 3.106s-3.106-1.391-3.106-3.106 1.391-3.106 3.106-3.106c.343 0 .673.056.981.159V9.042a6.837 6.837 0 00-.981-.071C4.798 8.971.8 12.969.8 17.758s3.998 8.787 8.787 8.787 8.787-3.998 8.787-8.787V9.872a9.724 9.724 0 005.947 2.028v-3.738a5.999 5.999 0 01-4.999-2.599z"
      fill="url(#tiktok-gradient)"
    />
  </svg>
)

export const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#833ab4" />
        <stop offset="50%" stopColor="#fd1d1d" />
        <stop offset="100%" stopColor="#fcb045" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#instagram-gradient)" />
    <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="white" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const TwitterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
      fill="#1DA1F2"
    />
  </svg>
)

export const YouTubeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"
      fill="#FF0000"
    />
    <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="white" />
  </svg>
)
