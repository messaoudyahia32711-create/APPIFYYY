"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, ShoppingCart, UserRound, Home, Minus, Plus, Trash2, CreditCard, Fingerprint, ChevronLeft, ChevronRight, LogOut, Package, Heart } from "lucide-react";
import { useLang } from "@/lib/appify/i18n";
import { cn } from "@/lib/utils";

export type StorePage = "home" | "shop" | "cart" | "profile";

type CartLine = { index: number; qty: number };

const PRODUCT_EMOJI = ["🎧", "⌚", "👜", "🧴", "🎽", "🔌"];
const PRODUCT_PRICES = [249, 1199, 329, 459, 189, 149];
const PRODUCT_GRADIENTS = [
  "from-[#1E3A5F] to-[#162A45]",
  "from-[#3A2E5F] to-[#2A2145]",
  "from-[#5F2E4A] to-[#452136]",
  "from-[#5F4A2E] to-[#453621]",
  "from-[#2E5F4A] to-[#214536]",
  "from-[#2E4A5F] to-[#21455A]",
];

export function SampleStore({
  page,
  onNavigate,
  onBridge,
  appBg,
  signedIn,
  onSignIn,
  siteUser,
}: {
  page: StorePage;
  onNavigate: (page: StorePage) => void;
  onBridge: (method: string) => void;
  appBg?: string;
  signedIn: boolean;
  onSignIn: (name: string | null) => void;
  siteUser?: { name: string; email: string } | null;
}) {
  const { d, lang } = useLang();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState("");
  const [paid, setPaid] = useState(false);

  const cartCount = cart.reduce((a, l) => a + l.qty, 0);
  const total = cart.reduce((a, l) => a + PRODUCT_PRICES[l.index] * l.qty, 0);
  const ArrowBack = lang === "ar" ? ChevronRight : ChevronLeft;
  // the demo store is linked to the site-level Google account when one exists
  const storeUser = siteUser
    ? { name: siteUser.name, email: siteUser.email }
    : { name: lang === "ar" ? "سارة" : "Sara", email: "sara@example.com" };

  const addToCart = (index: number) => {
    setCart((c) => {
      const found = c.find((l) => l.index === index);
      if (found) return c.map((l) => (l.index === index ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { index, qty: 1 }];
    });
    onBridge("cartAdd");
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return d.store.products.map((p, i) => ({ ...p, i }));
    return d.store.products
      .map((p, i) => ({ ...p, i }))
      .filter((p) => p.name.includes(query.trim()));
  }, [query, d]);

  const headerBtn = "flex size-8 items-center justify-center rounded-full bg-black/6 text-gray-800";

  return (
    <div className="appify-store-root flex h-full flex-col overflow-hidden" style={{ background: appBg || "#F7F8FA" }}>
      {/* app header */}
      <div className="flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          {page !== "home" && (
            <button onClick={() => onNavigate("home")} className={headerBtn} aria-label="back">
              <ArrowBack className="size-4" />
            </button>
          )}
          <span className="font-display text-sm font-extrabold text-gray-900">{d.store.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onNavigate("shop")} className={headerBtn} aria-label="search">
            <Search className="size-4" />
          </button>
          <button onClick={() => onNavigate("cart")} className={cn(headerBtn, "relative")} aria-label="cart">
            <ShoppingCart className="size-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -end-1 flex size-4.5 items-center justify-center rounded-full bg-[#6D28D9] text-[9px] font-extrabold text-white" dir="ltr">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* ================= HOME ================= */}
        {page === "home" && (
          <div className="p-3.5">
            <div className="demo-hero rounded-2xl bg-gradient-to-br from-[#0A0A0B] to-[#1A1A2E] p-4 text-white">
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                {d.store.badgeSale}
              </span>
              <h2 className="mt-2 font-display text-lg font-extrabold leading-snug">{d.store.heroTitle}</h2>
              <p className="mt-1 text-xs text-white/70">{d.store.heroSub}</p>
              <button
                onClick={() => onNavigate("shop")}
                className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-white"
              >
                {d.store.shopNow}
              </button>
            </div>

            <div className="mt-3.5 grid grid-cols-4 gap-2">
              {d.store.categories.map((c, i) => (
                <button key={c} onClick={() => onNavigate("shop")} className="flex flex-col items-center gap-1.5 rounded-xl bg-white px-1 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <span className={cn("flex size-9 items-center justify-center rounded-full text-base", PRODUCT_GRADIENTS[i], "bg-gradient-to-br")} aria-hidden="true">
                    {PRODUCT_EMOJI[i]}
                  </span>
                  <span className="text-[10px] font-bold text-gray-700">{c}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-extrabold text-gray-900">{d.store.featured}</h3>
              <button onClick={() => onNavigate("shop")} className="text-xs font-bold text-primary">
                {d.store.shopNow} →
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {d.store.products.slice(0, 2).map((p, i) => (
                <ProductCard key={p.name} p={p} i={i} onAdd={() => addToCart(i)} compact />
              ))}
            </div>

            <div className="demo-footer mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/70 px-3 py-2.5 text-[10px] font-bold text-gray-500">
              © {d.store.name} — Appify
            </div>
          </div>
        )}

        {/* ================= SHOP ================= */}
        {page === "shop" && (
          <div className="p-3.5">
            <div className="relative">
              <Search className="absolute top-1/2 size-4 -translate-y-1/2 text-gray-400 start-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={d.store.searchPh}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white ps-9 pe-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#6D28D9]"
              />
            </div>
            {filtered.length === 0 ? (
              <p className="mt-8 text-center text-sm text-gray-500">{d.store.noResults}</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {filtered.map((p) => (
                  <ProductCard key={p.name} p={p} i={p.i} onAdd={() => addToCart(p.i)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= CART ================= */}
        {page === "cart" && (
          <div className="p-3.5">
            <h3 className="font-display text-sm font-extrabold text-gray-900">{d.store.cart}</h3>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center gap-2.5 py-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm" aria-hidden="true">🛒</span>
                <p className="text-sm text-gray-500">{d.store.cartEmpty}</p>
                <button onClick={() => onNavigate("shop")} className="rounded-xl bg-[#6D28D9] px-4 py-2 text-xs font-extrabold text-white">
                  {d.store.shopNow}
                </button>
              </div>
            ) : (
              <>
                <div className="mt-2.5 space-y-2">
                  {cart.map((l) => {
                    const p = d.store.products[l.index];
                    return (
                      <div key={l.index} className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                        <span className={cn("flex size-11 items-center justify-center rounded-lg text-lg", PRODUCT_GRADIENTS[l.index], "bg-gradient-to-br")} aria-hidden="true">
                          {PRODUCT_EMOJI[l.index]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-bold text-gray-900">{p.name}</div>
                          <div className="text-[11px] font-bold text-primary" dir="ltr">{p.price}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCart((c) => c.map((x) => (x.index === l.index ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))}
                            className="flex size-6 items-center justify-center rounded-md bg-gray-100 text-gray-700"
                            aria-label="minus"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-extrabold text-gray-900" dir="ltr">{l.qty}</span>
                          <button
                            onClick={() => setCart((c) => c.map((x) => (x.index === l.index ? { ...x, qty: x.qty + 1 } : x)))}
                            className="flex size-6 items-center justify-center rounded-md bg-gray-100 text-gray-700"
                            aria-label="plus"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => setCart((c) => c.filter((x) => x.index !== l.index))}
                          className="text-gray-300 hover:text-red-500"
                          aria-label="remove"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3.5 rounded-xl bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{d.store.total}</span>
                    <span className="font-display text-lg font-extrabold text-gray-900" dir="ltr">{total} {lang === "ar" ? "ر.س" : "SAR"}</span>
                  </div>
                  {paid ? (
                    <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2.5 text-center text-xs font-extrabold text-primary">
                      ✓ {d.store.payOk} — {d.store.orderPlaced}
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          onBridge("biometric");
                          setTimeout(() => setPaid(true), 1200);
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0A0A0B] py-2.5 text-xs font-extrabold text-white"
                      >
                        <Fingerprint className="size-4 text-primary" />
                        {d.store.payBiometric}
                      </button>
                      <button
                        onClick={() => {
                          onBridge("cartPay");
                          setTimeout(() => setPaid(true), 900);
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-extrabold text-gray-800"
                      >
                        <CreditCard className="size-4" />
                        {d.store.payCard}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= PROFILE ================= */}
        {page === "profile" && (
          <div className="p-3.5">
            <h3 className="font-display text-sm font-extrabold text-gray-900">{d.store.profile}</h3>
            {!signedIn ? (
              <div className="mt-3 space-y-2.5">
                <div className="rounded-2xl bg-white p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gray-100" aria-hidden="true">
                    <UserRound className="size-7 text-gray-400" />
                  </span>
                  <p className="mt-2.5 text-sm font-bold text-gray-900">{d.store.signIn}</p>
                </div>
                <button
                  onClick={() => {
                    onBridge("google");
                    setTimeout(() => onSignIn(storeUser.email), 1100);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-800 shadow-sm"
                >
                  <GoogleGlyph />
                  {d.store.signInGoogle}
                </button>
                <button
                  onClick={() => {
                    onBridge("apple");
                    setTimeout(() => onSignIn("sara@icloud.com"), 1100);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-bold text-white"
                >
                  <AppleGlyph />
                  {d.store.signInApple}
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] font-display text-base font-extrabold text-white" aria-hidden="true">
                    {storeUser.name.trim()?.[0]?.toUpperCase() ?? "S"}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-gray-900">{storeUser.name}</div>
                    <div className="truncate text-[11px] text-gray-500">{d.store.signedAs} {storeUser.email}</div>
                  </div>
                  <button onClick={() => onSignIn(null)} className="ms-auto text-gray-300 hover:text-red-500" aria-label="logout">
                    <LogOut className="size-4" />
                  </button>
                </div>
                <div className="rounded-2xl bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Package className="size-4 text-primary" />
                    {d.store.orders}
                  </div>
                  <div className="mt-2.5 space-y-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={cn("flex size-8 items-center justify-center rounded-lg text-sm", PRODUCT_GRADIENTS[i], "bg-gradient-to-br")} aria-hidden="true">
                            {PRODUCT_EMOJI[i]}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-gray-800">{d.store.products[i].name}</div>
                            <div className="text-[10px] text-gray-400" dir="ltr">#{4821 - i}</div>
                          </div>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                          {i === 0 ? "✓" : "🚚"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white p-3.5 text-sm font-bold text-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                  <Heart className="size-4 text-primary" />
                  {d.store.wishlist}
                  <span className="ms-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs" dir="ltr">3</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ p, i, onAdd, compact }: { p: { name: string; price: string }; i: number; onAdd: () => void; compact?: boolean }) {
  const { d } = useLang();
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className={cn("relative flex items-center justify-center bg-gradient-to-br", PRODUCT_GRADIENTS[i % PRODUCT_GRADIENTS.length], compact ? "h-20" : "h-24")}>
        <span className={compact ? "text-3xl" : "text-4xl"} aria-hidden="true">{PRODUCT_EMOJI[i % PRODUCT_EMOJI.length]}</span>
        {i === 1 && (
          <span className="absolute top-1.5 start-1.5 rounded-full bg-[#FF5F57] px-1.5 py-0.5 text-[8px] font-extrabold text-white">
            {d.store.badgeSale}
          </span>
        )}
        {i === 5 && (
          <span className="absolute top-1.5 start-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-extrabold text-white">
            {d.store.badgeNew}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <div className="truncate text-xs font-bold text-gray-900">{p.name}</div>
        <div className="mt-0.5 text-[11px] font-extrabold text-primary" dir="ltr">{p.price}</div>
        <button
          onClick={onAdd}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-[#0A0A0B] py-1.5 text-[10px] font-extrabold text-white transition-transform active:scale-95"
        >
          <ShoppingBag className="size-3" />
          {d.store.addCart}
        </button>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853" />
      <path d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
