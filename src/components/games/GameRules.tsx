import { useState } from "react";
import { X, BookOpen, ChevronRight, Zap, Target, Clock, Users, Shield } from "lucide-react";

/* ═══════════════════════════════════════════
   GameRules — Modal hướng dẫn chơi
   Ngụy trang: "System Documentation"
   ═══════════════════════════════════════════ */

export type GameType = "battleship" | "caro" | "wordchain" | "hangman";

interface GameRulesProps {
  gameType: GameType;
  isOpen: boolean;
  onClose: () => void;
}

interface RuleSection {
  icon: React.ReactNode;
  title: string;
  items: string[];
}

// ── Dữ liệu luật chơi từng game (ngụy trang) ──
const GAME_RULES: Record<GameType, { title: string; description: string; sections: RuleSection[] }> = {
  battleship: {
    title: "Network Diagnostics Protocol — User Guide",
    description: "Hướng dẫn sử dụng công cụ quét xung đột máy chủ trong mạng nội bộ.",
    sections: [
      {
        icon: <Target size={16} />,
        title: "Giai đoạn 1: Cấu hình Cluster (Đặt tàu)",
        items: [
          "Bạn có 5 cụm máy chủ cần đặt lên lưới: Carrier (5 ô), Battleship (4 ô), Cruiser (3 ô), Submarine (3 ô), Destroyer (2 ô).",
          "Click vào lưới bên trái (Local Cluster) để đặt. Nhấn chuột phải hoặc nút xoay để đổi chiều ngang/dọc.",
          "Các cụm KHÔNG được chồng lấn lên nhau và phải nằm trong lưới.",
          "Khi đặt xong tất cả → nhấn 'Triển khai' để bắt đầu.",
        ],
      },
      {
        icon: <Zap size={16} />,
        title: "Giai đoạn 2: Quét hệ thống (Bắn)",
        items: [
          "Hai bên LUÂN PHIÊN gửi lệnh Ping tới lưới đối phương.",
          "Click vào ô trên lưới 'Remote Target' để bắn.",
          "Kết quả: '200 OK' = trượt (Miss), '500 ERROR' = trúng (Hit).",
          "Khi toàn bộ ô của 1 cụm bị trúng → cụm đó bị 'Shutdown' (chìm).",
        ],
      },
      {
        icon: <Shield size={16} />,
        title: "Điều kiện thắng",
        items: [
          "Ai phá hủy hết 5 cụm máy chủ của đối phương TRƯỚC sẽ thắng.",
          "Phím tắt: Esc hoặc Ctrl+Space để ẩn giao diện (Boss Key).",
        ],
      },
    ],
  },
  caro: {
    title: "DTA Sheets — Hướng dẫn nhập liệu",
    description: "Quy trình nhập và đồng bộ dữ liệu trên bảng tính DTA Sheets.",
    sections: [
      {
        icon: <Target size={16} />,
        title: "Cách chơi",
        items: [
          "Hai người chơi luân phiên click vào ô trống trên lưới 15×15.",
          "Người 1 đánh sẽ hiện [DONE] (xanh), Người 2 hiện [PENDING] (vàng).",
          "Mỗi lượt có GIỚI HẠN THỜI GIAN. Hết giờ = mất lượt.",
        ],
      },
      {
        icon: <Zap size={16} />,
        title: "Điều kiện thắng",
        items: [
          "Ai tạo được ĐÚNG 5 ô liên tiếp (ngang, dọc, hoặc chéo) sẽ thắng.",
          "Lưu ý: 6 ô liên tiếp trở lên KHÔNG tính thắng (luật Overline).",
          "Nếu lưới đầy mà không ai thắng → Hòa.",
        ],
      },
      {
        icon: <Clock size={16} />,
        title: "Thời gian & Phím tắt",
        items: [
          "Mỗi lượt có 30 giây để suy nghĩ.",
          "Nhấn Esc để bật Boss Key (ẩn bàn cờ).",
          "Nút 'Làm mới dữ liệu' để chơi ván mới.",
        ],
      },
    ],
  },
  wordchain: {
    title: "DTA Docs — Quy trình nhập Keywords SEO",
    description: "Hướng dẫn quy trình nối từ khóa SEO theo chuẩn chuỗi ngữ nghĩa.",
    sections: [
      {
        icon: <Target size={16} />,
        title: "Luật chơi cơ bản",
        items: [
          "Dùng TỪ GHÉP 2 ÂM TIẾT tiếng Việt (VD: 'học tập', 'tập thể', 'thể dục').",
          "Người sau phải dùng ÂM TIẾT CUỐI của từ trước làm ÂM TIẾT ĐẦU từ mới.",
          "VD: 'hạnh phúc' → 'phúc lợi' → 'lợi ích' → 'ích kỷ' → ...",
          "Từ phải CÓ NGHĨA trong tiếng Việt. Hệ thống sẽ kiểm tra tự động.",
        ],
      },
      {
        icon: <Clock size={16} />,
        title: "Thời gian & Lượt chơi",
        items: [
          "Mỗi lượt có 15 GIÂY để nhập từ.",
          "Hết giờ mà chưa nhập → TỰ ĐỘNG THUA.",
          "Hai người chơi LUÂN PHIÊN, chỉ người đến lượt mới gõ được.",
          "Từ đã dùng KHÔNG ĐƯỢC lặp lại.",
        ],
      },
      {
        icon: <Users size={16} />,
        title: "Multiplayer",
        items: [
          "Tạo phòng để nhận Session ID 4 chữ số.",
          "Gửi mã cho đối thủ để họ nhập vào và join phòng.",
          "Cả hai nhấn 'Sẵn sàng' → Game bắt đầu tự động.",
        ],
      },
      {
        icon: <Shield size={16} />,
        title: "Kiểm chứng từ",
        items: [
          "Hệ thống sử dụng từ điển tiếng Việt để kiểm tra.",
          "Từ sai sẽ bị gạch chân đỏ + hiện cảnh báo trong Comments.",
          "Từ sai = mất lượt ngay lập tức.",
          "Nhấn Esc để bật Boss Key (ẩn game).",
        ],
      },
    ],
  },
  hangman: {
    title: "DTA-NODE — Decryption Protocol Manual",
    description: "Hướng dẫn sử dụng công cụ giải mã dữ liệu bảo mật.",
    sections: [
      {
        icon: <Target size={16} />,
        title: "Cách chơi",
        items: [
          "Một từ khóa bí mật được mã hóa thành [ * * * * * ].",
          "Bạn đoán từng chữ cái bằng bàn phím ảo hoặc phím vật lý.",
          "Đoán đúng → chữ cái được giải mã (sáng xanh).",
          "Đoán sai → thanh Corruption tăng lên (nút đỏ).",
          "Bạn cũng có thể đoán CẢ TỪ bất cứ lúc nào.",
        ],
      },
      {
        icon: <Zap size={16} />,
        title: "Điều kiện thắng/thua",
        items: [
          "THẮNG: Giải mã toàn bộ từ khóa trước khi Corruption đạt 100%.",
          "THUA: Corruption đạt 100% (tối đa 6 lần đoán sai).",
          "Có thể chọn CHỦ ĐỀ: Công nghệ, Động vật, Quốc gia...",
        ],
      },
      {
        icon: <Users size={16} />,
        title: "Chế độ Multiplayer",
        items: [
          "HOST: Chọn hoặc nhập từ bí mật cho đối thủ đoán.",
          "GUESSER: Đoán từ mà Host đã đặt.",
          "Sau mỗi ván, vai trò sẽ đổi ngược lại.",
          "Nhấn Esc để bật Boss Key (hiện màn hình Updating System).",
        ],
      },
    ],
  },
};

export function GameRules({ gameType, isOpen, onClose }: GameRulesProps) {
  const [expandedSection, setExpandedSection] = useState<number>(0);

  if (!isOpen) return null;

  const rules = GAME_RULES[gameType];

  return (
    <div className="rules-overlay" onClick={onClose}>
      <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rules-header">
          <div className="rules-header-left">
            <BookOpen size={18} />
            <span>{rules.title}</span>
          </div>
          <button className="rules-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        <p className="rules-description">{rules.description}</p>

        {/* Sections */}
        <div className="rules-sections">
          {rules.sections.map((section, i) => (
            <div
              key={i}
              className={`rules-section ${expandedSection === i ? "expanded" : ""}`}
            >
              <button
                className="rules-section-header"
                onClick={() => setExpandedSection(expandedSection === i ? -1 : i)}
              >
                {section.icon}
                <span>{section.title}</span>
                <ChevronRight
                  size={14}
                  className={`rules-chevron ${expandedSection === i ? "rotated" : ""}`}
                />
              </button>
              {expandedSection === i && (
                <ul className="rules-items">
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="rules-footer">
          <button className="rules-start-btn" onClick={onClose}>
            Đã hiểu, bắt đầu
          </button>
        </div>
      </div>
    </div>
  );
}
