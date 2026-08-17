import type { Metadata } from "next";
import HomeSections from "@/components/preview/HomeSections";
import PreviewBridge from "@/components/preview/PreviewBridge";
import { getHomeContent } from "@/lib/site-content/queries";

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const isPreview = searchParams?.preview === "1";
  if (isPreview) {
    return {
      title: "Xem trước Trang chủ · OAlpha",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  return {
    title: "OAlpha — Hệ thống hóa toàn bộ vận hành doanh nghiệp của bạn",
    description: "Nền tảng CRM · ERP cho doanh nghiệp Việt. Chuẩn hóa quy trình, tự động hóa nghiệp vụ và ra quyết định bằng dữ liệu.",
  };
}

export default async function Home({ searchParams }: Props) {
  const content = await getHomeContent();
  const isPreview = searchParams?.preview === "1";

  if (isPreview) {
    return <PreviewBridge initial={content} />;
  }

  return <HomeSections content={content} />;
}
