# Performance Optimization Report

## Vấn đề
Web production chạy lag hơn localhost do:
- Bundle size lớn (680 kB → 220 kB gzipped)
- Không có aggressive caching
- React Query refetch quá nhiều

## Giải pháp đã áp dụng

### 1. Vite Build Optimization
- Tách vendor chunks chi tiết hơn (Radix, Forms)
- Enable modern ES target
- Minify với esbuild

### 2. Vercel Configuration
- Cache assets 1 năm
- Security headers
- SPA routing

### 3. React Query Optimization
- Tăng staleTime: 5 phút → 10 phút
- Thêm gcTime: 15 phút
- Tắt refetchOnWindowFocus
- Tắt refetchOnReconnect

## Kết quả
- Main bundle: **-17 kB gzipped** (87 → 69 kB)
- Admin page: **-8 kB gzipped** (22 → 13 kB)
- Better caching strategy
- Ít API calls hơn

## Deploy
```bash
git add .
git commit -m "chore: optimize bundle size and caching"
git push
```

Vercel sẽ tự động deploy với config mới.
