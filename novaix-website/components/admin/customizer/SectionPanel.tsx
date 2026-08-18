"use client";

import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  IconArrowDown,
  IconArrowUp,
  IconBolt,
  IconBuilding,
  IconCash,
  IconChecklist,
  IconChevronDown,
  IconHelpCircle,
  IconLayoutBottombar,
  IconMail,
  IconMenu2,
  IconMessageCircle,
  IconNavigation,
  IconNews,
  IconPackage,
  IconBuildingStore,
  IconRocket,

  IconRotate,
  IconRoute,
  IconSparkles,
  IconSpeakerphone,
  IconUsers,
} from "@tabler/icons-react";
import AboutSection from "./AboutSection";
import ArticlesSection from "./ArticlesSection";
import CTASection from "./CTASection";

import FAQSection from "./FAQSection";
import FeaturesSection from "./FeaturesSection";
import FieldInput from "./FieldInput";
import FooterSection from "./FooterSection";
import HeroSection from "./HeroSection";
import ListField from "./ListField";
import MarqueeSection from "./MarqueeSection";
import ModulesSection from "./ModulesSection";
import NavSection from "./NavSection";
import PartnersSection from "./PartnersSection";
import PricingSection from "./PricingSection";
import ProcessSection from "./ProcessSection";
import SegmentsSection from "./SegmentsSection";
import TestimonialsSection from "./TestimonialsSection";
import ThemeSection from "./ThemeSection";
import {
  getAt,
  SECTIONS_CONFIG,
  type SectionConfig,
  type SimpleFieldDef,
} from "@/lib/site-content/fields";
import type { SectionKey } from "@/lib/site-content/preview-bridge";
import { DEFAULT_SECTION_ORDER, type HomeContent } from "@/lib/site-content/schema";

const ICON_MAP: Record<string, React.ReactNode> = {
  IconRocket: <IconRocket size={18} />,
  IconMenu2: <IconMenu2 size={18} />,
  IconSpeakerphone: <IconSpeakerphone size={18} />,
  IconNavigation: <IconNavigation size={18} />,
  IconBolt: <IconBolt size={18} />,
  IconSparkles: <IconSparkles size={18} />,
  IconUsers: <IconUsers size={18} />,
  IconPackage: <IconPackage size={18} />,
  IconBuildingStore: <IconBuildingStore size={18} />,
  IconChecklist: <IconChecklist size={18} />,
  IconRoute: <IconRoute size={18} />,
  IconBuilding: <IconBuilding size={18} />,
  IconCash: <IconCash size={18} />,
  IconMessageCircle: <IconMessageCircle size={18} />,
  IconHelpCircle: <IconHelpCircle size={18} />,
  IconNews: <IconNews size={18} />,
  IconMail: <IconMail size={18} />,
  IconLayoutBottombar: <IconLayoutBottombar size={18} />,
};


export default function SectionPanel({
  content,
  onChange,
  onResetSection,
  expandedSections,
  onToggleSection,
}: {
  content: HomeContent;
  onChange: (path: string, value: any) => void;
  onResetSection: (sectionKey: SectionKey) => void;
  expandedSections: Record<SectionKey, boolean>;
  onToggleSection: (sectionKey: SectionKey) => void;
}) {
  const categories = ["GIAO DIỆN & MÀU SẮC", "TRANG CHỦ", "ĐIỀU HƯỚNG & LIÊN HỆ"] as const;

  const defaultOrder = [...DEFAULT_SECTION_ORDER];
  const currentOrder =
    Array.isArray(content.sectionOrder) && content.sectionOrder.length > 0
      ? [
          ...content.sectionOrder.filter((k) => defaultOrder.includes(k as any)),
          ...defaultOrder.filter((k) => !content.sectionOrder.includes(k)),
        ]
      : defaultOrder;

  const handleMoveSection = (key: string, direction: "up" | "down") => {
    const idx = currentOrder.indexOf(key);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;

    const next = [...currentOrder];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    onChange("sectionOrder", next);
  };

  const renderSectionBody = (sec: SectionConfig) => {
    if (sec.key === "theme") {
      return (
        <ThemeSection
          theme={content.theme}
          onChange={(newTheme) => onChange("theme", newTheme)}
        />
      );
    }

    if (sec.key === "nav") {
      return (
        <NavSection
          nav={content.nav}
          onChange={(newNav) => onChange("nav", newNav)}
        />
      );
    }

    if (sec.key === "marquee") {
      return (
        <MarqueeSection
          marquee={content.marquee}
          onChange={(newMarquee) => onChange("marquee", newMarquee)}
        />
      );
    }

    if (sec.key === "footer") {
      return (
        <FooterSection
          footer={content.footer}
          onChange={(newFooter) => onChange("footer", newFooter)}
        />
      );
    }

    if (sec.key === "hero") {
      return (
        <HeroSection
          hero={content.hero}
          onChange={(newHero) => onChange("hero", newHero)}
        />
      );
    }

    if (sec.key === "about") {
      return (
        <AboutSection
          about={content.about}
          onChange={(newAbout) => onChange("about", newAbout)}
        />
      );
    }

    if (sec.key === "modules") {
      return (
        <ModulesSection
          modules={content.modules}
          onChange={(newModules) => onChange("modules", newModules)}
        />
      );
    }

    if (sec.key === "features") {
      return (
        <FeaturesSection
          features={content.features}
          onChange={(newFeatures) => onChange("features", newFeatures)}
        />
      );
    }

    if (sec.key === "process") {
      return (
        <ProcessSection
          process={content.process}
          onChange={(newProcess) => onChange("process", newProcess)}
        />
      );
    }

    if (sec.key === "segments") {
      return (
        <SegmentsSection
          segments={content.segments}
          onChange={(newSegments) => onChange("segments", newSegments)}
        />
      );
    }

    if (sec.key === "pricing") {
      return (
        <PricingSection
          pricing={content.pricing}
          onChange={(newPricing) => onChange("pricing", newPricing)}
        />
      );
    }

    if (sec.key === "testimonials") {
      return (
        <TestimonialsSection
          testimonials={content.testimonials}
          onChange={(newTestimonials) => onChange("testimonials", newTestimonials)}
        />
      );
    }

    if (sec.key === "faq") {
      return (
        <FAQSection
          faq={content.faq}
          onChange={(newFAQ) => onChange("faq", newFAQ)}
        />
      );
    }

    if (sec.key === "articles") {
      return (
        <ArticlesSection
          articles={content.articles}
          onChange={(newArticles) => onChange("articles", newArticles)}
        />
      );
    }


    if (sec.key === "partners") {
      return (
        <PartnersSection
          partners={content.partners}
          onChange={(newPartners) => onChange("partners", newPartners)}
        />
      );
    }

    if (sec.key === "cta") {
      return (
        <CTASection
          cta={content.cta}
          onChange={(newCTA) => onChange("cta", newCTA)}
        />
      );
    }


    return (
      <Box>
        {sec.fields.map((field) => {
          const val = getAt(content, field.path);

          if (field.type === "list") {
            return (
              <ListField
                key={field.key}
                field={field}
                items={Array.isArray(val) ? val : []}
                onChange={(newItems) => onChange(field.path, newItems)}
              />
            );
          }

          return (
            <FieldInput
              key={field.key}
              field={field as SimpleFieldDef}
              value={val}
              onChange={(newVal) => onChange(field.path, newVal)}
            />
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
      {categories.map((category) => {
        let sections = SECTIONS_CONFIG.filter((s) => s.category === category);
        if (sections.length === 0) return null;

        // Nếu là danh mục TRANG CHỦ, tự động sắp xếp các accordion theo thứ tự sectionOrder hiện tại
        if (category === "TRANG CHỦ") {
          sections = [...sections].sort((a, b) => {
            const idxA = currentOrder.indexOf(a.key);
            const idxB = currentOrder.indexOf(b.key);
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });
        }

        return (
          <Box key={category}>
            {/* Category Header */}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "text.secondary",
                px: 1,
                mb: 1.5,
                display: "block",
                fontSize: "11px",
              }}
            >
              {category}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {sections.map((sec) => {
                const isExpanded = Boolean(expandedSections[sec.key]);
                const orderIdx = currentOrder.indexOf(sec.key);
                const isReorderable = orderIdx !== -1;
                const canMoveUp = orderIdx > 0;
                const canMoveDown = orderIdx < currentOrder.length - 1;

                return (
                  <Accordion
                    key={sec.key}
                    expanded={isExpanded}
                    onChange={() => onToggleSection(sec.key)}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: isExpanded ? "primary.main" : "divider",
                      borderRadius: "10px !important",
                      overflow: "hidden",
                      bgcolor: "background.paper",
                      "&:before": { display: "none" },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <AccordionSummary
                      component="div"
                      expandIcon={<IconChevronDown size={18} />}
                      sx={{
                        px: 2,
                        minHeight: 48,
                        cursor: "pointer",
                        "& .MuiAccordionSummary-content": {
                          my: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mr: 1,
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Box sx={{ color: isExpanded ? "primary.main" : "text.secondary", display: "flex" }}>
                          {ICON_MAP[sec.iconName] || <IconPackage size={18} />}
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "13.5px" }}>
                          {sec.title}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {/* Nút mũi tên đổi thứ tự vị trí khối */}
                        {isReorderable && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mr: 0.5 }}>
                            <Tooltip title="Di chuyển khối này lên trên">
                              <span>
                                <IconButton
                                  component="span"
                                  size="small"
                                  disabled={!canMoveUp}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveSection(sec.key, "up");
                                  }}
                                  sx={{
                                    p: 0.4,
                                    color: "text.secondary",
                                    "&:hover": { color: "primary.main", bgcolor: "action.hover" },
                                    "&.Mui-disabled": { opacity: 0.25 },
                                  }}
                                >
                                  <IconArrowUp size={15} />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Di chuyển khối này xuống dưới">
                              <span>
                                <IconButton
                                  component="span"
                                  size="small"
                                  disabled={!canMoveDown}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveSection(sec.key, "down");
                                  }}
                                  sx={{
                                    p: 0.4,
                                    color: "text.secondary",
                                    "&:hover": { color: "primary.main", bgcolor: "action.hover" },
                                    "&.Mui-disabled": { opacity: 0.25 },
                                  }}
                                >
                                  <IconArrowDown size={15} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        )}

                        <Tooltip title={`Đặt lại "${sec.title}" về mặc định`}>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<IconRotate size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onResetSection(sec.key);
                            }}
                            sx={{
                              fontSize: "12px",
                              py: 0.25,
                              px: 1,
                              minWidth: "auto",
                              textTransform: "none",
                              color: "text.secondary",
                              "&:hover": { color: "primary.main", bgcolor: "action.hover" },
                            }}
                          >
                            Đặt lại
                          </Button>
                        </Tooltip>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails
                      sx={{
                        p: 2,
                        pt: 1.5,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                      }}
                    >
                      {renderSectionBody(sec)}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
