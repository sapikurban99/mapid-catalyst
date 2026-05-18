import { supabase } from "@/lib/supabase";
import DocumentsView from "@/components/DocumentsView";

export const revalidate = 0; // Disable caching

export default async function DocumentsPage() {
  const { data: docsData } = await supabase
    .from("catalyst_documents")
    .select("*");

  return <DocumentsView initialDocuments={docsData || []} />;
}
