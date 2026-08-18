import CustomizerShell from "@/components/admin/customizer/CustomizerShell";
import { getHomeContentForEdit } from "@/lib/site-content/actions";
import { DEFAULT_HOME_CONTENT } from "@/lib/site-content/defaults";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Giao diện trang chủ · OAlpha Admin",
};

export default async function HomeContentPage() {
  const result = await getHomeContentForEdit();

  const content = result.ok ? result.data.content : DEFAULT_HOME_CONTENT;
  const updatedAt = result.ok ? result.data.updatedAt : null;
  const updatedByName = result.ok ? result.data.updatedByName : null;

  return (
    <CustomizerShell
      initialContent={content}
      initialUpdatedAt={updatedAt}
      initialUpdatedByName={updatedByName}
    />
  );
}
