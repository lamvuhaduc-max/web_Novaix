"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Stats from "./Stats";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.13, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] as const },
  }),
};

export default function Hero() {
  return (
    <header className="relative min-h-screen flex items-center pt-[68px] overflow-hidden">
      <HeroScene />
      <div className="wrap z-[3]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <motion.span custom={0} variants={fade} initial="hidden" animate="show" className="kicker">
              Nền tảng CRM · ERP cho doanh nghiệp Việt
            </motion.span>
            <motion.h1
              custom={1}
              variants={fade}
              initial="hidden"
              animate="show"
              className="font-extrabold my-[18px] mt-[22px]"
              style={{ fontSize: "clamp(40px,6vw,76px)" }}
            >
              Hệ thống hóa <span className="grad-text">toàn bộ vận hành</span> doanh nghiệp của bạn
            </motion.h1>
            <motion.p
              custom={2}
              variants={fade}
              initial="hidden"
              animate="show"
              className="text-muted max-w-[540px] mb-[30px]"
              style={{ fontSize: "clamp(16px,2vw,19px)" }}
            >
              NovAIX kết nối bán hàng, sản xuất, kho vận, nhân sự và tài chính trên một nền tảng duy
              nhất — chuẩn hóa quy trình, tự động hóa nghiệp vụ và ra quyết định bằng dữ liệu thời
              gian thực.
            </motion.p>
            <motion.div custom={3} variants={fade} initial="hidden" animate="show" className="flex gap-3.5 flex-wrap">
              <a href="#lien-he" className="btn btn-primary">Đặt lịch demo miễn phí →</a>
              <a href="#modules" className="btn btn-ghost">Khám phá module</a>
            </motion.div>
          </div>
        </div>
        <motion.div custom={4} variants={fade} initial="hidden" animate="show">
          <Stats />
        </motion.div>
      </div>
    </header>
  );
}
