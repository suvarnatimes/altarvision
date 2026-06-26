import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { sanitizeInput } from "@/lib/security/sanitize";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const searchQuery = searchParams.get("searchQuery");
    const featured = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy") || "newest";
    
    // Pagination parameters
    const limitCount = parseInt(searchParams.get("limit") || "12", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    let promptsQuery: any = adminDb.collection("prompts")
      .where("status", "==", "published");

    if (featured === "true") {
      promptsQuery = promptsQuery.where("featured", "==", true);
    }

    if (categoryId) {
      promptsQuery = promptsQuery.where("categoryId", "==", sanitizeInput(categoryId));
    }

    const snapshot = await promptsQuery.get();
    
    let prompts = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        thumbnail: data.thumbnail,
        previewImages: data.previewImages || [],
        tags: data.tags || [],
        price: data.price,
        featured: data.featured,
        status: data.status,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    });

    // Client-side text search (Firestore lacks flexible partial matching out of the box)
    if (searchQuery) {
      const term = sanitizeInput(searchQuery).toLowerCase();
      prompts = prompts.filter((p: any) => 
        p.title.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term) ||
        p.tags.some((t: string) => t.toLowerCase().includes(term))
      );
    }

    // Sort
    if (sortBy === "price-low") {
      prompts.sort((a: any, b: any) => a.price - b.price);
    } else if (sortBy === "price-high") {
      prompts.sort((a: any, b: any) => b.price - a.price);
    } else if (sortBy === "newest") {
      prompts.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Pagination
    const totalCount = prompts.length;
    const startIndex = (page - 1) * limitCount;
    const paginatedPrompts = prompts.slice(startIndex, startIndex + limitCount);

    return NextResponse.json({
      prompts: paginatedPrompts,
      pagination: {
        page,
        limit: limitCount,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limitCount),
      }
    });
  } catch (error: any) {
    console.error("Failed to fetch prompts API:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve prompts" }, { status: 500 });
  }
}
