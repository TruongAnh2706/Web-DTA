import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Wallet, 
  Copy, 
  Check, 
  AlertCircle, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Terminal,
  Grid,
  Info,
  DollarSign,
  Search,
  SlidersHorizontal,
  Star,
  Layers,
  Filter,
  ArrowUpDown,
  Plus,
  Minus,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import WalletModal from '@/components/WalletModal';
import { Link } from 'react-router-dom';

// Interface cho Sản phẩm chính (hiển thị ở danh sách)
interface Product {
  id: string;
  name: string;
  image: string;
  priceRaw: string;
  stock: string;
  sold: string;
  variantsCount: number;
  badge: string;
  category_id: string;
  category_name: string;
  ratingReviews?: string;
  description?: string;
}

// Interface cho Variant sản phẩm (tải real-time khi xem chi tiết)
interface ProductVariant {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  amount: number;
  description: string;
  min: string;
  max: string;
}

// Interface cho Category gom nhóm sản phẩm chính
interface Category {
  id: string;
  name: string;
  icon?: string;
  products: Product[];
}

// Interface cho Response API products danh sách
interface ProductsResponse {
  status: string;
  msg?: string;
  categories?: Category[];
}

// Interface cho Response API chi tiết sản phẩm chính
interface ProductDetailResponse {
  status: string;
  msg?: string;
  product?: {
    id: string;
    name: string;
    category: string;
    variants: ProductVariant[];
  };
}

// Interface cho Response API mua hàng
interface BuyResponse {
  status: string;
  msg: string;
  trans_id?: string;
  data?: string[];
}

export default function Resources() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, session } = useAuth();
  
  // Lấy thông tin ví và transactions của user trên Web-DTA
  const { data: dashboardData, refresh: refreshDashboard } = useDashboard();
  const userBalance = dashboardData?.wallet?.balance || 0;
  
  // State quản lý nạp tiền (Wallet Modal)
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  
  // State quản lý việc xem chi tiết & mua hàng
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [buyAmount, setBuyAmount] = useState<number>(1);
  const [buyError, setBuyError] = useState<string | null>(null);
  
  // State quản lý hiển thị kết quả mua hàng
  const [buyResult, setBuyResult] = useState<BuyResponse | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  
  // State hỗ trợ hiệu ứng copy
  const [copiedField, setCopiedField] = useState<{ index: number; field: string } | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // States hỗ trợ bộ lọc kiểu ShopMini (Checkbox nhiều danh mục + nút Tìm kiếm)
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tempStockFilter, setTempStockFilter] = useState<'all' | 'in_stock'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'sales' | 'price_asc' | 'price_desc'>('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // PHÂN TRANG (PAGINATION) - 20 SẢN PHẨM MỖI TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Fetch danh sách sản phẩm (đọc từ database tĩnh cào từ server)
  const { 
    data: productsData, 
    isLoading: isProductsLoading,
    refetch: refetchProducts,
    isRefetching: isProductsRefetching
  } = useQuery<ProductsResponse>({
    queryKey: ['shopmini-products-list'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
      return res.json();
    },
  });

  // Fetch chi tiết variants của sản phẩm chính đang chọn (Real-time)
  const {
    data: detailData,
    isLoading: isDetailLoading,
    refetch: refetchDetail
  } = useQuery<ProductDetailResponse>({
    queryKey: ['shopmini-product-detail', selectedProduct?.id],
    queryFn: async () => {
      if (!selectedProduct) return { status: 'error' };
      const res = await fetch(`/api/products?id=${selectedProduct.id}`);
      if (!res.ok) throw new Error('Không thể tải chi tiết phân loại');
      return res.json();
    },
    enabled: !!selectedProduct && isDetailOpen
  });

  // Reset selected variant khi chọn sản phẩm mới hoặc khi detailData tải xong
  useEffect(() => {
    if (detailData?.status === 'success' && detailData.product?.variants) {
      const variants = detailData.product.variants;
      if (variants.length > 0) {
        setSelectedVariant(variants[0]);
        setBuyAmount(parseInt(variants[0].min, 10) || 1);
        setBuyError(null);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [detailData]);

  // Mutation xử lý mua hàng (gọi API backend trừ tiền ví DTA)
  const buyMutation = useMutation<BuyResponse, Error, { id: string; amount: number }>({
    mutationFn: async ({ id, amount }) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch('/api/buy', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id, amount }),
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.msg || 'Giao dịch mua hàng thất bại');
      }
      return res.json();
    },
    onSuccess: async (data) => {
      if (data.status === 'success') {
        toast({
          title: 'Thanh toán thành công!',
          description: `Đã mua thành công ${buyAmount} tài nguyên.`,
        });

        // Làm mới số dư ví trên UI
        refreshDashboard();

        setBuyResult(data);
        setIsResultOpen(true);
        setIsDetailOpen(false); // Đóng dialog chi tiết
        setSelectedProduct(null);
        setSelectedVariant(null);
        setBuyAmount(1);
        setBuyError(null);
        
        // Refresh danh sách sản phẩm
        queryClient.invalidateQueries({ queryKey: ['shopmini-products-list'] });
      } else {
        setBuyError(data.msg || 'Có lỗi xảy ra khi xử lý đơn hàng.');
        toast({
          title: 'Giao dịch thất bại',
          description: data.msg,
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      setBuyError(error.message || 'Lỗi server khi thực hiện giao dịch.');
      toast({
        title: 'Lỗi hệ thống',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Áp dụng bộ lọc khi click nút "Tìm kiếm"
  const handleApplyFilters = () => {
    setSelectedCategories(tempCategories);
    setSearchQuery(tempSearchQuery);
    setStockFilter(tempStockFilter);
    setCurrentPage(1); // Reset về trang 1
    setShowMobileFilters(false);
    toast({
      title: 'Đã cập nhật bộ lọc',
      description: 'Danh sách sản phẩm đã được lọc theo yêu cầu.',
      duration: 1000
    });
  };

  // Reset trang khi thay đổi cách sắp xếp
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  // Toggle chọn danh mục
  const handleToggleCategory = (catId: string) => {
    if (tempCategories.includes(catId)) {
      setTempCategories(tempCategories.filter(id => id !== catId));
    } else {
      setTempCategories([...tempCategories, catId]);
    }
  };

  // Format tiền tệ Việt Nam (phân tách hàng nghìn bằng dấu chấm)
  const formatVND = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0 VNĐ';
    return num.toLocaleString('vi-VN') + ' VNĐ';
  };

  // Tính tổng tiền cho variant đang chọn
  const getSubtotal = () => {
    if (!selectedVariant) return 0;
    const price = parseFloat(selectedVariant.price) || 0;
    return price * buyAmount;
  };

  // Xử lý validate số lượng của variant
  const handleAmountChange = (val: string, variant: ProductVariant) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      setBuyAmount(0);
      setBuyError('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    const min = parseInt(variant.min, 10) || 1;
    const max = parseInt(variant.max, 10) || 100000;
    const available = variant.amount;

    setBuyAmount(num);

    if (num < min) {
      setBuyError(`Số lượng mua tối thiểu là ${min}`);
    } else if (num > max) {
      setBuyError(`Số lượng mua tối đa mỗi lần là ${max}`);
    } else if (num > available) {
      setBuyError(`Kho hàng chỉ còn lại ${available} sản phẩm`);
    } else {
      setBuyError(null);
    }
  };

  // Xác nhận giao dịch mua hàng
  const handleConfirmBuy = () => {
    if (!user) {
      toast({
        title: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập tài khoản để thực hiện mua tài nguyên.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedVariant) return;
    
    const min = parseInt(selectedVariant.min, 10) || 1;
    const max = parseInt(selectedVariant.max, 10) || 100000;
    const available = selectedVariant.amount;

    if (buyAmount < min || buyAmount > max || buyAmount > available) {
      toast({
        title: 'Số lượng không hợp lệ',
        description: 'Vui lòng kiểm tra lại giới hạn mua của phân loại này.',
        variant: 'destructive',
      });
      return;
    }

    // Kiểm tra số dư tài khoản ví Web-DTA
    const totalCost = getSubtotal();
    if (userBalance < totalCost) {
      setBuyError('Số dư ví của bạn không đủ để thực hiện giao dịch này.');
      toast({
        title: 'Số dư không đủ',
        description: 'Vui lòng nạp thêm tiền vào ví để tiếp tục.',
        variant: 'destructive',
      });
      return;
    }

    setBuyError(null);
    buyMutation.mutate({ id: selectedVariant.id, amount: buyAmount });
  };

  // Copy nhanh thông tin
  const handleCopyText = (text: string, index: number, field?: string) => {
    navigator.clipboard.writeText(text);
    if (field) {
      setCopiedField({ index, field });
      setTimeout(() => setCopiedField(null), 1500);
    }
    toast({
      title: 'Đã sao chép!',
      description: 'Sao chép thành công.',
      duration: 1000,
    });
  };

  // Copy toàn bộ tài nguyên
  const handleCopyAll = (data: string[]) => {
    const textToCopy = data.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast({
      title: 'Đã sao chép tất cả!',
      description: `Đã sao chép toàn bộ ${data.length} tài nguyên.`,
    });
  };

  // Làm mới nhanh dữ liệu
  const handleRefreshAll = () => {
    refreshDashboard();
    refetchProducts();
    toast({
      title: 'Đã làm mới dữ liệu',
      description: 'Danh sách tài nguyên và số dư ví mới nhất đã được cập nhật.',
    });
  };

  // 1. Phân loại & Lọc Danh mục sản phẩm chính
  const categories = productsData?.categories || [];

  // Lọc sản phẩm theo Category + SearchQuery + Stock
  let filteredProducts: Product[] = [];
  
  if (selectedCategories.length > 0) {
    categories.forEach(c => {
      if (selectedCategories.includes(c.id)) {
        filteredProducts.push(...c.products);
      }
    });
  } else {
    categories.forEach(c => {
      filteredProducts.push(...c.products);
    });
  }

  // Lọc theo từ khóa tìm kiếm (searchQuery)
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.id.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  // Lọc theo tình trạng kho (stockFilter)
  if (stockFilter === 'in_stock') {
    filteredProducts = filteredProducts.filter(p => parseInt(p.stock.replace(/\./g, ''), 10) > 0);
  }

  // Sắp xếp sản phẩm (sortBy)
  if (sortBy === 'price_asc') {
    filteredProducts.sort((a, b) => {
      const getMinPrice = (priceStr: string) => {
        const matches = priceStr.replace(/\./g, '').match(/\d+/);
        return matches ? parseFloat(matches[0]) : 0;
      };
      return getMinPrice(a.priceRaw) - getMinPrice(b.priceRaw);
    });
  } else if (sortBy === 'price_desc') {
    filteredProducts.sort((a, b) => {
      const getMinPrice = (priceStr: string) => {
        const matches = priceStr.replace(/\./g, '').match(/\d+/);
        return matches ? parseFloat(matches[0]) : 0;
      };
      return getMinPrice(b.priceRaw) - getMinPrice(a.priceRaw);
    });
  } else if (sortBy === 'sales') {
    filteredProducts.sort((a, b) => {
      const salesA = parseInt(a.sold.replace(/\./g, ''), 10) || 0;
      const salesB = parseInt(b.sold.replace(/\./g, ''), 10) || 0;
      return salesB - salesA;
    });
  }

  // PHÂN TÁCH TRANG HIỆN TẠI (PAGINATION CALCULATION)
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Render thanh phân trang giống giao diện ShopMini
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    return (
      <div className="flex flex-col items-center justify-center gap-3 pt-6 border-t border-primary/10 mt-8">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage(prev => Math.max(1, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="border-primary/20 hover:border-primary/50 hover:bg-primary/5 h-9 px-3 rounded-xl text-xs font-bold"
          >
            Trước
          </Button>
          
          {startPage > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentPage(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-9 w-9 rounded-xl text-xs font-bold"
              >
                1
              </Button>
              {startPage > 2 && <span className="text-muted-foreground text-xs px-1 select-none">...</span>}
            </>
          )}
          
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => {
            const isActive = page === currentPage;
            return (
              <Button
                key={page}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`h-9 w-9 rounded-xl text-xs font-bold ${
                  isActive 
                  ? 'bg-[#FFC107] text-[#070913] hover:bg-[#FFB300] shadow-[0_0_8px_rgba(255,193,7,0.25)] border-[#FFC107]' 
                  : 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'
                }`}
              >
                {page}
              </Button>
            );
          })}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-muted-foreground text-xs px-1 select-none">...</span>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentPage(totalPages);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-9 w-9 rounded-xl text-xs font-bold"
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage(prev => Math.min(totalPages, prev + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="border-primary/20 hover:border-primary/50 hover:bg-primary/5 h-9 px-3 rounded-xl text-xs font-bold"
          >
            Sau
          </Button>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider font-bold">
          Trang {currentPage} / {totalPages}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070913] text-foreground pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      <Helmet>
        <title>Tài Nguyên DTA - Đức Trường AI | DTA Studio</title>
        <meta name="description" content="Hệ thống cung cấp nguyên liệu, Gmail làm video AI hàng đầu của DTA Studio." />
      </Helmet>

      {/* Hiệu ứng tia sáng Neon mờ ảo ở background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[hsl(var(--neon-cyan))/0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[hsl(var(--neon-red))/0.02] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header trang */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-primary/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_hsl(var(--neon-cyan))]" />
              <span className="text-xs uppercase tracking-widest text-[hsl(var(--neon-cyan))] font-bold font-mono">DTA Automated Resource Hub</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
              Tài <span className="gradient-text">Nguyên</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-base">
              Hệ thống cung cấp nguyên liệu, Gmail và tài khoản bổ trợ chất lượng cao phục vụ các công cụ tự động hóa video.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefreshAll}
              disabled={isProductsRefetching}
              className="border-primary/20 hover:border-primary/50 rounded-xl bg-background/50 backdrop-blur-sm h-12 w-12"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isProductsRefetching ? 'animate-spin text-primary' : ''}`} />
            </Button>
            
            {/* Thẻ hiển thị số dư ví của user trên Web-DTA */}
            <Card className="glass border-[hsl(var(--neon-cyan)/0.25)] shadow-[0_0_15px_rgba(0,255,255,0.03)] rounded-2xl min-w-[240px]">
              <CardContent className="p-3 px-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[hsl(var(--neon-cyan))/0.1] border border-[hsl(var(--neon-cyan))/0.3] flex items-center justify-center text-[hsl(var(--neon-cyan))]">
                    <Wallet className="w-4 h-4 shadow-sm" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase font-mono">Số dư ví DTA</p>
                    <h3 className="text-base font-black font-mono text-[hsl(var(--neon-cyan))]">
                      {!user ? "0 VNĐ" : formatVND(userBalance)}
                    </h3>
                  </div>
                </div>
                {user ? (
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsWalletOpen(true)}
                    className="h-8 text-xs font-bold text-primary hover:text-primary/80 px-3 rounded-xl border border-primary/20"
                  >
                    Nạp tiền
                  </Button>
                ) : (
                  <Link to="/auth">
                    <Button 
                      size="sm"
                      className="h-8 text-xs font-bold btn-neon text-background px-3 rounded-xl"
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Nút lọc nhanh trên Mobile */}
        <div className="md:hidden flex gap-2">
          <Button 
            className="w-full justify-center border-primary/20 rounded-xl bg-background/50 text-xs" 
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
            {showMobileFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc & Tìm kiếm"}
          </Button>
        </div>

        {/* Layout hai cột chính kiểu ShopMini */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* CỘT TRÁI (1/4): BỘ LỌC SIDEBAR */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block md:col-span-1 space-y-6`}>
            
            {/* Sidebar Bộ lọc kiểu ShopMini */}
            <Card className="glass border-primary/10 rounded-2xl p-5 space-y-5 bg-[#0b0e20]/60 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[hsl(var(--neon-cyan))]" />
                  Bộ lọc tài nguyên
                </h3>
                {(tempCategories.length > 0 || tempSearchQuery !== '' || tempStockFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setTempCategories([]);
                      setTempSearchQuery('');
                      setTempStockFilter('all');
                      setSelectedCategories([]);
                      setSearchQuery('');
                      setStockFilter('all');
                      setCurrentPage(1);
                      toast({ title: 'Đã đặt lại bộ lọc' });
                    }}
                    className="text-[10px] text-[hsl(var(--neon-red))] font-bold hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Hộp Tìm Kiếm */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Từ khóa tìm kiếm</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nhập tên sản phẩm..."
                    value={tempSearchQuery}
                    onChange={(e) => setTempSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyFilters();
                    }}
                    className="w-full bg-[#070913] border border-primary/10 hover:border-primary/30 focus:border-[hsl(var(--neon-cyan))] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none transition-colors text-foreground"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                </div>
              </div>

              {/* Bộ lọc Chọn nhiều danh mục (Checkbox) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Chọn danh mục</label>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {categories.map((cat) => {
                    const isChecked = tempCategories.includes(cat.id);
                    return (
                      <label 
                        key={cat.id} 
                        className="flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors py-1"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCategory(cat.id)}
                            className="w-3.5 h-3.5 rounded border-primary/20 accent-[hsl(var(--neon-cyan))]"
                          />
                          <span className="truncate max-w-[130px]">{cat.name}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono bg-primary/5 text-primary border border-primary/5">
                          {cat.products?.length || 0}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Bộ lọc Kho hàng */}
              <div className="space-y-2 border-t border-primary/5 pt-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Tình trạng kho</label>
                <div className="space-y-2 text-xs font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors py-0.5">
                    <input
                      type="radio"
                      name="stock-filter"
                      checked={tempStockFilter === 'all'}
                      onChange={() => setTempStockFilter('all')}
                      className="accent-[hsl(var(--neon-cyan))]"
                    />
                    Tất cả tài nguyên
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors py-0.5">
                    <input
                      type="radio"
                      name="stock-filter"
                      checked={tempStockFilter === 'in_stock'}
                      onChange={() => setTempStockFilter('in_stock')}
                      className="accent-[hsl(var(--neon-cyan))]"
                    />
                    Chỉ hiện sản phẩm còn hàng
                  </label>
                </div>
              </div>

              {/* Sắp xếp nhanh */}
              <div className="space-y-2 border-t border-primary/5 pt-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Sắp xếp theo</label>
                <div className="space-y-2 text-xs font-semibold">
                  {[
                    { id: 'default', label: 'Mặc định (ShopMini)' },
                    { id: 'sales', label: 'Bán chạy nhất (Hot)' },
                    { id: 'price_asc', label: 'Giá thấp đến cao' },
                    { id: 'price_desc', label: 'Giá cao xuống thấp' },
                  ].map((option) => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors py-0.5">
                      <input
                        type="radio"
                        name="sort-filter"
                        checked={sortBy === option.id}
                        onChange={() => setSortBy(option.id as any)}
                        className="accent-[hsl(var(--neon-cyan))]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Nút Tìm kiếm màu vàng nổi bật giống ShopMini */}
              <Button
                onClick={handleApplyFilters}
                className="w-full rounded-xl font-black text-xs bg-[#FFC107] text-[#070913] hover:bg-[#FFB300] py-5 uppercase tracking-widest shadow-[0_0_15px_rgba(255,193,7,0.15)] transition-all hover:shadow-[0_0_20px_rgba(255,193,7,0.3)] mt-2"
              >
                <Search className="w-3.5 h-3.5 mr-2 stroke-[3]" />
                TÌM KIẾM
              </Button>
            </Card>
          </div>

          {/* CỘT PHẢI (3/4): GRID DANH SÁCH SẢN PHẨM CHÍNH PHÂN TRANG */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Thông tin số lượng sản phẩm lọc */}
            <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3 text-xs">
              <div className="text-muted-foreground">
                Hệ thống có <span className="text-[hsl(var(--neon-cyan))] font-bold font-mono">617</span> sản phẩm • Đang lọc thấy <span className="text-[hsl(var(--neon-cyan))] font-bold font-mono">{totalItems}</span> sản phẩm chính (Hiển thị 20 sản phẩm/trang)
              </div>
              <div className="hidden sm:flex items-center gap-2 font-mono text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="font-bold text-muted-foreground uppercase">Tự động kết nối 24/7 qua DTA Studio</span>
              </div>
            </div>

            {/* Lưới sản phẩm dạng card thiết kế chuẩn 2 cột giống ShopMini */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {isProductsLoading ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="glass border-primary/5 rounded-2xl h-44 animate-pulse" />
                ))
              ) : currentProducts.length > 0 ? (
                currentProducts.map((product) => {
                  const isOutOfStock = parseInt(product.stock.replace(/\./g, ''), 10) <= 0;

                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="group cursor-pointer"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsDetailOpen(true);
                      }}
                    >
                      <Card 
                        className={`glass transition-all duration-300 rounded-2xl border ${
                          isOutOfStock 
                          ? 'border-primary/5 opacity-80' 
                          : 'border-primary/10 hover:border-[hsl(var(--neon-cyan))/0.3] hover:shadow-[0_0_15px_rgba(0,255,255,0.04)]'
                        } p-4 flex flex-col sm:flex-row gap-4 h-full`}
                      >
                        
                        {/* CỘT TRÁI CARD: Hình ảnh sản phẩm (có viền vàng/cam) & tồn kho, giá bán range */}
                        <div className="w-full sm:w-36 shrink-0 flex flex-col items-center gap-2.5">
                          {/* Khung ảnh có viền vàng/cam */}
                          <div className="w-28 h-28 relative overflow-hidden rounded-xl border-2 border-[#FFC107] bg-[#070913] flex items-center justify-center p-1.5 shadow-[0_0_8px_rgba(255,193,7,0.08)]">
                            <img 
                              src={product.image || 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=250&auto=format&fit=crop&q=80'} 
                              alt={product.name}
                              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                            
                            {/* Badge "KHÔNG TRÙNG" ở góc trên trái ảnh */}
                            {product.badge === 'KHÔNG TRÙNG' && (
                              <div className="absolute top-1 left-1">
                                <span className="bg-[#FFC107] text-[#070913] text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                                  KHÔNG TRÙNG
                                </span>
                              </div>
                            )}

                            {/* Badge "TÀI TRỢ" ở góc dưới phải ảnh */}
                            {product.badge === 'TÀI TRỢ' && (
                              <div className="absolute bottom-1 right-1">
                                <span className="bg-[#FFC107] text-[#070913] text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-wider font-mono">
                                  👑 TÀI TRỢ
                                </span>
                              </div>
                            )}

                            {/* Badge "X Phân loại" ở góc dưới trái ảnh */}
                            <div className="absolute bottom-1 left-1">
                              <span className="bg-[#8C52FF] text-white text-[8px] font-black px-1 py-0.5 rounded tracking-wider font-mono">
                                {product.variantsCount} Phân loại
                              </span>
                            </div>
                          </div>

                          {/* Tồn kho & Khoảng giá bên dưới ảnh */}
                          <div className="text-center w-full space-y-0.5">
                            <div className="text-[10px] font-bold text-teal-400 font-mono">
                              Tồn kho: {product.stock}
                            </div>
                            <div className="text-xs font-black font-mono text-[hsl(var(--neon-cyan))] truncate w-full px-1">
                              {product.priceRaw}
                            </div>
                          </div>
                        </div>

                        {/* CỘT PHẢI CARD: Tiêu đề, Đánh giá, Người bán, Định dạng, Mô tả (Được tối ưu để không bị tràn lề) */}
                        <div className="flex-1 flex flex-col justify-between space-y-2 text-left w-full min-w-0">
                          <div className="space-y-1.5 w-full min-w-0">
                            
                            {/* Dòng badge sản phẩm màu vàng & Tên sản phẩm chính */}
                            <div className="flex items-start gap-1.5 flex-wrap min-w-0">
                              <span className="bg-[#FFC107] text-[#070913] text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0 font-mono select-none">
                                Sản phẩm
                              </span>
                              <h3 className="font-bold text-sm md:text-base text-foreground leading-snug line-clamp-2 group-hover:text-[hsl(var(--neon-cyan))] transition-colors break-words whitespace-normal flex-1">
                                {product.name}
                              </h3>
                            </div>

                            {/* Dòng đánh giá sao & Số lượng đã bán */}
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono flex-wrap">
                              <span className="flex items-center gap-0.5 text-yellow-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                5.0 (0 reviews)
                              </span>
                              <span>|</span>
                              <span>Đã bán: <strong className="text-foreground">{product.sold}</strong></span>
                              <span>|</span>
                              <span>Khiếu nại: <strong className="text-green-500">0%</strong></span>
                            </div>

                            {/* Người bán */}
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono flex-wrap">
                              <span>Người bán: <strong className="text-[hsl(var(--neon-cyan))]">VDFB4887</strong></span>
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="bg-primary/10 text-primary border border-primary/20 px-1 py-0.2 rounded text-[9px] select-none">Chưa xác thực</span>
                            </div>

                            {/* Định dạng / Mô tả mô phỏng ShopMini (Đã FIX lỗi tràn lề bằng whitespace-normal và break-words) */}
                            <div className="text-[10px] text-muted-foreground space-y-0.5 leading-relaxed bg-[#070913]/30 p-2 rounded-lg border border-primary/5 w-full whitespace-normal break-words overflow-hidden">
                              {product.category_id.includes('gmail') || product.category_id.includes('outlook') ? (
                                <p className="whitespace-normal break-all">
                                  <strong>Định dạng:</strong> Gmail | Pass | Mail Recovery | 2FA (nếu có)
                                </p>
                              ) : product.category_id.includes('chatgpt') ? (
                                <p className="whitespace-normal break-all">
                                  <strong>Định dạng:</strong> Email | Password | Cookie OpenAI
                                </p>
                              ) : (
                                <p className="whitespace-normal break-all">
                                  <strong>Định dạng:</strong> Tài khoản | Mật khẩu | Token bàn giao tự động
                                </p>
                              )}
                              {product.description ? (
                                <p className="line-clamp-2 text-[9px] text-muted-foreground italic mt-0.5 whitespace-normal break-words overflow-hidden">
                                  💡 {product.description}
                                </p>
                              ) : (
                                <p className="line-clamp-2 text-[9px] text-muted-foreground italic mt-0.5 whitespace-normal break-words overflow-hidden">
                                  💡 Kinh doanh: Hệ thống cung cấp tài nguyên làm video AI tự động, bảo hành 1:1.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Footer Card: Danh mục & Nút hành động */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-primary/5 w-full min-w-0">
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest font-mono truncate mr-2">
                              {product.category_name}
                            </span>
                            <span className="text-[10px] font-bold text-[hsl(var(--neon-cyan))] group-hover:underline flex items-center gap-1 font-mono shrink-0">
                              Chi tiết & Mua
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>

                        </div>

                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center glass border border-dashed border-primary/10 rounded-2xl space-y-3">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground text-sm font-semibold">
                    Không tìm thấy sản phẩm tài nguyên nào phù hợp với bộ lọc.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border-primary/20 text-xs"
                    onClick={() => {
                      setTempCategories([]);
                      setTempSearchQuery('');
                      setTempStockFilter('all');
                      setSelectedCategories([]);
                      setSearchQuery('');
                      setStockFilter('all');
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>

            {/* Thanh điều hướng phân trang */}
            {renderPagination()}

            {/* Lưu ý hệ thống dưới chân trang */}
            <Card className="glass border-primary/10 rounded-2xl p-5 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Info className="w-4 h-4 text-primary" />
                Quy trình & Điều khoản mua hàng tự động
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Hệ thống xử lý real-time hoàn toàn tự động. Tài nguyên được chuyển giao ngay lập tức sau khi hệ thống trừ tiền ví DTA thành công.</li>
                <li>Vui lòng sao chép nhanh hoặc tải file raw lưu trữ tài nguyên ngay sau khi màn hình thông báo mua thành công hiện lên. Hệ thống không lưu trữ lịch sử lâu dài để bảo vệ thông tin mật.</li>
                <li>Định dạng bóc tách Gmail hoặc các tài khoản luôn được chuẩn hóa, bạn có thể bấm nút Copy nhanh từng cột (Gmail/UID, Mật khẩu, 2FA) tiện lợi.</li>
                <li>Mọi thắc mắc hoặc trường hợp tài nguyên bị lỗi, vui lòng liên hệ Zalo Admin để được hỗ trợ kiểm tra và bảo hành 1:1 theo chính sách.</li>
              </ul>
            </Card>

          </div>

        </div>

      </div>

      {/* DIALOG CHI TIẾT SẢN PHẨM & CÁC PHÂN LOẠI (VARIANTS) REAL-TIME (TỐI ƯU HÓA HIỂN THỊ ẢNH TO, TRÁNH TRÀN LỀ) */}
      <Dialog open={isDetailOpen} onOpenChange={(open) => {
        setIsDetailOpen(open);
        if (!open) {
          setSelectedProduct(null);
          setSelectedVariant(null);
          setBuyAmount(1);
          setBuyError(null);
        }
      }}>
        <DialogContent className="max-w-xl glass border-[hsl(var(--neon-cyan)/0.3)] bg-[#070913]/95 text-foreground rounded-3xl p-6 shadow-[0_0_25px_rgba(0,255,255,0.08)]">
          <DialogHeader className="border-b border-primary/10 pb-3">
            <DialogTitle className="text-lg font-black text-[hsl(var(--neon-cyan))] flex items-center gap-2 uppercase tracking-wide">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Chi tiết tài nguyên & Chọn mua
            </DialogTitle>
            <DialogDescription className="text-xs">
              Xem và lựa chọn phân loại tài nguyên phù hợp để thanh toán tự động qua ví DTA.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-2 w-full min-w-0">
              
              {/* Box thông tin sản phẩm chính (Nâng cấp: Ảnh lớn w-20 h-20, fix lỗi tiêu đề dài) */}
              <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4 items-center w-full min-w-0">
                <div className="w-20 h-20 md:w-24 md:h-24 relative overflow-hidden rounded-xl border-2 border-[#FFC107] shrink-0 bg-[#070913] p-1.5 shadow-[0_0_8px_rgba(255,193,7,0.1)]">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 flex-1 min-w-0 text-left">
                  <h4 className="font-bold text-foreground text-sm md:text-base leading-snug break-words whitespace-normal">
                    {selectedProduct.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground font-mono pt-1">
                    <span>Mã SP: <strong className="text-foreground">{selectedProduct.id}</strong></span>
                    <span>•</span>
                    <span>Tồn kho: <strong className="text-foreground">{selectedProduct.stock}</strong></span>
                  </div>
                </div>
              </div>

              {/* Tải danh sách variants */}
              <div className="space-y-2 w-full">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono block">
                  Chọn phân loại (Variants)
                </label>

                {isDetailLoading ? (
                  <div className="py-8 text-center space-y-2">
                    <RefreshCw className="w-5 h-5 mx-auto text-primary animate-spin" />
                    <p className="text-xs text-muted-foreground font-mono">Đang tải phân loại từ ShopMini...</p>
                  </div>
                ) : detailData?.status === 'success' && detailData.product?.variants && detailData.product.variants.length > 0 ? (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin w-full">
                    {detailData.product.variants.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id;
                      const isOutOfStock = variant.amount <= 0;

                      return (
                        <div
                          key={variant.id}
                          onClick={() => {
                            if (isOutOfStock) return;
                            setSelectedVariant(variant);
                            setBuyAmount(parseInt(variant.min, 10) || 1);
                            setBuyError(null);
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                            isOutOfStock 
                            ? 'bg-[#070913]/30 border-primary/5 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[hsl(var(--neon-cyan))/0.05] border-[hsl(var(--neon-cyan))] text-foreground shadow-[0_0_10px_rgba(0,255,255,0.02)]'
                            : 'bg-background/40 border-primary/10 text-muted-foreground hover:text-foreground hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="radio"
                              name="variant-select"
                              checked={isSelected}
                              disabled={isOutOfStock}
                              onChange={() => {}}
                              className="accent-[hsl(var(--neon-cyan))] shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold truncate whitespace-normal break-words">{variant.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                Tồn kho: <strong className="text-foreground">{variant.amount}</strong> • Giá: <strong className="text-foreground">{formatVND(variant.price)}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase font-mono ${
                              isOutOfStock 
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-green-500/10 text-green-500'
                            }`}>
                              {isOutOfStock ? 'Hết hàng' : 'Sẵn sàng'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center border border-dashed border-primary/10 rounded-xl text-xs text-muted-foreground w-full">
                    Không tìm thấy phân loại bán hàng nào cho sản phẩm này.
                  </div>
                )}
              </div>

              {/* Form số lượng cho Variant đã chọn */}
              {selectedVariant && (
                <div className="space-y-3 pt-2 border-t border-primary/5 w-full">
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider w-full">
                    <span>Số lượng mua:</span>
                    <span className="font-mono text-[10px] font-medium lowercase">
                      (Giới hạn: {selectedVariant.min} - {selectedVariant.max} cái)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newAmount = Math.max(parseInt(selectedVariant.min, 10) || 1, buyAmount - 1);
                        setBuyAmount(newAmount);
                        handleAmountChange(newAmount.toString(), selectedVariant);
                      }}
                      className="h-10 w-10 rounded-xl border-primary/20 hover:bg-primary/5 font-bold shrink-0"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    
                    <Input
                      type="number"
                      min={selectedVariant.min}
                      max={selectedVariant.max}
                      value={buyAmount === 0 ? '' : buyAmount}
                      onChange={(e) => handleAmountChange(e.target.value, selectedVariant)}
                      className="flex-1 rounded-xl border-primary/20 bg-[#070913]/50 focus-visible:ring-[hsl(var(--neon-cyan))] font-mono font-bold text-center text-sm h-10 text-foreground"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newAmount = Math.min(selectedVariant.amount, buyAmount + 1);
                        setBuyAmount(newAmount);
                        handleAmountChange(newAmount.toString(), selectedVariant);
                      }}
                      className="h-10 w-10 rounded-xl border-primary/20 hover:bg-primary/5 font-bold shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {buyError && (
                    <p className="text-xs text-[hsl(var(--neon-red))] flex items-center gap-1 font-semibold whitespace-normal break-words">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {buyError}
                    </p>
                  )}

                  {/* Chi tiết số dư và thanh toán (Đã thiết lập w-full, flex-row alignment chống tràn) */}
                  <div className="mt-3 p-3.5 bg-[#070913]/60 border border-primary/10 rounded-xl space-y-2 w-full">
                    <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                      <span className="shrink-0 font-medium">Số dư ví DTA hiện có:</span>
                      <span className="font-bold text-[hsl(var(--neon-cyan))] font-mono text-right shrink-0">
                        {!user ? "0 VNĐ" : formatVND(userBalance)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center w-full pt-1 border-t border-primary/5">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">Tổng thanh toán:</span>
                      <span className="text-base font-black font-mono text-[hsl(var(--neon-cyan))] text-right shrink-0">
                        {formatVND(getSubtotal())}
                      </span>
                    </div>

                    {/* Warning số dư */}
                    {userBalance < getSubtotal() && (
                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col gap-2 w-full">
                        <p className="text-[11px] text-[hsl(var(--neon-red))] font-semibold flex items-center gap-1.5 whitespace-normal break-words">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          Số dư ví của bạn không đủ để thanh toán!
                        </p>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsDetailOpen(false);
                            setIsWalletOpen(true);
                          }}
                          className="border-[hsl(var(--neon-red))/30] hover:bg-red-500/20 text-[hsl(var(--neon-red))] font-bold text-[10px] uppercase h-8 rounded-lg w-full"
                        >
                          Nạp thêm tiền ví
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-primary/10 pt-4 flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailOpen(false);
                setSelectedProduct(null);
                setSelectedVariant(null);
                setBuyAmount(1);
                setBuyError(null);
              }}
              className="flex-1 rounded-xl border-primary/20 text-xs font-semibold h-11"
            >
              Hủy bỏ
            </Button>
            <Button
              disabled={!selectedVariant || !!buyError || buyMutation.isPending || buyAmount <= 0 || userBalance < getSubtotal()}
              onClick={handleConfirmBuy}
              className="flex-1 btn-neon text-background font-black tracking-wider rounded-xl h-11 relative overflow-hidden shadow-[0_0_10px_rgba(0,255,255,0.2)]"
            >
              {buyMutation.isPending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin text-background" />
                  Đang mua...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                  MUA NGAY
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal hiển thị Kết Quả mua tài nguyên thành công */}
      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="max-w-4xl glass border-[hsl(var(--neon-cyan)/0.3)] bg-[#070913]/95 text-foreground rounded-3xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.1)] scrollbar-thin overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-primary/10 pb-4">
            <DialogTitle className="text-2xl font-black text-[hsl(var(--neon-cyan))] flex items-center gap-2 uppercase tracking-wide">
              <Check className="w-6 h-6 p-1 rounded-full bg-[hsl(var(--neon-cyan))/0.1] border border-[hsl(var(--neon-cyan))/0.3]" />
              MUA TÀI NGUYÊN THÀNH CÔNG!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Vui lòng copy và lưu trữ tài nguyên ngay. Hệ thống không lưu trữ lịch sử lâu dài để bảo mật.
            </DialogDescription>
          </DialogHeader>

          {buyResult && (
            <div className="space-y-6 py-4">
              
              {/* Thông tin đơn hàng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>{' '}
                  <span className="text-[hsl(var(--neon-cyan))] font-bold">Hoàn tất</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mã đơn hàng:</span>{' '}
                  <span className="text-foreground font-bold">{buyResult.trans_id || 'N/A'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Thông báo:</span>{' '}
                  <span className="text-foreground">Đã mua thành công từ hệ thống DTA</span>
                </div>
              </div>

              {/* Bảng bóc tách định dạng tài khoản */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    Bảng chi tiết tài nguyên
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyAll(buyResult.data || [])}
                    className={`rounded-xl font-bold text-xs border-primary/20 transition-all ${
                      copiedAll ? 'bg-primary text-background' : 'hover:border-primary/50'
                    }`}
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Đã copy tất cả
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copy toàn bộ
                      </>
                    )}
                  </Button>
                </div>

                <div className="border border-primary/10 rounded-xl overflow-hidden bg-background/40">
                  <Table>
                    <TableHeader className="bg-primary/5">
                      <TableRow className="border-b border-primary/10">
                        <TableHead className="w-[60px] font-bold text-foreground text-center">STT</TableHead>
                        <TableHead className="font-bold text-foreground">Tài khoản (Gmail/UID)</TableHead>
                        <TableHead className="font-bold text-foreground">Mật khẩu</TableHead>
                        <TableHead className="font-bold text-foreground">Mã khôi phục / 2FA / Khác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buyResult.data && buyResult.data.length > 0 ? (
                        buyResult.data.map((item, index) => {
                          // Bóc tách chuỗi phân tách bởi |
                          const parts = item.split('|');
                          const username = parts[0] || 'N/A';
                          const password = parts[1] || 'N/A';
                          const extraInfo = parts.slice(2).join(' | ') || 'N/A';

                          return (
                            <TableRow key={index} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                              <TableCell className="font-mono text-center text-muted-foreground">{index + 1}</TableCell>
                              <TableCell className="font-mono text-sm max-w-[200px] truncate">
                                <div className="flex items-center justify-between gap-2 group">
                                  <span className="truncate">{username}</span>
                                  {username !== 'N/A' && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleCopyText(username, index, 'user')}
                                      className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-md text-muted-foreground hover:text-primary"
                                    >
                                      {copiedField?.index === index && copiedField?.field === 'user' ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm max-w-[150px] truncate">
                                <div className="flex items-center justify-between gap-2 group">
                                  <span className="truncate">{password}</span>
                                  {password !== 'N/A' && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleCopyText(password, index, 'pass')}
                                      className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-md text-muted-foreground hover:text-primary"
                                    >
                                      {copiedField?.index === index && copiedField?.field === 'pass' ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm max-w-[250px] truncate">
                                <div className="flex items-center justify-between gap-2 group">
                                  <span className="truncate">{extraInfo}</span>
                                  {extraInfo !== 'N/A' && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleCopyText(extraInfo, index, 'extra')}
                                      className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-md text-muted-foreground hover:text-primary"
                                    >
                                      {copiedField?.index === index && copiedField?.field === 'extra' ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            Không có thông tin tài nguyên nào được trả về.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Dữ liệu thô (Raw text) */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  Định dạng raw (Copy nhanh)
                </h4>
                <div className="relative group">
                  <textarea
                    readOnly
                    value={buyResult.data?.join('\n') || ''}
                    rows={4}
                    className="w-full font-mono text-xs p-4 bg-background/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary/30 resize-none h-28 scrollbar-thin"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopyAll(buyResult.data || [])}
                    className="absolute top-3 right-3 opacity-80 hover:opacity-100 rounded-lg border-primary/20"
                    title="Copy tất cả raw"
                  >
                    {copiedAll ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

            </div>
          )}

          <div className="border-t border-primary/10 pt-4 flex justify-end gap-3">
            <Button
              onClick={() => setIsResultOpen(false)}
              className="btn-neon text-background font-bold tracking-wider px-6 rounded-xl"
            >
              Đóng & Tiếp tục
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tích hợp WalletModal của Web-DTA để nạp tiền */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        balance={userBalance}
      />

    </div>
  );
}
