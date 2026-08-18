/**
 * @deprecated
 * File này đã được chuyển giao cho hệ thống Quản lý nội dung trang chủ (Customizer).
 * Dữ liệu mặc định chuẩn nằm ở `lib/site-content/defaults.ts`.
 * Dữ liệu thời gian thực được lưu trong database (`site_settings.home_content`)
 * và chỉnh sửa tại `/admin/giao-dien`.
 */

import { DEFAULT_HOME_CONTENT } from "./site-content/defaults";

export const stats = DEFAULT_HOME_CONTENT.hero.stats;
export const sectors = DEFAULT_HOME_CONTENT.marquee.items;
export const modules = DEFAULT_HOME_CONTENT.modules.items;
export const features = DEFAULT_HOME_CONTENT.features.items;
export const steps = DEFAULT_HOME_CONTENT.process.items;
export const segments = DEFAULT_HOME_CONTENT.segments.items;
export const testimonials = DEFAULT_HOME_CONTENT.testimonials.items;
export const nav = DEFAULT_HOME_CONTENT.nav.items;
