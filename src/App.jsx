import { useMemo, useRef, useState } from 'react'
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Wallet,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Trash2,
  Calendar,
  CheckCircle2,
} from 'lucide-react'

// --- Configuration & Constants ---
const CATEGORIES = {
  income: ['เงินเดือน', 'โบนัส', 'รายได้เสริม', 'อื่นๆ'],
  expense: [
    'อาหาร/ของใช้ (CJ, ตลาด)',
    'ที่อยู่อาศัย (บ้าน/คอนโด)',
    'เดินทาง (น้ำมัน, รถไฟฟ้า)',
    'หนี้สิน/บัตร (KTC, T1, กยศ)',
    'ช้อปปิ้ง/ส่วนตัว (Shopee, ไอแพด)',
    'สาธารณูปโภค (น้ำ, ไฟ, เน็ต)',
    'ครอบครัว/สัตว์เลี้ยง (พ่อแม่, อาหารแมว)',
    'การศึกษา (ค่าเทอม)',
    'สุขภาพ (ทำฟัน, ยา)',
    'อื่นๆ',
  ],
}

const INITIAL_TRANSACTIONS = [
  {
    id: '1',
    date: '2024-05-01',
    type: 'income',
    category: 'เงินเดือน',
    amount: 35774.0,
    note: 'รายรับเดือน พ.ค.',
  },
  {
    id: '2',
    date: '2024-05-02',
    type: 'expense',
    category: 'ช้อปปิ้ง/ส่วนตัว (Shopee, ไอแพด)',
    amount: 2457.26,
    note: 'Shopee',
  },
  {
    id: '3',
    date: '2024-05-03',
    type: 'expense',
    category: 'หนี้สิน/บัตร (KTC, T1, กยศ)',
    amount: 3799.0,
    note: 'KTC',
  },
  {
    id: '4',
    date: '2024-05-04',
    type: 'expense',
    category: 'หนี้สิน/บัตร (KTC, T1, กยศ)',
    amount: 1799.0,
    note: 'T1',
  },
  {
    id: '5',
    date: '2024-05-05',
    type: 'expense',
    category: 'ที่อยู่อาศัย (บ้าน/คอนโด)',
    amount: 17000.0,
    note: 'ค่าบ้าน',
  },
  {
    id: '6',
    date: '2024-05-05',
    type: 'expense',
    category: 'ที่อยู่อาศัย (บ้าน/คอนโด)',
    amount: 6000.0,
    note: 'ค่าคอนโด',
  },
]

// --- Decorative Components ---
const WatercolorBlob = ({ className }) => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ mixBlendMode: 'multiply', filter: 'blur(3px)' }}
  >
    <path
      fill="#BA343B"
      fillOpacity="0.08"
      d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-45.8C90.8,-32.5,96.8,-16.3,95.5,-0.7C94.2,14.8,85.6,29.7,75.4,42.4C65.2,55.1,53.4,65.6,40.1,73.1C26.8,80.6,13.4,85.1,-0.5,86C-14.4,86.9,-28.8,84.1,-41.8,76.8C-54.8,69.5,-66.4,57.7,-74.6,43.7C-82.8,29.7,-87.6,13.4,-86.3,-2.3C-85,-18,-77.6,-33.1,-67.6,-45.1C-57.6,-57.1,-45,-66,-31.6,-73.2C-18.2,-80.4,-4.1,-85.9,10.6,-84.3C25.3,-82.7,40.1,-74.1,44.7,-76.4Z"
      transform="translate(100 100)"
    />
    <path
      fill="#BA343B"
      fillOpacity="0.05"
      d="M51.1,-63.9C65.8,-53.4,77,-37.2,80.7,-20.1C84.4,-3,80.5,15.1,72.2,30.7C63.9,46.3,51.1,59.4,36.5,67.6C21.9,75.8,5.4,79.1,-10.8,77.2C-26.9,75.3,-42.7,68.2,-55.8,57.2C-68.9,46.2,-79.3,31.2,-83.1,14.7C-86.9,-1.8,-84,-19.7,-74.7,-33.5C-65.4,-47.3,-49.7,-57.1,-34.2,-61.2C-18.7,-65.4,-3.4,-63.8,11.9,-61C27.2,-58.1,42.5,-54.1,51.1,-63.9Z"
      transform="translate(100 100) scale(0.9) rotate(45)"
    />
  </svg>
)

export default function App() {
  // --- State ---
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS)
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 4))
  const todayIso = new Date().toISOString().split('T')[0]

  // Smart Defaults State
  const [lastCategories, setLastCategories] = useState({
    income: CATEGORIES.income[0],
    expense: CATEGORIES.expense[0],
  })

  // Form State
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: CATEGORIES.expense[0],
    date: todayIso,
    note: '',
  })

  // Animation & UX State
  const [deletingId, setDeletingId] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const amountInputRef = useRef(null)

  // --- Handlers ---
  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category: lastCategories[type],
    }))
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleQuickAdd = (value) => {
    setFormData((prev) => ({
      ...prev,
      amount: String((Number(prev.amount) || 0) + value),
    }))
    amountInputRef.current?.focus()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!formData.amount || Number.isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      return
    }

    const newTransaction = {
      id: Date.now().toString(),
      ...formData,
      amount: Number(formData.amount),
    }

    // Update smart defaults
    setLastCategories((prev) => ({
      ...prev,
      [formData.type]: formData.category,
    }))

    setTransactions((prev) =>
      [newTransaction, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)),
    )

    // UX Feedback - Added Emotional Micro Delight
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)

    // Reset form smoothly
    setFormData((prev) => ({ ...prev, amount: '', note: '' }))
    amountInputRef.current?.focus()
  }

  const handleDelete = (id) => {
    setDeletingId(id)
    setTimeout(() => {
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
      setDeletingId(null)
    }, 300)
  }

  const changeMonth = (offset) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + offset)
      return newDate
    })
  }

  // --- Derived Data ---
  const filteredTransactions = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0')
    const prefix = `${year}-${month}`
    return transactions.filter((transaction) => transaction.date.startsWith(prefix))
  }, [transactions, currentMonth])

  const { totalIncome, totalExpense } = useMemo(
    () =>
      filteredTransactions.reduce(
        (acc, curr) => {
          if (curr.type === 'income') acc.totalIncome += curr.amount
          else acc.totalExpense += curr.amount
          return acc
        },
        { totalIncome: 0, totalExpense: 0 },
      ),
    [filteredTransactions],
  )

  const balance = totalIncome - totalExpense

  const expensesByCategory = useMemo(() => {
    const expenses = filteredTransactions.filter((transaction) => transaction.type === 'expense')
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredTransactions])

  // --- Formatters & Helpers ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(
      amount,
    )

  const monthNames = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ]

  // High contrast expense bar colors (Strictly semantic)
  const barColors = ['#BA343B', '#d96b6b', '#f0a3a7']

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#f2e6b1]/40 font-sans text-gray-700 pb-20 relative overflow-hidden">
      {/* Global Background Watercolor Decor */}
      <div className="fixed -top-20 -right-20 w-[500px] h-[500px] pointer-events-none -z-10">
        <WatercolorBlob className="w-full h-full" />
      </div>

      {/* Global Styles for Micro-interactions */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .row-enter { animation: fadeSlideIn 0.3s ease-out forwards; }

        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .success-pop { animation: pop 0.4s ease; }
      `}</style>

      {/* Header - Softened */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[var(--paper)] sticky top-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <Wallet className="w-6 h-6 text-[var(--berry)]" />
            <h1 className="text-xl font-semibold tracking-tight">MoneyMate</h1>
          </div>

          <div className="flex items-center gap-3 bg-[var(--paper)] rounded-full px-3 py-1.5 border border-[var(--paper-soft)]">
            <button
              onClick={() => changeMonth(-1)}
              className="text-[#ba343b]/60 hover:text-[var(--berry)] transition-colors p-1"
              aria-label="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold min-w-[100px] text-center text-gray-700">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="text-[#ba343b]/60 hover:text-[var(--berry)] transition-colors p-1"
              aria-label="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* KPI Section: Friendly Visual Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* HERO: Balance - Brand Signature Background */}
          <div className="md:col-span-6 lg:col-span-8 bg-gradient-to-br from-[var(--paper)] to-[var(--paper-soft)] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#f2e6b1]/60 flex flex-col justify-center relative overflow-hidden">
            {/* Subtle radial texture */}
            <div
              className="absolute inset-0 opacity-[0.15] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #BA343B22 0%, transparent 40%)' }}
            />
            {/* Corner Watercolor Decor */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 pointer-events-none">
              <WatercolorBlob className="w-full h-full" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#ba343b]/60 mb-2">
                <CreditCard className="w-5 h-5 text-[#ba343b]/60" />
                <span className="text-sm font-medium">ยอดเงินคงเหลือ</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl text-gray-400 font-medium">฿</span>
                {/* Red only if negative */}
                <span
                  className={`text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight ${
                    balance >= 0 ? 'text-gray-800' : 'text-[var(--berry)]'
                  }`}
                >
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>

          {/* SECONDARY: Income & Expense - Soft Shadows */}
          <div className="md:col-span-6 lg:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.03)] border border-[#f2e6b1]/60 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium">รายรับรวม</span>
              </div>
              <span className="text-xl font-semibold text-gray-700">฿ {formatCurrency(totalIncome)}</span>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.03)] border border-[#f2e6b1]/60 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <TrendingDown className="w-4 h-4 text-[var(--berry)]" />
                <span className="text-xs font-medium">รายจ่ายรวม</span>
              </div>
              <span className="text-xl font-semibold text-gray-700">฿ {formatCurrency(totalExpense)}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-[var(--paper-soft)] lg:sticky lg:top-20 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50 relative z-10">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                  <PlusCircle className="w-5 h-5 text-[#ba343b]/60" />
                  บันทึกรายการ
                </h2>
                {/* Success Feedback - Emotional Copy & Animation */}
                {showSuccess && (
                  <div className="success-pop absolute right-0 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--berry)] bg-[#f2e6b1]/80 px-3 py-1.5 rounded-full border border-[var(--paper-soft)]">
                    <CheckCircle2 className="w-4 h-4" /> บันทึกเรียบร้อยแล้ว 💖
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {/* Type Selection (Tabs) */}
                <div className="flex bg-[#f2e6b1]/30 rounded-2xl p-1 border border-[#f2e6b1]/50">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                      formData.type === 'expense'
                        ? 'bg-white shadow-sm text-[var(--berry)]'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    รายจ่าย
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                      formData.type === 'income'
                        ? 'bg-white shadow-sm text-green-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    รายรับ
                  </button>
                </div>

                {/* Amount with Quick Add */}
                <div>
                  <div className="relative">
                    <input
                      ref={amountInputRef}
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full pl-4 pr-12 py-4 bg-[var(--paper)] border border-[var(--paper-soft)] rounded-2xl focus:ring-4 focus:ring-[#f2e6b1]/60 focus:border-[var(--paper-soft)] outline-none transition-all text-2xl font-semibold text-gray-700 placeholder-gray-300"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">THB</span>
                  </div>
                  {/* Quick Action Buttons - Playful & Elegant */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[100, 500, 1000].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleQuickAdd(value)}
                        className="py-2 text-xs font-semibold bg-white border border-[var(--paper-soft)] hover:bg-[#f2e6b1]/50 text-[var(--berry)] rounded-xl transition-all hover:scale-[1.03] active:scale-95"
                      >
                        +{value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    หมวดหมู่
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[var(--paper)] border border-[var(--paper-soft)] rounded-2xl focus:ring-4 focus:ring-[#f2e6b1]/60 focus:border-[var(--paper-soft)] outline-none appearance-none text-gray-700 font-medium transition-all"
                  >
                    {CATEGORIES[formData.type].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note & Date (Compact) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                      รายละเอียด
                    </label>
                    <input
                      type="text"
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="โน้ตช่วยจำ"
                      className="w-full px-4 py-3 bg-[var(--paper)] border border-[var(--paper-soft)] rounded-2xl focus:ring-4 focus:ring-[#f2e6b1]/60 focus:border-[var(--paper-soft)] outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                      วันที่
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-2 py-3 bg-[var(--paper)] border border-[var(--paper-soft)] rounded-2xl focus:ring-4 focus:ring-[#f2e6b1]/60 focus:border-[var(--paper-soft)] outline-none appearance-none text-sm transition-all"
                        required
                      />
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Submit Action - Goji Berry glow and active scale */}
                <button
                  type="submit"
                  className={`w-full py-4 text-white rounded-2xl font-semibold tracking-wide transition-all duration-200 active:scale-95 mt-2 ${
                    formData.type === 'income'
                      ? 'bg-green-500 hover:bg-green-600 shadow-[0_8px_20px_rgba(34,197,94,0.25)]'
                      : 'bg-[var(--berry)] hover:bg-[var(--berry-deep)] shadow-[0_8px_20px_rgba(186,52,59,0.25)]'
                  }`}
                >
                  บันทึก{formData.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Dashboard & List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Expense Breakdown */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-[#f2e6b1]/80">
              <h2 className="text-base font-semibold mb-5 flex items-center gap-2 text-gray-700">
                สัดส่วนค่าใช้จ่ายเดือนนี้
              </h2>

              {expensesByCategory.length > 0 ? (
                <div className="space-y-4">
                  {expensesByCategory.map((item, index) => {
                    const percentage = ((item.value / totalExpense) * 100).toFixed(1)
                    const color = barColors[index % barColors.length]
                    return (
                      <div key={item.name} className="group">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-gray-500 truncate pr-4 group-hover:text-gray-700 transition-colors">
                            {item.name}
                          </span>
                          <div className="text-right flex flex-col sm:flex-row sm:items-center sm:gap-3">
                            <span className="text-xs text-gray-400 w-10 text-right">{percentage}%</span>
                            <span className="font-semibold text-gray-700 whitespace-nowrap min-w-[80px]">
                              ฿ {formatCurrency(item.value)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-[#f2e6b1]/60 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%`, backgroundColor: color }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 bg-[var(--paper)] rounded-2xl border border-dashed border-[var(--paper-soft)]">
                  <p className="text-sm">ยังไม่มีรายจ่ายเดือนนี้เลยนะ 🌼</p>
                </div>
              )}
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-[#f2e6b1]/80 overflow-hidden relative">
              <div className="p-6 pb-0 border-b border-gray-50/50 mb-2 relative z-10">
                <h2 className="text-base font-semibold pb-4 flex items-center gap-2 text-gray-700">
                  รายการทั้งหมด
                </h2>
              </div>

              {/* Mobile Card List */}
              <div className="sm:hidden px-4 pb-5 space-y-3 relative z-10">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`row-enter rounded-2xl border border-[#f2e6b1]/60 bg-[var(--paper)] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all ${
                        deletingId === transaction.id ? 'opacity-0 translate-x-4' : 'opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-700 truncate">
                            {transaction.note || transaction.category}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {transaction.category}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(transaction.date).toLocaleDateString('th-TH', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-base font-semibold tabular-nums whitespace-nowrap ${
                              transaction.type === 'income' ? 'text-green-500' : 'text-gray-700'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="mt-2 inline-flex items-center justify-center p-2 text-gray-300 hover:text-[var(--berry)] hover:bg-[#ba343b]/10 rounded-xl transition-all"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-[#ba343b]/60 bg-[var(--paper)] rounded-2xl border border-dashed border-[var(--paper-soft)]">
                    <span className="text-sm">ลองเพิ่มรายการแรกกันเลย ✨</span>
                  </div>
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto relative z-10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left font-medium text-gray-400 border-b border-gray-50">
                      <th className="pb-3 pt-2 px-6 font-medium">วันที่</th>
                      <th className="pb-3 pt-2 px-6 font-medium">รายการ</th>
                      <th className="pb-3 pt-2 px-6 font-medium hidden sm:table-cell">หมวดหมู่</th>
                      <th className="pb-3 pt-2 px-6 font-medium text-right">จำนวนเงิน</th>
                      <th className="pb-3 pt-2 px-6 font-medium text-center w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2e6b1]/30">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className={`group row-enter hover:bg-[#f2e6b1]/40 transition-all duration-300 ease-in-out ${
                            deletingId === transaction.id ? 'opacity-0 translate-x-8' : 'opacity-100'
                          }`}
                        >
                          <td className="py-4 px-6 text-gray-400 whitespace-nowrap tabular-nums">
                            {new Date(transaction.date).toLocaleDateString('th-TH', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold text-gray-700">
                              {transaction.note || transaction.category}
                            </p>
                            <p className="text-xs text-gray-400 sm:hidden mt-1">{transaction.category}</p>
                          </td>
                          <td className="py-4 px-6 text-gray-500 hidden sm:table-cell">
                            {/* Premium Pill Style */}
                            <span className="bg-[#f2e6b1]/70 text-[var(--berry)] px-3 py-1 rounded-full text-xs font-medium">
                              {transaction.category}
                            </span>
                          </td>
                          <td
                            className={`py-4 px-6 text-right font-semibold tabular-nums whitespace-nowrap ${
                              transaction.type === 'income' ? 'text-green-500' : 'text-gray-700'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="p-2 text-gray-300 hover:text-[var(--berry)] hover:bg-[#ba343b]/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-[#ba343b]/60 bg-[var(--paper)]">
                          <span className="text-sm">ลองเพิ่มรายการแรกกันเลย ✨</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
