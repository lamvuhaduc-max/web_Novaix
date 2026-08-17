"use client";

import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
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
  IconPackage,
  IconRocket,
  IconRotate,
  IconRoute,
  IconSparkles,
  IconSpeakerphone,
  IconUsers,
} from "@tabler/icons-react";
import CTASection from "./CTASection";
import FieldInput from "./FieldInput";
import FooterSection from "./FooterSection";
import ListField from "./ListField";
import MarqueeSection from "./MarqueeSection";
import NavSection from "./NavSection";
import PricingSection from "./PricingSection";
import ThemeSection from "./ThemeSection";



import {
  getAt,
  SECTIONS_CONFIG,
  type SectionConfig,
  type SimpleFieldDef,
} from "@/lib/site-content/fields";
import type { SectionKey } from "@/lib/site-content/preview-bridge";
import type { HomeContent } from "@/lib/site-content/schema";

const ICON_MAP: Record<string, React.ReactNode> = {
  IconRocket: <IconRocket size={18} />,
  IconMenu2: <IconMenu2 size={18} />,
  IconSpeakerphone: <IconSpeakerphone size={18} />,
  IconNavigation: <IconNavigation size={18} />,
  IconBolt: <IconBolt size={18} />,
  IconSparkles: <IconSparkles size={18} />,
  IconUsers: <IconUsers size={18} />,
  IconPackage: <IconPackage size={18} />,
  IconChecklist: <IconChecklist size={18} />,
  IconRoute: <IconRoute size={18} />,
  IconBuilding: <IconBuilding size={18} />,
  IconCash: <IconCash size={18} />,
  IconMessageCircle: <IconMessageCircle size={18} />,
  IconHelpCircle: <IconHelpCircle size={18} />,
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

    if (sec.key === "pricing") {
      return (
        <PricingSection
          pricing={content.pricing}
          onChange={(newPricing) => onChange("pricing", newPricing)}
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
        const sections = SECTIONS_CONFIG.filter((s) => s.category === category);
        if (sections.length === 0) return null;

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
