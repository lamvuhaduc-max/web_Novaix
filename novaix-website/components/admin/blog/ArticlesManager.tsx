"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import ArticlesTable from "./ArticlesTable";
import CategoriesTable from "./CategoriesTable";
import type { ArticleListPage } from "@/lib/blog/article-actions";
import type { CategoryRow } from "@/lib/blog/category-actions";

export default function ArticlesManager({
  initialArticles,
  categories,
}: {
  initialArticles: ArticleListPage;
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "1" ? 1 : 0);

  function handleTabChange(_: any, val: number) {
    setActiveTab(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val === 1) {
      params.set("tab", "1");
    } else {
      params.delete("tab");
    }
    router.push(`/admin/blog?${params.toString()}`);
  }

  const totalArticles = initialArticles.statusCounts
    ? initialArticles.statusCounts.all
    : initialArticles.total;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Thanh Tab Đỉnh theo Mockup */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#2563eb",
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1" fontWeight={activeTab === 0 ? 700 : 500} color={activeTab === 0 ? "#2563eb" : "text.secondary"}>
                  📄 Bài viết
                </Typography>
                <Chip
                  label={totalArticles}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    bgcolor: activeTab === 0 ? "#eff6ff" : "#f1f5f9",
                    color: activeTab === 0 ? "#2563eb" : "text.secondary",
                  }}
                />
              </Stack>
            }
            id="blog-tab-0"
            sx={{ textTransform: "none", py: 1.5, px: 2 }}
          />
          <Tab
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1" fontWeight={activeTab === 1 ? 700 : 500} color={activeTab === 1 ? "#2563eb" : "text.secondary"}>
                  🏷️ Danh mục
                </Typography>
                <Chip
                  label={categories.length}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    bgcolor: activeTab === 1 ? "#eff6ff" : "#f1f5f9",
                    color: activeTab === 1 ? "#2563eb" : "text.secondary",
                  }}
                />
              </Stack>
            }
            id="blog-tab-1"
            sx={{ textTransform: "none", py: 1.5, px: 2 }}
          />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <ArticlesTable initialData={initialArticles} categories={categories} />
      )}

      {activeTab === 1 && <CategoriesTable categories={categories} />}
    </Box>
  );
}
