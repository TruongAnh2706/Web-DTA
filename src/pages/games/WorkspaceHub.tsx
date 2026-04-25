import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Settings, Plus, HardDrive, FolderClosed,
  FileText, Sheet, BarChart3, Clock, MoreVertical,
  Grid3X3, List, ChevronDown, Star, Users, Trash2,
  Cloud, X
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   DTA WORKSPACE — Stealth Game Hub
   Giả lập giao diện Google Drive
   ═══════════════════════════════════════════ */

// ── Dữ liệu game cards (ngụy trang thành file) ──
const GAME_FILES = [
  {
    id: "diagnostic",
    name: "Báo_cáo_kế_hoạch_Q2.docx",
    subtitle: "Chỉnh sửa lần cuối: Vừa xong",
    icon: FileText,
    iconColor: "#4285f4",
    route: "/workspace/diagnostic",
  },
  {
    id: "sheets",
    name: "Data_Phân_tích_hành_vi.xlsx",
    subtitle: "Chỉnh sửa lần cuối: 5 phút trước",
    icon: Sheet,
    iconColor: "#34a853",
    route: "/workspace/sheets",
  },
  {
    id: "decrypt",
    name: "Thống_kê_tăng_trưởng.pdf",
    subtitle: "Chỉnh sửa lần cuối: 1 giờ trước",
    icon: BarChart3,
    iconColor: "#ea4335",
    route: "/workspace/decrypt",
  },
  {
    id: "docs",
    name: "Chiến_lược_SEO_Q3.gdoc",
    subtitle: "Chỉnh sửa lần cuối: 2 giờ trước",
    icon: FileText,
    iconColor: "#4285f4",
    route: "/workspace/docs",
  },
];

// ── Sidebar folders (ngụy trang) ──
const SIDEBAR_FOLDERS = [
  { name: "Ổ đĩa của tôi", icon: HardDrive },
  { name: "Phân vùng TÂM", icon: FolderClosed },
  { name: "Phân vùng TẦM", icon: FolderClosed },
  { name: "Data TÀI", icon: FolderClosed },
  { name: "Backup TÍN", icon: FolderClosed },
];

// ── Component: Header ──
function WorkspaceHeader({
  onSearch,
}: {
  onSearch: (sessionId: string) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      onSearch(searchValue.trim());
      setSearchValue("");
    }
  };

  return (
    <header className="workspace-header">
      {/* Logo */}
      <div className="workspace-logo">
        <div className="workspace-logo-icon">
          <div className="logo-cube" />
        </div>
        <span className="workspace-logo-text">DTA Workspace</span>
      </div>

      {/* Search Bar */}
      <div className={`workspace-search ${isSearchFocused ? "focused" : ""}`}>
        <Search size={18} className="workspace-search-icon" />
        <input
          type="text"
          placeholder="🔍 Nhập mã Session ID để đồng bộ tài liệu..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchSubmit}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="workspace-search-input"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue("")}
            className="workspace-search-clear"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* User Area */}
      <div className="workspace-user">
        <button className="workspace-icon-btn" title="Cài đặt">
          <Settings size={20} />
        </button>
        <div className="workspace-avatar">
          <span>DT</span>
        </div>
      </div>
    </header>
  );
}

// ── Component: New Session Modal ──
function NewSessionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const id = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedId(id);
      setIsGenerating(false);
    }, 800);
  }, []);

  const handleCopyId = () => {
    if (generatedId) {
      navigator.clipboard.writeText(generatedId);
      toast.success("Đã sao chép Session ID!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Khởi tạo Session làm việc</h3>
          <button onClick={onClose} className="modal-close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-description">
            Tạo một phòng làm việc mới để đồng bộ tài liệu với cộng tác viên.
          </p>
          {generatedId ? (
            <div className="session-id-display">
              <span className="session-id-label">Session ID</span>
              <div className="session-id-value" onClick={handleCopyId}>
                <span>{generatedId}</span>
                <span className="session-id-copy">Nhấn để sao chép</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              className="generate-btn"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span className="generate-loading">Đang khởi tạo...</span>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Generate ID</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Component: Sidebar ──
function WorkspaceSidebar({
  onNewClick,
}: {
  onNewClick: () => void;
}) {
  const [activeFolder, setActiveFolder] = useState(0);

  return (
    <aside className="workspace-sidebar">
      <button className="sidebar-new-btn" onClick={onNewClick}>
        <Plus size={20} />
        <span>Mới</span>
      </button>

      <nav className="sidebar-nav">
        {SIDEBAR_FOLDERS.map((folder, i) => (
          <button
            key={i}
            className={`sidebar-item ${activeFolder === i ? "active" : ""}`}
            onClick={() => setActiveFolder(i)}
          >
            <folder.icon size={18} />
            <span>{folder.name}</span>
          </button>
        ))}

        <div className="sidebar-divider" />

        <button className="sidebar-item">
          <Users size={18} />
          <span>Được chia sẻ</span>
        </button>
        <button className="sidebar-item">
          <Star size={18} />
          <span>Có gắn dấu sao</span>
        </button>
        <button className="sidebar-item">
          <Trash2 size={18} />
          <span>Thùng rác</span>
        </button>
      </nav>

      <div className="sidebar-storage">
        <Cloud size={16} />
        <div className="storage-info">
          <div className="storage-bar">
            <div className="storage-bar-fill" style={{ width: "34%" }} />
          </div>
          <span className="storage-text">5.1 GB / 15 GB đã dùng</span>
        </div>
      </div>
    </aside>
  );
}

// ── Component: File Card ──
function FileCard({
  file,
  onClick,
}: {
  file: (typeof GAME_FILES)[0];
  onClick: () => void;
}) {
  const Icon = file.icon;

  return (
    <div className="file-card" onClick={onClick}>
      <div className="file-card-preview">
        <Icon size={48} style={{ color: file.iconColor }} />
      </div>
      <div className="file-card-info">
        <div className="file-card-name">
          <Icon size={16} style={{ color: file.iconColor }} />
          <span>{file.name}</span>
        </div>
        <div className="file-card-meta">
          <Clock size={12} />
          <span>{file.subtitle}</span>
          <button
            className="file-card-more"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Component: Main Content ──
function WorkspaceContent() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <main className="workspace-main">
      <div className="workspace-content-header">
        <h2>Tài liệu đang mở gần đây</h2>
        <div className="content-view-toggle">
          <button
            className={viewMode === "grid" ? "active" : ""}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 size={18} />
          </button>
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
          >
            <List size={18} />
          </button>
          <button className="content-sort-btn">
            Tên
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className={`file-grid ${viewMode}`}>
        {GAME_FILES.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onClick={() => navigate(file.route)}
          />
        ))}
      </div>
    </main>
  );
}

// ══════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ══════════════════════════════════════════
export default function WorkspaceHub() {
  const [showNewModal, setShowNewModal] = useState(false);

  const handleSearch = (sessionId: string) => {
    toast.info(`Đang kết nối tới Node ${sessionId}...`, {
      description: "Vui lòng chờ trong giây lát.",
      duration: 3000,
    });
  };

  return (
    <div className="workspace-container">
      <WorkspaceHeader onSearch={handleSearch} />
      <div className="workspace-body">
        <WorkspaceSidebar onNewClick={() => setShowNewModal(true)} />
        <WorkspaceContent />
      </div>
      <NewSessionModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
      />
    </div>
  );
}
